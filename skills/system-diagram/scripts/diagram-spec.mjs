const ELEMENT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REVIEW_ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const SCHEMA_VERSION = 'system-diagram-v1';
const NODE_KINDS = new Set(['default', 'entry', 'service', 'domain', 'repository', 'policy', 'decision', 'feedback', 'success', 'warning', 'risk']);
const EDGE_KINDS = new Set(['primary', 'secondary', 'boundary', 'feedback', 'success', 'warning', 'risk']);
const GROUP_KINDS = new Set(['boundary', 'ownership', 'proposed']);

export { SCHEMA_VERSION };

export function normalizeSpec(spec) {
  if (!isObject(spec)) throw new Error('diagram spec must be an object');
  requireOnly(spec, ['schemaVersion', 'id', 'title', 'desc', 'reviewPrefix', 'reviewId', 'canvas', 'padding', 'motion', 'groups', 'nodes', 'edges'], 'diagram spec');
  if (spec.schemaVersion !== SCHEMA_VERSION) throw new Error(`diagram schemaVersion must equal "${SCHEMA_VERSION}"`);
  if (!spec.id) throw new Error('diagram spec requires an id');
  validateElementId(spec.id, 'diagram');
  requireText(spec.title, 'diagram title');
  requireText(spec.desc, 'diagram desc');
  if (!Array.isArray(spec.nodes) || spec.nodes.length === 0) throw new Error('diagram spec requires nodes[]');
  if (!Array.isArray(spec.edges)) throw new Error('diagram spec requires edges[]');
  if (spec.groups !== undefined && !Array.isArray(spec.groups)) throw new Error('diagram spec groups must be an array');

  const reviewPrefix = spec.reviewPrefix ?? '';
  if (reviewPrefix) validateReviewId(reviewPrefix, 'reviewPrefix');
  const elementIds = new Set();
  const nodeIds = new Set();
  const nodesById = new Map();

  const groups = (spec.groups ?? []).map((group) => {
    requireOnly(group, ['id', 'reviewId', 'label', 'kind', 'x', 'y', 'width', 'height', 'revealDelay'], `group ${group?.id ?? '<missing>'}`);
    validateElement(group, 'group', elementIds);
    requireText(group.label, `group ${group.id} label`);
    validateBox(group, `group ${group.id}`);
    const normalizedGroup = { kind: 'boundary', revealDelay: 0, ...group };
    requireEnum(normalizedGroup.kind, GROUP_KINDS, `group ${group.id} kind`);
    validateRevealDelay(normalizedGroup, `group ${group.id}`);
    return normalizedGroup;
  });

  const nodes = spec.nodes.map((node) => {
    requireOnly(node, ['id', 'reviewId', 'kind', 'x', 'y', 'width', 'height', 'text', 'fontSize', 'revealDelay'], `node ${node?.id ?? '<missing>'}`);
    validateElement(node, 'node', elementIds);
    nodeIds.add(node.id);
    nodesById.set(node.id, node);
    validateBox(node, `node ${node.id}`);
    requireText(node.text, `node ${node.id} text`);
    const normalizedNode = { kind: 'default', fontSize: 16, revealDelay: 0, ...node, text: node.text.trim() };
    requireEnum(normalizedNode.kind, NODE_KINDS, `node ${node.id} kind`);
    validateFontSize(normalizedNode.fontSize, `node ${node.id}`);
    validateNodeTextFit(normalizedNode);
    validateRevealDelay(normalizedNode, `node ${node.id}`);
    return normalizedNode;
  });

  const edges = spec.edges.map((edge) => {
    requireOnly(edge, ['id', 'reviewIds', 'from', 'to', 'kind', 'x', 'y', 'points', 'label', 'labelPosition', 'fontSize', 'revealDelay'], `edge ${edge?.id ?? '<missing>'}`);
    validateElement(edge, 'edge', elementIds);
    if (edge.reviewIds !== undefined) {
      requireOnly(edge.reviewIds, ['edge', 'label'], `edge ${edge.id} reviewIds`);
      if (edge.reviewIds.edge !== undefined) requireText(edge.reviewIds.edge, `edge ${edge.id} reviewIds.edge`);
      if (edge.reviewIds.label !== undefined) requireText(edge.reviewIds.label, `edge ${edge.id} reviewIds.label`);
    }
    if (!nodeIds.has(edge.from)) throw new Error(`edge ${edge.id} references unknown source ${edge.from ?? '<missing>'}`);
    if (!nodeIds.has(edge.to)) throw new Error(`edge ${edge.id} references unknown target ${edge.to ?? '<missing>'}`);
    for (const key of ['x', 'y']) if (!Number.isFinite(edge[key])) throw new Error(`edge ${edge.id} requires numeric ${key}`);
    if (!Array.isArray(edge.points) || edge.points.length < 2) throw new Error(`edge ${edge.id} requires at least two points`);
    if (edge.points.some((point) => !isPoint(point))) throw new Error(`edge ${edge.id} points must be numeric [x, y] pairs`);
    validateEdgePath(edge, nodesById.get(edge.from), nodesById.get(edge.to));
    requireText(edge.label, `edge ${edge.id} label`);
    if (edge.labelPosition !== undefined && !isPoint(edge.labelPosition)) throw new Error(`edge ${edge.id} labelPosition must be a numeric [x, y] pair`);
    const normalizedEdge = { kind: 'primary', fontSize: 14, revealDelay: 0, ...edge, label: edge.label.trim() };
    requireEnum(normalizedEdge.kind, EDGE_KINDS, `edge ${edge.id} kind`);
    validateFontSize(normalizedEdge.fontSize, `edge ${edge.id}`);
    validateRevealDelay(normalizedEdge, `edge ${edge.id}`);
    return normalizedEdge;
  });

  if (spec.canvas !== undefined && !isObject(spec.canvas)) throw new Error('diagram canvas must be an object');
  validateEdgeLabelClearance(nodes, edges);

  const canvas = { grid: true, ...(spec.canvas ?? {}) };
  requireOnly(canvas, ['grid'], 'diagram canvas');
  if (typeof canvas.grid !== 'boolean') throw new Error('diagram canvas.grid must be boolean');

  if (spec.motion !== undefined && !isObject(spec.motion)) throw new Error('diagram motion must be an object');
  const motion = { stepMs: 120, ...(spec.motion ?? {}) };
  requireOnly(motion, ['stepMs'], 'diagram motion');
  if (!Number.isFinite(motion.stepMs) || motion.stepMs < 0) throw new Error('motion.stepMs must be a non-negative number');

  const normalized = {
    ...spec,
    title: spec.title,
    desc: spec.desc,
    reviewPrefix,
    canvas,
    padding: spec.padding ?? 36,
    motion,
    groups,
    nodes,
    edges,
  };
  if (!Number.isFinite(normalized.padding) || normalized.padding < 0) throw new Error('diagram padding must be a non-negative number');
  validateReviewIds(normalized);
  return normalized;
}

