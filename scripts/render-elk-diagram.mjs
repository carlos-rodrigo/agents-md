#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ELK from 'elkjs/lib/elk.bundled.js';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const stdoutOnly = args.includes('--stdout');
const positional = args.filter((arg) => !arg.startsWith('--'));

if (args.includes('--help') || positional.length < 1 || (!stdoutOnly && positional.length < 2)) {
  console.log(`Usage: render-elk-diagram.mjs [--check] [--stdout] <diagram.json> [output.svg]

Build-time ELK.js layout renderer for self-contained report diagrams.
Input JSON describes nodes, edges, labels, and review IDs. Output is inline-SVG
compatible with html-report-designer/system-diagram CSS primitives.`);
  process.exit(args.includes('--help') ? 0 : 2);
}

const inputPath = resolve(positional[0]);
const outputPath = positional[1] ? resolve(positional[1]) : null;
const spec = JSON.parse(readFileSync(inputPath, 'utf8'));
const svg = await renderElkDiagram(spec);

if (stdoutOnly) {
  process.stdout.write(`${svg}\n`);
  process.exit(0);
}

if (checkOnly) {
  const current = readFileSync(outputPath, 'utf8');
  if (current.trim() !== svg.trim()) {
    console.error(`✗ ${outputPath} is stale. Run \`node scripts/render-elk-diagram.mjs ${positional[0]} ${positional[1]}\`.`);
    process.exit(1);
  }
  console.log(`✓ ${outputPath} is current`);
  process.exit(0);
}

writeFileSync(outputPath, `${svg}\n`);
console.log(`✓ rendered ${outputPath}`);

async function renderElkDiagram(rawSpec) {
  const spec = normalizeSpec(rawSpec);
  const elk = new ELK();
  const graph = await elk.layout(toElkGraph(spec));
  return toSvg(spec, graph);
}

function normalizeSpec(spec) {
  if (!spec?.id) throw new Error('diagram spec requires an id');
  if (!Array.isArray(spec.nodes) || spec.nodes.length === 0) throw new Error('diagram spec requires nodes[]');
  if (!Array.isArray(spec.edges)) throw new Error('diagram spec requires edges[]');

  const nodes = spec.nodes.map((node) => ({
    width: 220,
    height: 116,
    kind: 'default',
    subtitle: '',
    meta: '',
    ...node,
  }));
  const nodeIds = new Set(nodes.map((node) => node.id));
  for (const edge of spec.edges) {
    if (!nodeIds.has(edge.from)) throw new Error(`edge ${edge.id} references unknown source ${edge.from}`);
    if (!nodeIds.has(edge.to)) throw new Error(`edge ${edge.id} references unknown target ${edge.to}`);
  }

  return {
    direction: 'RIGHT',
    reviewPrefix: 'diagram',
    title: spec.id,
    desc: 'ELK-laid-out diagram.',
    padding: 48,
    ...spec,
    nodes,
    edges: spec.edges.map((edge) => ({ kind: 'default', label: '', detail: '', ...edge })),
  };
}

function toElkGraph(spec) {
  return {
    id: spec.id,
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': spec.direction,
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.spacing.nodeNode': String(spec.spacing?.nodeNode ?? 48),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(spec.spacing?.rank ?? 72),
      'elk.spacing.edgeNode': String(spec.spacing?.edgeNode ?? 32),
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.layered.mergeEdges': 'false',
      ...spec.layoutOptions,
    },
    children: spec.nodes.map((node) => ({ id: node.id, width: node.width, height: node.height })),
    edges: spec.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.from],
      targets: [edge.to],
      labels: spec.layoutEdgeLabels && edge.label
        ? [{ text: `${edge.label}${edge.detail ? ` ${edge.detail}` : ''}`, width: estimateLabelWidth(edge), height: edge.detail ? 48 : 32 }]
        : [],
    })),
  };
}

