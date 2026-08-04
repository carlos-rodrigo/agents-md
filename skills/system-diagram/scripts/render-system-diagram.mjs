#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSelfContainedSvg, exportedElementId, normalizeSpec, reviewId } from './diagram-spec.mjs';

const stylePath = resolve(dirname(fileURLToPath(import.meta.url)), '../resources/infrastructure-diagram.css');
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const stdoutOnly = args.includes('--stdout');
const positional = args.filter((arg) => !arg.startsWith('--'));

if (args.includes('--help') || positional.length < 1 || (!stdoutOnly && positional.length < 2)) {
  console.log(`Usage: render-system-diagram.mjs [--check] [--stdout] <diagram.json> [output.svg]

Deterministic build-time renderer for clean, self-contained infrastructure SVGs.
The JSON source owns semantic nodes, groups, and routed edges. The renderer owns
visual language, accessibility metadata, responsive SVG, and review anchors.`);
  process.exit(args.includes('--help') ? 0 : 2);
}

const inputPath = resolve(positional[0]);
const outputPath = positional[1] ? resolve(positional[1]) : null;
if (outputPath === inputPath) throw new Error('Diagram input JSON and output SVG paths must be different');
const sourceText = readFileSync(inputPath, 'utf8');
const sourceDigest = createHash('sha256').update(sourceText).digest('hex');
const spec = normalizeSpec(JSON.parse(sourceText));
const rendered = renderSystemDiagram(spec);
const svg = rendered.replace('<!-- svg-source:system-diagram -->', `<!-- svg-source:system-diagram --><!-- svg-spec-sha256:${sourceDigest} -->`);
assertSelfContainedSvg(svg);

if (stdoutOnly) {
  process.stdout.write(`${svg}\n`);
  process.exit(0);
}

const outputDocument = `${svg}\n`;

if (checkOnly) {
  if (!existsSync(outputPath)) {
    console.error(`✗ ${outputPath} is missing. Render it before checking.`);
    process.exit(1);
  }
  const current = readFileSync(outputPath, 'utf8');
  if (current !== outputDocument) {
    console.error(`✗ ${outputPath} is stale. Run \`${process.execPath} ${fileURLToPath(import.meta.url)} ${inputPath} ${outputPath}\`.`);
    process.exit(1);
  }
  console.log(`✓ ${outputPath} is current`);
  process.exit(0);
}

writeFileSync(outputPath, outputDocument);
console.log(`✓ rendered ${outputPath}`);

function renderSystemDiagram(spec) {
  const bounds = diagramBounds(spec);
  const namespace = spec.id;
  const titleId = `${namespace}-title`;
  const descId = `${namespace}-desc`;
  const gridId = `${namespace}--grid`;
  const shadowId = `${namespace}--shadow`;
  const markerIds = Object.fromEntries(['primary', 'secondary', 'feedback', 'success', 'warning', 'risk'].map((kind) => [kind, `${namespace}--arrow-${kind}`]));

  const groups = spec.groups.map((group, index) => renderGroup(spec, group, revealDelay(group, index, spec.motion.stepMs))).join('');
  const edges = spec.edges.map((edge, index) => renderEdge(spec, edge, markerIds, revealDelay(edge, index, spec.motion.stepMs))).join('');
  const nodes = spec.nodes.map((node, index) => renderNode(spec, node, shadowId, revealDelay(node, index, spec.motion.stepMs))).join('');
  const labels = spec.edges.map((edge, index) => renderEdgeLabel(spec, edge, revealDelay(edge, index, spec.motion.stepMs) + 48)).join('');

  return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="${format(bounds.x)} ${format(bounds.y)} ${format(bounds.width)} ${format(bounds.height)}" role="img" aria-labelledby="${titleId} ${descId}" data-diagram-style="infrastructure-v1" data-review-id="${escapeAttribute(reviewId(spec, 'svg', undefined, spec.reviewId))}"><title id="${titleId}">${escapeText(spec.title)}</title><desc id="${descId}">${escapeText(spec.desc)}</desc><!-- svg-source:system-diagram --><metadata>{"schemaVersion":"system-diagram-v1","style":"infrastructure-v1"}</metadata><defs>${renderStyle()}${renderDefs(gridId, shadowId, markerIds)}</defs><rect class="diagram-canvas" x="${format(bounds.x)}" y="${format(bounds.y)}" width="${format(bounds.width)}" height="${format(bounds.height)}"></rect>${spec.canvas.grid ? `<rect class="diagram-grid" x="${format(bounds.x)}" y="${format(bounds.y)}" width="${format(bounds.width)}" height="${format(bounds.height)}" fill="url(#${gridId})"></rect>` : ''}<g class="diagram-groups">${groups}</g><g class="diagram-edges">${edges}</g><g class="diagram-nodes">${nodes}</g><g class="diagram-edge-labels">${labels}</g></svg>`;
}

function renderStyle() {
  return `<style>\n${readFileSync(stylePath, 'utf8').trim()}\n</style>`;
}

function renderDefs(gridId, shadowId, markerIds) {
  const marker = (id, color) => `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></marker>`;
  return `<pattern id="${gridId}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#ecece8" stroke-width="1"></path></pattern><filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#171717" flood-opacity=".07"></feDropShadow></filter>${marker(markerIds.primary, '#0070f3')}${marker(markerIds.secondary, '#73736f')}${marker(markerIds.feedback, '#047857')}${marker(markerIds.success, '#047857')}${marker(markerIds.warning, '#b45309')}${marker(markerIds.risk, '#dc2626')}`;
}

