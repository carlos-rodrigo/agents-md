#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assertSelfContainedSvg, exportedElementId, normalizeSpec, reviewId, SCHEMA_VERSION } from './diagram-spec.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const renderer = resolve(root, 'scripts/render-system-diagram.mjs');
const stylePath = resolve(root, 'skills/system-diagram/resources/infrastructure-diagram.css');
const style = readFileSync(stylePath, 'utf8');
const specPath = resolve(root, 'skills/system-diagram/resources/system-slice-example.json');
const svgPath = resolve(root, 'skills/system-diagram/resources/system-slice-example.svg');
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const svg = readFileSync(svgPath, 'utf8');
const domainSpecPath = resolve(root, 'skills/system-diagram/resources/system-domain-interaction-example.json');
const domainSvgPath = resolve(root, 'skills/system-diagram/resources/system-domain-interaction-example.svg');
const domainSpec = JSON.parse(readFileSync(domainSpecPath, 'utf8'));
const domainSvg = readFileSync(domainSvgPath, 'utf8');

const v1GoldenHashes = new Map([
  [specPath, 'daa9653845e7a7ba7133de08507b7b49ff3fe5a8ac8f3e3e09242e8622971261'],
  [svgPath, '01c44dfcf89fe615ad9c4fa489859587cc71fcfc7e73e64fac4d05d1c990ca98'],
  [domainSpecPath, 'aa18b42316e6ae241075e13aa0f03cd0594af37beceb06252b5f76fa68bcf201'],
  [domainSvgPath, 'e6b748d55df5966a4a0b1223cda74d7a79876deb1706f02dbccd96a270bd4019'],
]);
for (const [path, expected] of v1GoldenHashes) assert(digest(path) === expected, `v1 compatibility baseline changed: ${path}`);

