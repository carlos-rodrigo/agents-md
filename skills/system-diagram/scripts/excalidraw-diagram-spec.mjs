const ELEMENT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REVIEW_ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const EMBEDDABLE_FONTS = new Set([undefined, 'virgil', 'cascadia', 'mono']);

export function normalizeSpec(spec) {
  if (!spec?.id) throw new Error('diagram spec requires an id');
  validateElementId(spec.id, 'diagram');
  if (!Array.isArray(spec.nodes) || spec.nodes.length === 0) throw new Error('diagram spec requires nodes[]');
  if (!Array.isArray(spec.edges)) throw new Error('diagram spec requires edges[]');

  const reviewPrefix = spec.reviewPrefix ?? '';
  if (reviewPrefix) validateReviewId(reviewPrefix, 'reviewPrefix');
  const elementIds = new Set();
  const nodeIds = new Set();
  const nodes = spec.nodes.map((node) => {
    validateElement(node, 'node', elementIds);
    nodeIds.add(node.id);
    for (const key of ['x', 'y']) {
      if (!Number.isFinite(node[key])) throw new Error(`node ${node.id} requires numeric ${key}`);
    }
    for (const key of ['width', 'height']) {
      if (!Number.isFinite(node[key]) || node[key] <= 0) throw new Error(`node ${node.id} requires positive ${key}`);
    }
    validateFont(node.fontFamily, `node ${node.id}`);
    const text = node.text ?? [node.title, node.subtitle, node.meta].filter(Boolean).join('\n');
    if (typeof text !== 'string' || !text.trim()) throw new Error(`node ${node.id} requires non-empty text`);
    const normalizedNode = {
      kind: 'default',
      strokeWidth: 2,
      roughness: 1,
      fontSize: 18,
      ...node,
      text,
    };
    validateDrawingOverrides(normalizedNode, `node ${node.id}`);
    return normalizedNode;
  });

  const edges = spec.edges.map((edge) => {
    validateElement(edge, 'edge', elementIds);
    if (!nodeIds.has(edge.from)) throw new Error(`edge ${edge.id} references unknown source ${edge.from ?? '<missing>'}`);
    if (!nodeIds.has(edge.to)) throw new Error(`edge ${edge.id} references unknown target ${edge.to ?? '<missing>'}`);
    for (const key of ['x', 'y']) {
      if (!Number.isFinite(edge[key])) throw new Error(`edge ${edge.id} requires numeric ${key}`);
    }
    if (!Array.isArray(edge.points) || edge.points.length < 2) {
      throw new Error(`edge ${edge.id} requires at least two points`);
    }
    if (edge.points.some((point) => !Array.isArray(point) || point.length !== 2 || point.some((value) => !Number.isFinite(value)))) {
      throw new Error(`edge ${edge.id} points must be numeric [x, y] pairs`);
    }
    if (typeof edge.label !== 'string' || !edge.label.trim()) {
      throw new Error(`edge ${edge.id} requires a non-empty label`);
    }
    validateFont(edge.fontFamily, `edge ${edge.id}`);
    const normalizedEdge = {
      kind: 'default',
      strokeWidth: 2,
      roughness: 1,
      fontSize: 15,
      ...edge,
      label: edge.label.trim(),
    };
    validateDrawingOverrides(normalizedEdge, `edge ${edge.id}`);
    return normalizedEdge;
  });

  const normalized = {
    ...spec,
    title: spec.title ?? spec.id,
    desc: spec.desc ?? 'Excalidraw system diagram.',
    reviewPrefix,
    backgroundColor: spec.backgroundColor ?? '#fffdf8',
    padding: spec.padding ?? 30,
    motion: { stepMs: 230, ...(spec.motion ?? {}) },
    nodes,
    edges,
  };
  if (typeof normalized.title !== 'string' || !normalized.title.trim()) throw new Error('diagram title must be non-empty');
  if (typeof normalized.desc !== 'string' || !normalized.desc.trim()) throw new Error('diagram desc must be non-empty');
  if (!Number.isFinite(normalized.padding) || normalized.padding < 0) throw new Error('diagram padding must be a non-negative number');
  if (!Number.isFinite(normalized.motion.stepMs) || normalized.motion.stepMs < 0) throw new Error('motion.stepMs must be a non-negative number');
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
  if (external || /@import\s+/i.test(svg)) {
    throw new Error(`generated SVG contains a non-embedded asset URL${external ? `: ${external}` : ''}`);
  }
}

function validateElement(element, type, ids) {
  if (!element?.id) throw new Error(`every ${type} requires an id`);
  validateElementId(element.id, type);
  if (ids.has(element.id)) throw new Error(`duplicate element id ${element.id}`);
  ids.add(element.id);
}

function validateElementId(id, label) {
  if (!ELEMENT_ID.test(id)) throw new Error(`${label} id "${id}" must use lowercase kebab notation`);
}

function validateFont(font, label) {
  if (!EMBEDDABLE_FONTS.has(font)) {
    throw new Error(`${label} fontFamily must be virgil, cascadia, or mono; local fonts are not self-contained`);
  }
}

function validateDrawingOverrides(item, label) {
  if (!Number.isFinite(item.fontSize) || item.fontSize <= 0) throw new Error(`${label} fontSize must be positive`);
  if (!Number.isFinite(item.strokeWidth) || item.strokeWidth <= 0) throw new Error(`${label} strokeWidth must be positive`);
  if (!Number.isFinite(item.roughness) || item.roughness < 0) throw new Error(`${label} roughness must be non-negative`);
  if (item.revealDelay !== undefined && (!Number.isFinite(item.revealDelay) || item.revealDelay < 0)) {
    throw new Error(`${label} revealDelay must be a non-negative number`);
  }
}

function validateReviewIds(spec) {
  const ids = [
    reviewId(spec, 'svg', undefined, spec.reviewId),
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

function validateReviewId(id, label) {
  if (typeof id !== 'string' || !REVIEW_ID.test(id)) {
    throw new Error(`${label} "${id}" must use lowercase dot/kebab notation`);
  }
}