function renderGroup(spec, group, delay) {
  const labelWidth = Math.max(96, estimateTextWidth(group.label.toUpperCase(), 14) + 24);
  return `<g class="diagram-group diagram-group--${group.kind} diagram-reveal" style="--reveal-delay:${delay}ms" data-review-id="${escapeAttribute(reviewId(spec, 'group', group.id, group.reviewId))}"><rect class="diagram-group__surface" x="${format(group.x)}" y="${format(group.y)}" width="${format(group.width)}" height="${format(group.height)}" rx="14"></rect><rect class="diagram-group__label-bg" x="${format(group.x + 14)}" y="${format(group.y - 10)}" width="${format(labelWidth)}" height="24" rx="4"></rect><text class="diagram-group__label" x="${format(group.x + 26)}" y="${format(group.y + 8)}">${escapeText(group.label.toUpperCase())}</text></g>`;
}

function renderNode(spec, node, shadowId, delay) {
  const lines = node.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const title = lines[0];
  const details = lines.slice(1);
  const hasKind = node.kind !== 'default';
  const inset = 20;
  const titleY = node.y + (hasKind ? 47 : details.length > 0 ? 37 : node.height / 2 + node.fontSize * .34);
  const detailSize = Math.max(14, node.fontSize - 2);
  const detailStart = titleY + 23;
  const kindLabel = nodeKindLabel(node.kind);
  const textId = exportedElementId(spec, `${node.id}-text`);
  const detailsMarkup = details.map((line, index) => `<tspan x="${format(node.x + inset)}" y="${format(detailStart + index * (detailSize + 5))}">${escapeText(line)}</tspan>`).join('');
  const accent = hasKind ? `<rect class="diagram-node__accent" x="${format(node.x)}" y="${format(node.y + 12)}" width="3" height="${format(node.height - 24)}" rx="1.5"></rect>` : '';
  const kind = hasKind ? `<text class="diagram-node__kind" x="${format(node.x + inset)}" y="${format(node.y + 23)}">${escapeText(kindLabel)}</text>` : '';
  return `<g class="diagram-node diagram-node--${node.kind} diagram-reveal" style="--reveal-delay:${delay}ms" data-review-id="${escapeAttribute(reviewId(spec, 'node', node.id, node.reviewId))}" aria-labelledby="${textId}"><rect class="diagram-node__surface" x="${format(node.x)}" y="${format(node.y)}" width="${format(node.width)}" height="${format(node.height)}" rx="10" filter="url(#${shadowId})"></rect>${accent}<circle class="diagram-node__dot" cx="${format(node.x + node.width - 17)}" cy="${format(node.y + 17)}" r="3.5"></circle>${kind}<text id="${textId}" class="diagram-node__title" x="${format(node.x + inset)}" y="${format(titleY)}" font-size="${format(node.fontSize)}">${escapeText(title)}</text>${details.length > 0 ? `<text class="diagram-node__detail" x="${format(node.x + inset)}" y="${format(detailStart)}" font-size="${format(detailSize)}">${detailsMarkup}</text>` : ''}</g>`;
}