export function exportedElementId(spec, id) {
  return `${spec.id}--${id}`;
}

export function reviewId(spec, type, id, explicitSuffix) {
  const namespace = [spec.reviewPrefix, spec.id].filter(Boolean).join('.');
  const suffix = explicitSuffix ?? `${type}${id ? `.${id}` : ''}`;
  return `${namespace}.${suffix}`;
}

export function assertSelfContainedSvg(svg) {
  if (typeof svg !== 'string' || !svg.includes('<svg')) throw new Error('renderer did not produce SVG');
  const assetUrls = [
    ...svg.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi),
    ...svg.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi),
  ].map((match) => match[1]);
  const external = assetUrls.find((url) => !url.startsWith('data:') && !url.startsWith('#'));
  if (external || /@import\s+/i.test(svg)) throw new Error(`generated SVG contains a non-embedded asset URL${external ? `: ${external}` : ''}`);
  if (/<(?:script|foreignObject)\b|\son[a-z]+\s*=/i.test(svg)) throw new Error('generated SVG contains executable or foreign content');
}

function validateElement(element, type, ids) {
  if (!element?.id) throw new Error(`every ${type} requires an id`);
  validateElementId(element.id, type);
  if (ids.has(element.id)) throw new Error(`duplicate element id ${element.id}`);
  ids.add(element.id);
}

function validateBox(item, label) {
  for (const key of ['x', 'y']) if (!Number.isFinite(item[key])) throw new Error(`${label} requires numeric ${key}`);
  for (const key of ['width', 'height']) if (!Number.isFinite(item[key]) || item[key] <= 0) throw new Error(`${label} requires positive ${key}`);
}

function validateNodeTextFit(node) {
  const lines = node.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const detailSize = Math.max(14, node.fontSize - 2);
  const availableWidth = node.width - 40;
  const tooWide = lines.find((line, index) => line.length * (index === 0 ? node.fontSize : detailSize) * .56 > availableWidth);
  if (tooWide) throw new Error(`node ${node.id} text line is wider than its content area; wrap the line or widen the node`);
  const hasKind = node.kind !== 'default';
  const titleBaseline = hasKind ? 47 : lines.length > 1 ? 37 : node.height / 2 + node.fontSize * .34;
  const finalBaseline = lines.length > 1 ? titleBaseline + 23 + (lines.length - 2) * (detailSize + 5) : titleBaseline;
  if (finalBaseline > node.height - 13) throw new Error(`node ${node.id} text is taller than its content area; increase node height or reduce lines`);
}