assert(spec.schemaVersion === SCHEMA_VERSION, 'fixture must use the current diagram schema');
assert(/<title\b/.test(svg) && /<desc\b/.test(svg), 'SVG requires title and description');
assert(svg.includes('<!-- svg-source:system-diagram -->'), 'SVG requires System Diagram provenance');
assert(svg.includes(`<!-- svg-spec-sha256:${digest(specPath)} -->`), 'SVG must identify its exact retained JSON source');
assert(/role="img"/.test(svg) && /aria-labelledby=/.test(svg), 'SVG requires accessible image semantics');
assert(/data-diagram-style="infrastructure-v1"/.test(svg), 'SVG must declare the infrastructure visual system');
assert(style.includes('.diagram-node__surface') && style.includes('.diagram-edge--primary'), 'visual system CSS must own node and route components');
assert(/<style>[\s\S]*\.diagram-node__surface/.test(svg), 'SVG must embed its renderer-owned component CSS');
assert(/<pattern\b[^>]*--grid/.test(svg), 'SVG must provide the quiet technical grid');
assert(/stroke:\s*#0070f3/.test(svg), 'SVG must provide the blue primary route');
assert(!/#7c3aed/i.test(svg), 'SVG must not introduce an undocumented repository accent');
assert(/\.diagram-node__accent,[\s\S]*fill:\s*#73736f/.test(svg), 'non-semantic node accents must remain neutral');
assert(/stroke-dasharray:\s*6 5/.test(svg), 'SVG must distinguish exception routes without color alone');
assert(/<text\b/.test(svg), 'labels must remain searchable SVG text');
assert(!/<svg\b[^>]*(?:width|height)=/.test(svg), 'root SVG must remain responsive');
assert(!/Virgil|roughness|excalidraw/i.test(svg), 'generated SVG must not retain Excalidraw styling or implementation');
assert(!/<(?:script|foreignObject)\b/.test(svg), 'generated SVG must not contain executable or foreign content');
assertSelfContainedSvg(svg);

assert(svg.includes(`data-review-id="${reviewId(spec, 'svg', undefined, spec.reviewId)}"`), 'missing exact root review ID');
for (const node of spec.nodes) {
  assert(svg.includes(`id="${exportedElementId(spec, `${node.id}-text`)}"`), `missing namespaced node text ID ${node.id}`);
  assert(svg.includes(`data-review-id="${reviewId(spec, 'node', node.id, node.reviewId)}"`), `missing node review ID ${node.id}`);
}
for (const edge of spec.edges) {
  assert(svg.includes(`data-review-id="${reviewId(spec, 'edge', edge.id, edge.reviewIds?.edge)}"`), `missing edge review ID ${edge.id}`);
  assert(svg.includes(`data-review-id="${reviewId(spec, 'edge-label', edge.id, edge.reviewIds?.label)}"`), `missing edge-label review ID ${edge.id}`);
}

assert(domainSvg.includes('diagram-group--ownership'), 'domain fixture must demonstrate an ownership boundary');
assert(domainSvg.includes('diagram-group--boundary'), 'domain fixture must demonstrate a neutral boundary');
assert(domainSvg.includes('diagram-edge--risk'), 'domain fixture must show a semantic risk path');
assert(domainSpec.nodes.every((node) => /Owner:|Invariant \/ policy rail/.test(node.text)), 'domain fixture nodes must expose ownership or the policy rail');
assert(domainSpec.edges.every((edge) => /records|changes|informs|governs|separates/.test(edge.label)), 'domain fixture edges must use effect-bearing verbs');
for (const group of domainSpec.groups) {
  assert(domainSvg.includes(`data-review-id="${reviewId(domainSpec, 'group', group.id, group.reviewId)}"`), `domain fixture missing group review ID ${group.id}`);
}
assertSelfContainedSvg(domainSvg);

const exactRootSpec = normalizeSpec({ ...structuredClone(spec), id: 'architecture-overview', reviewPrefix: undefined, reviewId: 'svg' });
assert(reviewId(exactRootSpec, 'svg', undefined, exactRootSpec.reviewId) === 'architecture-overview.svg', 'root review ID override must support exact report anchors');

expectSpecError((scene) => { delete scene.schemaVersion; }, `schemaVersion must equal "${SCHEMA_VERSION}"`);
expectSpecError((scene) => { scene.nodes[0].text = '   '; }, 'node quick-create text must be non-empty text');
expectSpecError((scene) => { scene.edges[0].label = ''; }, 'edge route-to-endpoint label must be non-empty text');
expectSpecError((scene) => { scene.edges[0].id = scene.nodes[0].id; }, 'duplicate element id quick-create');
expectSpecError((scene) => { scene.nodes[0].id = 'Quick Create'; }, 'must use lowercase kebab notation');
expectSpecError((scene) => { scene.nodes[0].fill = '#fff'; }, 'node quick-create.fill is unsupported');
expectSpecError((scene) => { scene.edges[0].roughness = 1; }, 'edge route-to-endpoint.roughness is unsupported');
expectSpecError((scene) => { scene.nodes[0].kind = 'hand-drawn'; }, 'kind must be one of');
expectSpecError((scene) => {
  scene.nodes[0].reviewId = 'diagram.duplicate';
  scene.nodes[1].reviewId = 'diagram.duplicate';
}, 'duplicate review ID diagram.example.system-slice-example.diagram.duplicate');
expectSpecError((scene) => { scene.edges[0].from = 'missing'; }, 'references unknown source missing');
expectSpecError((scene) => { delete scene.title; }, 'diagram title must be non-empty text');
expectSpecError((scene) => { delete scene.desc; }, 'diagram desc must be non-empty text');
expectSpecError((scene) => { scene.title = ''; }, 'diagram title must be non-empty text');
expectSpecError((scene) => { scene.desc = '  '; }, 'diagram desc must be non-empty text');
expectSpecError((scene) => { scene.nodes[0].width = 0; }, 'requires positive width');
expectSpecError((scene) => { scene.nodes[0].fontSize = 10; }, 'fontSize must be between 14 and 28');
expectSpecError((scene) => { scene.nodes[0].text = 'A title line that cannot possibly fit inside this node'; }, 'text line is wider than its content area');
expectSpecError((scene) => { scene.nodes[0].height = 50; scene.nodes[0].text = 'Title\nDetail one\nDetail two'; }, 'text is taller than its content area');
expectSpecError((scene) => { scene.nodes[0].text = 'Invalid\u0001text'; }, 'XML-invalid control character');
expectSpecError((scene) => { scene.edges[0].points = [[0, 0], [40, 40]]; }, 'segments must be orthogonal');
expectSpecError((scene) => { scene.edges[0].points = [[0, 0], [0, 0], [120, 0]]; }, 'contains a zero-length segment');
expectSpecError((scene) => { scene.edges[0].points[0] = [0, 10]; }, 'start must lie on source node quick-create boundary');
expectSpecError((scene) => { scene.edges[0].points[1] = [0, 60]; }, 'end must lie on target node endpoint boundary');
expectSpecError((scene) => { scene.edges[0].labelPosition = [10]; }, 'labelPosition must be a numeric [x, y] pair');
expectSpecError((scene) => { scene.edges[0].labelPosition = [80, 140]; }, 'label overlaps node quick-create');
expectSpecError((scene) => { scene.edges[0].revealDelay = -1; }, 'revealDelay must be a non-negative number');
expectError(() => assertSelfContainedSvg('<svg><style>@font-face{src:url(https://example.com/font.woff2)}</style></svg>'), 'non-embedded asset URL');
expectError(() => assertSelfContainedSvg('<svg><foreignObject></foreignObject></svg>'), 'executable or foreign content');

const invalidPath = join(tmpdir(), `invalid-system-diagram-${process.pid}.json`);
const secondSpecPath = join(tmpdir(), `second-system-diagram-${process.pid}.json`);
const secondSvgPath = join(tmpdir(), `second-system-diagram-${process.pid}.svg`);
try {
  writeFileSync(invalidPath, JSON.stringify({ schemaVersion: SCHEMA_VERSION, id: 'invalid', title: 'Invalid', desc: 'Invalid empty scene', nodes: [], edges: [] }));
  const invalid = run(['--stdout', invalidPath]);
  assert(invalid.status !== 0, 'invalid empty scene should fail');
  assert(`${invalid.stdout}${invalid.stderr}`.includes('diagram spec requires nodes[]'), 'invalid scene should report the missing nodes contract');

  const secondSpec = structuredClone(spec);
  secondSpec.id = 'second-scene';
  secondSpec.title = 'Second scene with reused semantic and explicit review IDs';
  writeFileSync(secondSpecPath, JSON.stringify(secondSpec));
  const secondRender = run([secondSpecPath, secondSvgPath]);
  assert(secondRender.status === 0, `second scene failed to render: ${secondRender.stderr}`);
  const secondSvg = readFileSync(secondSvgPath, 'utf8');
  assert(secondSvg.includes('data-diagram-style="infrastructure-v1"'), 'second scene must use the shared visual system');
  assert(secondSvg.includes(`data-review-id="${reviewId(secondSpec, 'node', secondSpec.nodes[0].id, secondSpec.nodes[0].reviewId)}"`), 'explicit review suffix must be namespaced by the second scene');
  assertSelfContainedSvg(secondSvg);
  const inlineScenes = `<main>${svg}${secondSvg}</main>`;
  assertUnique(inlineScenes, /\sid="([^"]+)"/g, 'SVG ID');
  assertUnique(inlineScenes, /data-review-id="([^"]+)"/g, 'review ID');

  writeFileSync(secondSpecPath, `${JSON.stringify({ ...secondSpec, title: 'Changed' })}\n`);
  const stale = run(['--check', secondSpecPath, secondSvgPath]);
  assert(stale.status !== 0 && `${stale.stdout}${stale.stderr}`.includes('is stale'), 'changed retained JSON must invalidate generated SVG');
} finally {
  rmSync(secondSpecPath, { force: true });
  rmSync(secondSvgPath, { force: true });
  rmSync(invalidPath, { force: true });
}

console.log('✓ deterministic SVG/CSS diagram system, semantic style, provenance, accessibility, and failure contract');

function run(args) {
  return spawnSync(process.execPath, [renderer, ...args], { cwd: root, encoding: 'utf8', timeout: 30_000 });
}

function digest(path) {
  return createHash('sha256').update(readFileSync(path, 'utf8')).digest('hex');
}

function expectSpecError(mutate, expectedMessage) {
  const candidate = structuredClone(spec);
  mutate(candidate);
  try { normalizeSpec(candidate); }
  catch (error) {
    assert(error.message.includes(expectedMessage), `expected "${expectedMessage}", received "${error.message}"`);
    return;
  }
  throw new Error(`invalid scene should fail with "${expectedMessage}"`);
}

function expectError(action, expectedMessage) {
  try { action(); }
  catch (error) {
    assert(error.message.includes(expectedMessage), `expected "${expectedMessage}", received "${error.message}"`);
    return;
  }
  throw new Error(`expected failure containing "${expectedMessage}"`);
}

function assertUnique(source, pattern, label) {
  const values = [...source.matchAll(pattern)].map((match) => match[1]);
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  assert(duplicates.length === 0, `duplicate ${label}s in combined scenes: ${[...new Set(duplicates)].join(', ')}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
