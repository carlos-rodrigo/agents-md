#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(join(root, path));
const text = (path) => read(path).toString('utf8');
const restoredCommit = 'ce8aab10f17fb9365533ee225bd5c2ce663a897f';
const assets = {
  'skills/html-report-designer/resources/prd-template.html': 'c8533167d8ebe43ce04eee09369d7c6615a09b59de4c0026a9dd50664054789f',
  'skills/html-report-designer/resources/prd.tailwind.css': '3fe202d4c9d415a944792eb967dfdcef058d694e4833c96dfdb23d3ec274e30f',
  'skills/html-report-designer/resources/design-template.html': 'd67a4f0d61e8e0cd2ee3342711eefdbf6a0caf4229ccb33d0f51cadfe2d3b7fa',
  'skills/html-report-designer/resources/design.tailwind.css': '5805b2cac88de7254adf865c2d320131646e118b68a51dda7f0a230c77525026',
};

for (const [path, expected] of Object.entries(assets)) {
  const actual = createHash('sha256').update(read(path)).digest('hex');
  assert(actual === expected, `${path} no longer matches restored report asset ${restoredCommit}`);
}

const routes = [
  ['PRD', text('skills/prd/SKILL.md'), 'skills/html-report-designer/resources/prd-template.html'],
  ['design', text('skills/design-solution/SKILL.md'), 'skills/html-report-designer/resources/design-template.html'],
];
for (const [label, skill, template] of routes) {
  requireAll(`${label} template routing`, skill, [
    '## Restored report template lock',
    restoredCommit,
    template,
    'Start from a byte-for-byte copy of this template',
    'Keep its embedded style block and visual component classes unchanged',
    'Do not substitute another report shell, recipe, or visual system',
  ]);
}
assert(routes[0][1].includes('remove `role="img"` from rich HTML wireframe wrappers'), 'PRD generation must preserve rich wireframe child semantics');

const buildScript = text('scripts/build-html-report-css.mjs');
const buildConfig = text('scripts/restored-report-tailwind.config.cjs');
requireAll('restored report CSS build', buildScript, [
  'scripts/restored-report-tailwind.config.cjs',
  "html: ['report-template.html']",
  "html: ['prd-template.html']",
  "html: ['design-template.html']",
]);
for (const removedRecipe of ['prd-recipe-', 'design-recipe-']) {
  assert(!buildScript.includes(removedRecipe), `report CSS build still targets removed ${removedRecipe} assets`);
}
requireAll('restored report Tailwind config', buildConfig, [
  '@tailwindcss/typography',
  './skills/html-report-designer/resources/*-template.html',
  './skills/html-report-designer/resources/*.tailwind.css',
]);

const prdTemplate = text('skills/html-report-designer/resources/prd-template.html');
const designTemplate = text('skills/html-report-designer/resources/design-template.html');
for (const [label, template] of [['PRD', prdTemplate], ['design', designTemplate]]) {
  requireAll(`${label} restored shell`, template, [
    'data-visual-mode="vercel-docs-packet"',
    'class="doc-shell"',
    'class="side-nav"',
    'class="breadcrumbs"',
    'class="section-card reveal"',
  ]);
  assert(!template.includes('{{COMPOSED_'), `${label} routing drifted to the later composed-content shell`);
}

console.log(`PASS: PRD and design generation are locked to restored HTML report templates from ${restoredCommit.slice(0, 8)}`);

function requireAll(label, content, markers) {
  const missing = markers.filter((marker) => !content.includes(marker));
  assert(missing.length === 0, `${label} missing: ${missing.join(', ')}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