function validateEdgePath(edge, source, target) {
  const points = edge.points.map(([x, y]) => [edge.x + x, edge.y + y]);
  for (let index = 0; index < points.length - 1; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[index + 1];
    if (x1 === x2 && y1 === y2) throw new Error(`edge ${edge.id} contains a zero-length segment`);
    if (x1 !== x2 && y1 !== y2) throw new Error(`edge ${edge.id} segments must be orthogonal`);
  }
  if (!pointOnBoundary(points[0], source)) throw new Error(`edge ${edge.id} start must lie on source node ${edge.from} boundary`);
  if (!pointOnBoundary(points.at(-1), target)) throw new Error(`edge ${edge.id} end must lie on target node ${edge.to} boundary`);
}

function pointOnBoundary([x, y], node) {
  const epsilon = .01;
  const insideX = x >= node.x - epsilon && x <= node.x + node.width + epsilon;
  const insideY = y >= node.y - epsilon && y <= node.y + node.height + epsilon;
  const onVertical = Math.abs(x - node.x) <= epsilon || Math.abs(x - (node.x + node.width)) <= epsilon;
  const onHorizontal = Math.abs(y - node.y) <= epsilon || Math.abs(y - (node.y + node.height)) <= epsilon;
  return insideX && insideY && (onVertical || onHorizontal);
}

function validateEdgeLabelClearance(nodes, edges) {
  for (const edge of edges) {
    const lines = edge.label.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const width = Math.max(62, ...lines.map((line) => line.length * edge.fontSize * .56 + 22));
    const height = lines.length * (edge.fontSize + 5) + 9;
    const [x, y] = edge.labelPosition ?? automaticLabelPosition(edge, width, height);
    const labelBox = { left: x - width / 2, right: x + width / 2, top: y - height / 2, bottom: y + height / 2 };
    const collision = nodes.find((node) => boxesOverlap(labelBox, { left: node.x, right: node.x + node.width, top: node.y, bottom: node.y + node.height }, 3));
    if (collision) throw new Error(`edge ${edge.id} label overlaps node ${collision.id}; route through more whitespace or set labelPosition`);
  }
}

function automaticLabelPosition(edge, width, height) {
  const points = edge.points.map(([x, y]) => [edge.x + x, edge.y + y]);
  let segment = [points[0], points[1]];
  let longest = -1;
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    if (length > longest) { longest = length; segment = [start, end]; }
  }
  const [[x1, y1], [x2, y2]] = segment;
  const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
  return [
    (x1 + x2) / 2 + (horizontal ? 0 : width / 2 + 10),
    (y1 + y2) / 2 + (horizontal ? -height / 2 - 8 : 0),
  ];
}

function boxesOverlap(a, b, clearance) {
  return a.left < b.right + clearance && a.right > b.left - clearance && a.top < b.bottom + clearance && a.bottom > b.top - clearance;
}

function validateFontSize(value, label) {
  if (!Number.isFinite(value) || value < 14 || value > 28) throw new Error(`${label} fontSize must be between 14 and 28`);
}

function validateRevealDelay(item, label) {
  if (!Number.isFinite(item.revealDelay) || item.revealDelay < 0) throw new Error(`${label} revealDelay must be a non-negative number`);
}

function validateReviewIds(spec) {
  const ids = [
    reviewId(spec, 'svg', undefined, spec.reviewId),
    ...spec.groups.map((group) => reviewId(spec, 'group', group.id, group.reviewId)),
    ...spec.nodes.map((node) => reviewId(spec, 'node', node.id, node.reviewId)),
    ...spec.edges.flatMap((edge) => [
      reviewId(spec, 'edge', edge.id, edge.reviewIds?.edge),
      reviewId(spec, 'edge-label', edge.id, edge.reviewIds?.label),
    ]),
  ];
  const seen = new Set();
  for (const id of ids) {
    validateReviewId(id, 'review ID');
    if (seen.has(id)) throw new Error(`duplicate review ID ${id}`);
    seen.add(id);
  }
}

function requireOnly(value, allowed, label) {
  if (!isObject(value)) throw new Error(`${label} must be an object`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`${label}.${key} is unsupported`);
}

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be non-empty text`);
  if (/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/u.test(value)) {
    throw new Error(`${label} contains an XML-invalid control character`);
  }
}

function requireEnum(value, allowed, label) {
  if (!allowed.has(value)) throw new Error(`${label} must be one of: ${[...allowed].join(', ')}`);
}

function validateElementId(id, label) {
  if (!ELEMENT_ID.test(id)) throw new Error(`${label} id "${id}" must use lowercase kebab notation`);
}

function validateReviewId(id, label) {
  if (typeof id !== 'string' || !REVIEW_ID.test(id)) throw new Error(`${label} "${id}" must use lowercase dot/kebab notation`);
}

function isPoint(value) {
  return Array.isArray(value) && value.length === 2 && value.every(Number.isFinite);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