function toSvg(spec, graph) {
  const pad = spec.padding;
  const width = Math.ceil((graph.width ?? 0) + pad * 2);
  const height = Math.ceil((graph.height ?? 0) + pad * 2);
  const nodeById = new Map(graph.children.map((node) => [node.id, node]));
  const edgeById = new Map(graph.edges.map((edge) => [edge.id, edge]));
  const markerId = `${spec.id}-arrow`.replace(/[^a-zA-Z0-9_-]/g, '-');
  const boundaryMarkerId = `${spec.id}-boundary-arrow`.replace(/[^a-zA-Z0-9_-]/g, '-');
  const titleId = `${spec.id}-title`.replace(/[^a-zA-Z0-9_-]/g, '-');
  const descId = `${spec.id}-desc`.replace(/[^a-zA-Z0-9_-]/g, '-');

  const edgeElements = spec.edges.map((edge, index) => renderEdge(spec, edge, edgeById.get(edge.id), pad, markerId, boundaryMarkerId, index)).join('\n');
  const nodeElements = spec.nodes.map((node, index) => renderNode(spec, node, nodeById.get(node.id), pad, index)).join('\n');
  const labelElements = spec.edges
    .filter((edge) => edge.label)
    .map((edge, index) => renderEdgeLabel(spec, edge, edgeById.get(edge.id), pad, index))
    .join('\n');

  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${titleId} ${descId}" xmlns="http://www.w3.org/2000/svg" data-review-id="${reviewId(spec, 'svg')}">
  <title id="${titleId}">${escapeHtml(spec.title)}</title>
  <desc id="${descId}">${escapeHtml(spec.desc)}</desc>
  <defs>
    <marker id="${markerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--text)" /></marker>
    <marker id="${boundaryMarkerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--info)" /></marker>
  </defs>
  <rect class="diagram-bg" x="0" y="0" width="${width}" height="${height}" />
${edgeElements}
${nodeElements}
${labelElements}
</svg>`;
}

function renderNode(spec, sourceNode, layoutNode, pad, index) {
  if (!layoutNode) throw new Error(`ELK did not return layout for node ${sourceNode.id}`);
  const x = round(layoutNode.x + pad);
  const y = round(layoutNode.y + pad);
  const width = round(layoutNode.width);
  const height = round(layoutNode.height);
  const center = round(x + width / 2);
  const colors = nodeColors(sourceNode.kind);
  const titleLines = wrapText(sourceNode.title, sourceNode.titleWrap ?? 21);
  const titleY = y + 32 - Math.max(0, titleLines.length - 1) * 8;
  const title = titleLines.map((line, lineIndex) => `<text class="diagram-node-title" x="${center}" y="${round(titleY + lineIndex * 17)}" text-anchor="middle">${escapeHtml(line)}</text>`).join('');
  const subtitleY = titleY + titleLines.length * 17 + 10;
  const subtitle = sourceNode.subtitle ? `<text class="diagram-node-subtitle" x="${center}" y="${round(subtitleY)}" text-anchor="middle">${escapeHtml(sourceNode.subtitle)}</text>` : '';
  const meta = sourceNode.meta ? `<text class="diagram-node-meta" x="${center}" y="${round(subtitleY + 28)}" text-anchor="middle">${escapeHtml(sourceNode.meta)}</text>` : '';

  return `  <g class="diagram-node diagram-reveal" style="--reveal-delay: ${index * 70}ms" data-review-id="${reviewId(spec, 'node', sourceNode.id, sourceNode.reviewId)}"><rect class="diagram-node-card" x="${x}" y="${y}" width="${width}" height="${height}" rx="16" fill="${colors.fill}" stroke="${colors.stroke}"/>${title}${subtitle}${meta}</g>`;
}

function renderEdge(spec, sourceEdge, layoutEdge, pad, markerId, boundaryMarkerId, index) {
  const points = edgePoints(layoutEdge, pad);
  const d = pointsToPath(points);
  const klass = sourceEdge.kind === 'boundary' ? 'diagram-arrow-boundary' : 'diagram-arrow';
  const marker = sourceEdge.kind === 'boundary' ? boundaryMarkerId : markerId;
  const delay = spec.nodes.length * 70 + index * 60;
  return `  <g class="diagram-edge diagram-reveal" style="--reveal-delay: ${delay}ms" data-review-id="${reviewId(spec, 'edge', sourceEdge.id, sourceEdge.reviewIds?.edge)}"><path class="${klass} path-draw" pathLength="1" d="${d}" marker-end="url(#${marker})"/></g>`;
}

function renderEdgeLabel(spec, sourceEdge, layoutEdge, pad, index) {
  const label = layoutEdge?.labels?.[0];
  const width = estimateLabelWidth(sourceEdge);
  const height = sourceEdge.detail ? 48 : 32;
  const routedPoints = edgePoints(layoutEdge, pad);
  const fallback = labelPosition(routedPoints, width, height, pad);
  const x = round((Number.isFinite(label?.x) ? label.x + pad : fallback.x));
  const y = round((Number.isFinite(label?.y) ? label.y + pad : fallback.y));
  const textX = round(x + width / 2);
  const textY = round(y + (sourceEdge.detail ? 20 : 21));
  const detail = sourceEdge.detail ? `<tspan class="diagram-label-detail" x="${textX}" dy="16">${escapeHtml(sourceEdge.detail)}</tspan>` : '';
  const delay = spec.nodes.length * 70 + spec.edges.length * 60 + index * 50;
  return `  <g class="diagram-edge-label diagram-reveal" style="--reveal-delay: ${delay}ms" data-review-id="${reviewId(spec, 'edge-label', sourceEdge.id, sourceEdge.reviewIds?.label)}"><rect class="diagram-label-bg" x="${x}" y="${y}" width="${width}" height="${height}" rx="12"/><text class="diagram-arrow-label" x="${textX}" y="${textY}" text-anchor="middle"><tspan>${escapeHtml(sourceEdge.label)}</tspan>${detail}</text></g>`;
}

function edgePoints(layoutEdge, pad) {
  const section = layoutEdge?.sections?.[0];
  if (!section) throw new Error(`ELK did not return route for edge ${layoutEdge?.id ?? '<unknown>'}`);
  return [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].map((point) => ({ x: round(point.x + pad), y: round(point.y + pad) }));
}

function pointsToPath(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
}

function labelPosition(points, width, height, pad) {
  const segments = [];
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1];
    const b = points[index];
    segments.push({
      a,
      b,
      horizontal: Math.abs(a.y - b.y) <= Math.abs(a.x - b.x),
      length: Math.hypot(a.x - b.x, a.y - b.y),
    });
  }
  const segment = segments.sort((a, b) => b.length - a.length)[0];
  if (!segment) return { x: pad, y: pad };

  if (segment.horizontal) {
    const centerX = (segment.a.x + segment.b.x) / 2;
    const labelY = Math.max(8, segment.a.y - height - 86);
    return { x: Math.max(12, centerX - width / 2), y: labelY };
  }

  const centerY = (segment.a.y + segment.b.y) / 2;
  const leftX = segment.a.x - width - 18;
  return {
    x: leftX > 12 ? leftX : segment.a.x + 18,
    y: Math.max(12, centerY - height / 2 + 16),
  };
}

function nodeColors(kind) {
  switch (kind) {
    case 'entry': return { fill: 'var(--info-soft)', stroke: 'var(--info)' };
    case 'domain': return { fill: 'var(--success-soft)', stroke: 'var(--success)' };
    case 'repository': return { fill: 'var(--warning-soft)', stroke: 'var(--warning)' };
    case 'feedback': return { fill: 'var(--accent-soft)', stroke: 'var(--border-strong)' };
    default: return { fill: 'var(--surface)', stroke: 'var(--border-strong)' };
  }
}

function estimateLabelWidth(edge) {
  const labelLength = Math.max(edge.label?.length ?? 0, edge.detail?.length ?? 0);
  return Math.max(132, Math.min(270, labelLength * 8 + 44));
}

function wrapText(value, maxChars) {
  const words = String(value ?? '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function reviewId(spec, type, id, explicit) {
  if (explicit) return explicit;
  const suffix = id ? `.${id}` : '';
  return `${spec.reviewPrefix}.${type}${suffix}`.toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function round(value) {
  return Number(value.toFixed(1));
}
