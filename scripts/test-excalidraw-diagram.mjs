#!/usr/bin/env node
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertSelfContainedSvg, exportedElementId, normalizeSpec, reviewId } from './excalidraw-diagram-spec.mjs';

const root = resolve(import.meta.dirname, '..');
const specPath = resolve(root, 'skills/html-report-designer/resources/excalidraw-slice-example.json');
const svgPath = resolve(root, 'skills/html-report-designer/resources/excalidraw-slice-example.svg');
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const svg = readFileSync(svgPath, 'utf8');
const domainSpecPath = resolve(root, 'skills/html-report-designer/resources/excalidraw-domain-interaction-example.json');
const domainSvgPath = resolve(root, 'skills/html-report-designer/resources/excalidraw-domain-interaction-example.svg');
const domainSpec = JSON.parse(readFileSync(domainSpecPath, 'utf8'));
const domainSvg = readFileSync(domainSvgPath, 'utf8');

assert(/<title\b/.test(svg) && /<desc\b/.test(svg), 'SVG requires title and description');
assert(/role="img"/.test(svg), 'SVG requires role=img');
assert(/aria-labelledby=/.test(svg), 'SVG requires an accessible name and description');
assert(/data:font\/woff2;base64,/.test(svg), 'Virgil must be embedded');
assert(/<text\b/.test(svg), 'labels must remain searchable SVG text');
assert(!/<svg\b[^>]*(?:width|height)=/.test(svg), 'root SVG must remain responsive');
assert(!/\bpath-draw\b/.test(svg), 'Excalidraw multi-stroke edges must not use path-draw');
assertSelfContainedSvg(svg);

assert(svg.includes(`data-review-id="${reviewId(spec, 'svg', undefined, spec.reviewId)}"`), 'missing exact root review ID');
for (const node of spec.nodes) {
  assert(svg.includes(`data-review-id="${reviewId(spec, 'node', node.id, node.reviewId)}"`), `missing node review ID ${node.id}`);
}
for (const edge of spec.edges) {
  assert(svg.includes(`id="mask-${exportedElementId(spec, edge.id)}"`), `missing namespaced mask ID ${edge.id}`);
  assert(svg.includes(`data-review-id="${reviewId(spec, 'edge', edge.id, edge.reviewIds?.edge)}"`), `missing edge review ID ${edge.id}`);
  assert(svg.includes(`data-review-id="${reviewId(spec, 'edge-label', edge.id, edge.reviewIds?.label)}"`), `missing edge-label review ID ${edge.id}`);
}

assert(/<!--\s*svg-source:excalidraw\s*-->/.test(domainSvg), 'domain fixture requires Excalidraw provenance');
assert(/<title\b/.test(domainSvg) && /<desc\b/.test(domainSvg), 'domain fixture requires title and description');
assert(/role="img"/.test(domainSvg) && /aria-labelledby=/.test(domainSvg), 'domain fixture requires accessible SVG semantics');
assert(/class="diagram-edge-label diagram-reveal"/.test(domainSvg), 'domain fixture requires labelled renderer reveal groups');
assert(domainSpec.nodes.every((node) => /Owner:|Invariant \/ policy rail/.test(node.text)), 'domain fixture nodes must expose ownership boundaries or the policy rail');
assert(domainSpec.edges.every((edge) => /records|changes|informs|governs|separates/.test(edge.label)), 'domain fixture edges must use effect-bearing verbs');
assert(domainSpec.nodes.some((node) => /Invariant \/ policy rail/.test(node.text)), 'domain fixture requires an invariant/policy rail');
for (const node of domainSpec.nodes) {
  assert(domainSvg.includes(`data-review-id="${reviewId(domainSpec, 'node', node.id, node.reviewId)}"`), `domain fixture missing node review ID ${node.id}`);
}
for (const edge of domainSpec.edges) {
  assert(domainSvg.includes(`data-review-id="${reviewId(domainSpec, 'edge', edge.id, edge.reviewIds?.edge)}"`), `domain fixture missing edge review ID ${edge.id}`);
  assert(domainSvg.includes(`data-review-id="${reviewId(domainSpec, 'edge-label', edge.id, edge.reviewIds?.label)}"`), `domain fixture missing edge-label review ID ${edge.id}`);
}
assertSelfContainedSvg(domainSvg);

assert(!existsSync(resolve(root, 'scripts/render-elk-diagram.mjs')), 'legacy ELK renderer still exists');
assert(!existsSync(resolve(root, 'skills/html-report-designer/resources/elk-slice-example.json')), 'legacy ELK fixture still exists');
assert(!('elkjs' in JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).devDependencies), 'legacy elkjs dependency still exists');
const exactRootSpec = normalizeSpec({ ...structuredClone(spec), id: 'architecture-overview', reviewPrefix: undefined, reviewId: 'svg' });
assert(reviewId(exactRootSpec, 'svg', undefined, exactRootSpec.reviewId) === 'architecture-overview.svg', 'root review ID override must support exact report anchors');