function renderEdge(spec, edge, markerIds, delay) {
  const points = absolutePoints(edge);
  const d = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${format(x)} ${format(y)}`).join('');
  const markerKind = edge.kind === 'boundary' ? 'secondary' : edge.kind;
  return `<g class="diagram-edge diagram-edge--${edge.kind} diagram-reveal" style="--reveal-delay:${delay}ms" data-review-id="${escapeAttribute(reviewId(spec, 'edge', edge.id, edge.reviewIds?.edge))}"><path class="diagram-edge__path" d="${d}" marker-end="url(#${markerIds[markerKind]})"></path></g>`;
}

function renderEdgeLabel(spec, edge, delay) {
  const lines = edge.label.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const fontSize = edge.fontSize;
  const lineHeight = fontSize + 5;
  const width = Math.max(62, ...lines.map((line) => estimateTextWidth(line, fontSize) + 22));
  const height = lines.length * lineHeight + 9;
  const [x, y] = edge.labelPosition ?? automaticLabelPosition(edge, width, height);
  const textY = y - ((lines.length - 1) * lineHeight) / 2 + fontSize * .34;
  const text = lines.map((line, index) => `<tspan x="${format(x)}" y="${format(textY + index * lineHeight)}">${escapeText(line)}</tspan>`).join('');
  return `<g class="diagram-edge-label diagram-edge-label--${edge.kind} diagram-reveal" style="--reveal-delay:${delay}ms" data-review-id="${escapeAttribute(reviewId(spec, 'edge-label', edge.id, edge.reviewIds?.label))}"><rect class="diagram-edge-label__surface" x="${format(x - width / 2)}" y="${format(y - height / 2)}" width="${format(width)}" height="${format(height)}" rx="5"></rect><text class="diagram-edge-label__text" x="${format(x)}" y="${format(textY)}" font-size="${format(fontSize)}" text-anchor="middle">${text}</text></g>`;
}

function automaticLabelPosition(edge, width, height) {
  const points = absolutePoints(edge);
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
  const x = (x1 + x2) / 2 + (horizontal ? 0 : width / 2 + 10);
  const y = (y1 + y2) / 2 + (horizontal ? -height / 2 - 8 : 0);
  return [x, y];
}

function diagramBounds(spec) {
  const boxes = [...spec.groups, ...spec.nodes];
  const coordinates = boxes.flatMap((box) => [[box.x, box.y], [box.x + box.width, box.y + box.height]]);
  for (const edge of spec.edges) {
    coordinates.push(...absolutePoints(edge));
    const lines = edge.label.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const labelWidth = Math.max(62, ...lines.map((line) => estimateTextWidth(line, edge.fontSize) + 22));
    const labelHeight = lines.length * (edge.fontSize + 5) + 9;
    const [labelX, labelY] = edge.labelPosition ?? automaticLabelPosition(edge, labelWidth, labelHeight);
    coordinates.push([labelX - labelWidth / 2, labelY - labelHeight / 2], [labelX + labelWidth / 2, labelY + labelHeight / 2]);
  }
  const xs = coordinates.map(([x]) => x);
  const ys = coordinates.map(([, y]) => y);
  const minX = Math.min(...xs) - spec.padding;
  const minY = Math.min(...ys) - spec.padding;
  const maxX = Math.max(...xs) + spec.padding;
  const maxY = Math.max(...ys) + spec.padding;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function absolutePoints(edge) {
  return edge.points.map(([x, y]) => [edge.x + x, edge.y + y]);
}

function nodeKindLabel(kind) {
  return ({ entry: 'ENTRY', service: 'SERVICE', domain: 'DOMAIN', repository: 'STORAGE', policy: 'POLICY', decision: 'DECISION', feedback: 'PROOF', success: 'OUTCOME', warning: 'WARNING', risk: 'RISK' })[kind] ?? '';
}

function revealDelay(item, index, stepMs) {
  return item.revealDelay > 0 ? item.revealDelay : index * stepMs;
}

function estimateTextWidth(text, fontSize) {
  return text.length * fontSize * .56;
}

function format(value) {
  return Number(value.toFixed(2)).toString();
}

function escapeText(value) {
  return String(value).replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]);
}

function escapeAttribute(value) {
  return escapeText(value).replace(/["']/g, (character) => character === '"' ? '&quot;' : '&#39;');
}