expectSpecError((scene) => { scene.nodes[0].text = '   '; }, 'node quick-create requires non-empty text');
expectSpecError((scene) => { scene.edges[0].label = ''; }, 'edge route-to-endpoint requires a non-empty label');
expectSpecError((scene) => { scene.edges[0].id = scene.nodes[0].id; }, 'duplicate element id quick-create');
expectSpecError((scene) => { scene.nodes[0].id = 'Quick Create'; }, 'must use lowercase kebab notation');
expectSpecError((scene) => { scene.nodes[0].fontFamily = 'helvetica'; }, 'local fonts are not self-contained');
expectSpecError((scene) => {
  scene.nodes[0].reviewId = 'diagram.duplicate';
  scene.nodes[1].reviewId = 'diagram.duplicate';
}, 'duplicate review ID diagram.example.excalidraw-slice-example.diagram.duplicate');
expectSpecError((scene) => { scene.edges[0].from = 'missing'; }, 'references unknown source missing');
expectSpecError((scene) => { scene.title = ''; }, 'diagram title must be non-empty');
expectSpecError((scene) => { scene.desc = '  '; }, 'diagram desc must be non-empty');
expectSpecError((scene) => { scene.nodes[0].width = 0; }, 'requires positive width');
expectSpecError((scene) => { scene.nodes[0].fontSize = 0; }, 'fontSize must be positive');
expectSpecError((scene) => { scene.edges[0].strokeWidth = -1; }, 'strokeWidth must be positive');
expectSpecError((scene) => { scene.edges[0].roughness = -1; }, 'roughness must be non-negative');
expectSpecError((scene) => { scene.edges[0].revealDelay = -1; }, 'revealDelay must be a non-negative number');
expectError(
  () => assertSelfContainedSvg('<svg><style>@font-face{src:url(https://example.com/font.woff2)}</style></svg>'),
  'non-embedded asset URL',
);

const invalidPath = join(tmpdir(), `invalid-excalidraw-${process.pid}.json`);
const secondSpecPath = join(tmpdir(), `second-excalidraw-${process.pid}.json`);
const secondSvgPath = join(tmpdir(), `second-excalidraw-${process.pid}.svg`);
try {
  writeFileSync(invalidPath, JSON.stringify({ id: 'invalid', nodes: [], edges: [] }));
  const invalid = spawnSync(process.execPath, [
    resolve(root, 'scripts/render-excalidraw-diagram.mjs'),
    '--stdout',
    invalidPath,
  ], { cwd: root, encoding: 'utf8', timeout: 120_000 });
  assert(invalid.status !== 0, 'invalid empty scene should fail');
  assert(`${invalid.stdout}${invalid.stderr}`.includes('diagram spec requires nodes[]'), 'invalid scene should report the missing nodes contract');

  const secondSpec = structuredClone(spec);
  secondSpec.id = 'second-scene';
  secondSpec.title = 'Second scene with reused semantic and explicit review IDs';
  secondSpec.nodes[0].fontFamily = 'cascadia';
  secondSpec.edges[0].fontFamily = 'cascadia';
  writeFileSync(secondSpecPath, JSON.stringify(secondSpec));
  const secondRender = spawnSync(process.execPath, [
    resolve(root, 'scripts/render-excalidraw-diagram.mjs'),
    secondSpecPath,
    secondSvgPath,
  ], { cwd: root, encoding: 'utf8', timeout: 120_000 });
  assert(secondRender.status === 0, `second scene failed to render: ${secondRender.stderr}`);
  const secondSvg = readFileSync(secondSvgPath, 'utf8');
  assert(secondSvg.includes('font-family="Cascadia'), 'Cascadia scene should preserve searchable Cascadia text');
  assert(/data:font\/woff2;base64,/.test(secondSvg), 'Cascadia must be embedded');
  assert(
    secondSvg.includes(`data-review-id="${reviewId(secondSpec, 'node', secondSpec.nodes[0].id, secondSpec.nodes[0].reviewId)}"`),
    'explicit review suffix must be namespaced by the second scene',
  );
  assertSelfContainedSvg(secondSvg);
  const inlineScenes = `<main>${svg}${secondSvg}</main>`;
  assertUnique(inlineScenes, /\sid="([^"]+)"/g, 'SVG ID');
  assertUnique(inlineScenes, /data-review-id="([^"]+)"/g, 'review ID');
} finally {
  rmSync(secondSpecPath, { force: true });
  rmSync(secondSvgPath, { force: true });
  rmSync(invalidPath, { force: true });
}

console.log('✓ Excalidraw renderer validation, embedded fonts, failure contract, and two-scene ID isolation');

function expectSpecError(mutate, expectedMessage) {
  const candidate = structuredClone(spec);
  mutate(candidate);
  try {
    normalizeSpec(candidate);
  } catch (error) {
    assert(error.message.includes(expectedMessage), `expected "${expectedMessage}", received "${error.message}"`);
    return;
  }
  throw new Error(`invalid scene should fail with "${expectedMessage}"`);
}

function expectError(action, expectedMessage) {
  try {
    action();
  } catch (error) {
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
