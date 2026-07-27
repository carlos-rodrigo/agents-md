#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const resources = join(root, 'skills/html-report-designer/resources');
const validator = join(root, 'scripts/validate-html-report.mjs');
const templatePath = join(resources, 'design-template.html');
const cssPath = join(resources, 'design.tailwind.css');
const recipes = [
  {
    name: 'tiny internal behavior',
    path: join(resources, 'design-recipe-tiny.html'),
    includes: ['design-opening', 'architecture-pressure', 'chosen-seam', 'system-path', 'boundary', 'proof', 'sources'],
    excludes: ['responsibility', 'decision', 'contract-block', 'interface-consequence', 'slice-outline', 'risk', 'linchpin-figure'],
  },
  {
    name: 'API persistence boundary',
    path: join(resources, 'design-recipe-boundary.html'),
    includes: ['design-opening', 'architecture-pressure', 'chosen-seam', 'system-path', 'responsibility', 'property-list', 'contract-block', 'slice-outline', 'risk', 'boundary', 'proof', 'sources'],
    excludes: ['decision', 'interface-consequence', 'linchpin-figure'],
  },
  {
    name: 'UI to backend visual path',
    path: join(resources, 'design-recipe-visual.html'),
    includes: ['design-opening', 'architecture-pressure', 'chosen-seam', 'system-path', 'responsibility', 'property-list', 'interface-consequence', 'risk', 'boundary', 'proof', 'sources', 'linchpin-figure'],
    excludes: ['decision', 'contract-block', 'slice-outline'],
  },
];

for (const recipe of recipes) assert(existsSync(recipe.path), `missing ${recipe.name} recipe: ${basename(recipe.path)}`);

const template = readFileSync(templatePath, 'utf8');
const css = readFileSync(cssPath, 'utf8');
const requiredTokens = [
  '--reading-measure', '--type-body', '--type-display', '--space-1', '--surface-page',
  '--accent', '--border', '--status-draft', '--focus-ring', '--print-text',
];
const requiredPrimitives = [
  'design-opening', 'architecture-pressure', 'chosen-seam', 'system-path',
  'responsibility', 'contract-block', 'interface-consequence',
  'slice-outline', 'risk', 'boundary', 'proof', 'sources', 'linchpin-figure',
];
const protocolPatterns = [
  'doc-note', 'property-list', 'property', 'split-row', 'code-group',
  'resource-grid', 'resource-card', 'meta-tag', 'section-divider', 'hero-wash',
];
for (const token of requiredTokens) assert(css.includes(token), `design CSS missing token ${token}`);
for (const primitive of requiredPrimitives) assert(css.includes(`.${primitive}`), `design CSS missing architecture primitive .${primitive}`);
for (const pattern of protocolPatterns) assert(css.includes(`.${pattern}`), `design CSS missing reusable Protocol pattern .${pattern}`);
assert(css.includes('--reading-measure: 48rem'), 'design prose spine should use Protocol’s compact 48rem reading measure');
assert(css.includes('--type-body-size: .875rem'), 'design body type should match Protocol’s compact 14px scale');
assert(css.includes('--type-h1: 1.5rem'), 'design title should match Protocol’s restrained 24px scale');
assert(css.includes('--type-h2: 1.125rem'), 'design section headings should match Protocol’s 18px scale');
assert(css.includes('width: min(24rem, 100%)'), 'design mobile navigation should use a Protocol-like left sheet');
assert(css.includes('@media (min-width: 80rem)'), 'design rail should support Protocol’s wider extra-large breakpoint');

assert(count(template, /<h1\b/gi) === 1, 'content-free design shell needs exactly one h1 location');
assert(/<main\b[^>]*id=["']main["'][^>]*>[\s\S]*<article\b/i.test(template), 'content-free design shell needs main/article landmarks');
assert(/class=["'][^"']*skip-link[^"']*["'][^>]*href=["']#main["']/i.test(template), 'content-free design shell needs a skip link');
assert(template.includes('{{COMPOSED_DESIGN_CONTENT}}'), 'content-free design shell needs one composition insertion point');
assert(template.includes('{{PRD_PATH}}'), 'content-free design shell needs a PRD authority link');
assert(template.includes('{{SOURCE_PATHS}}'), 'content-free design shell needs provenance support');
assert(count(template, /<section\b/gi) === 0, 'content-free design shell must not prescribe sections');
assert(count(template, /<script\b[^>]*data-artifact-motion=["']native["']/gi) === 1, 'design shell needs one shared optional artifact-motion runtime');
assert(count(template, /<script\b[^>]*data-document-navigation=["']progressive["']/gi) === 1, 'design shell needs one progressive static-document navigation runtime');
assert(template.includes('class="sidebar"') && template.includes('class="headerbar"'), 'design shell needs the Protocol-derived document chrome');
assert(template.includes('prefers-reduced-motion: reduce'), 'design shell motion must honor reduced motion');
assert(!/<article\b[^>]*data-motion-sections=/i.test(template), 'design shell must not choreograph every authored section by default');
assert(!/data-excalidraw-slot/i.test(template), 'content-free design shell must not reserve a diagram slot');

const forbiddenFamilies = [
  '.doc-shell', '.breadcrumbs', '.back-to-top', '.prev-next',
  '.feedback-widget', '.tabs', '.card-grid', '.component-card', '.story-list',
  '.scenario-stack', '.contract-list', '.slice-card', '.domain-walkthrough',
  '.diagram-viewport', '.diagram-node', '.diagram-edge', '.review-label', '.decision', '.reveal', '.prose',
];
for (const fragment of forbiddenFamilies) {
  assert(!css.includes(fragment), `design source CSS retains dormant family ${fragment}`);
  assert(!template.includes(fragment), `generated design shell retains dormant family ${fragment}`);
}

const shellStyle = styleContents(template);
const signatures = new Set();
for (const recipe of recipes) {
  const html = readFileSync(recipe.path, 'utf8');
  assert(count(html, /<style\b[^>]*data-tailwind-build=["']design\.tailwind\.css["']/gi) === 1, `${recipe.name} recipe needs exactly one shared report style block`);
  assert(styleContents(html) === shellStyle, `${recipe.name} recipe must use shared compiled design CSS without one-off report styles`);
  const htmlWithoutSvg = html.replace(/<svg\b[\s\S]*?<\/svg>/gi, '');
  assert(!/\sstyle=["']/i.test(htmlWithoutSvg), `${recipe.name} recipe must not use one-off style attributes outside renderer-owned SVG`);
  assert(!/\{\{[^}]+\}\}/.test(html), `${recipe.name} recipe has unresolved placeholders`);
  assert(!/\b(?:N\/A|not applicable|TBD)\b/i.test(html), `${recipe.name} recipe contains filler`);
  assert(count(html, /<h1\b/gi) === 1, `${recipe.name} recipe needs exactly one h1`);
  assert(count(html, /data-review-id=/gi) >= 6, `${recipe.name} recipe needs stable review anchors on architecture claims`);
  assert(!/<article\b[^>]*data-motion-sections=/i.test(html), `${recipe.name} recipe must keep section entrance motion opt-in`);
  for (const component of recipe.includes) assert(hasClass(html, component), `${recipe.name} recipe missing .${component}`);
  for (const component of recipe.excludes) assert(!hasClass(html, component), `${recipe.name} recipe includes irrelevant .${component}`);
  for (const fragment of forbiddenFamilies) {
    const rendererOwned = recipe.name === 'UI to backend visual path' && ['.diagram-node', '.diagram-edge'].includes(fragment);
    if (!rendererOwned) assert(!html.includes(fragment), `${recipe.name} recipe retains dormant family ${fragment}`);
  }
  assert(!/data-excalidraw-slot/i.test(html), `${recipe.name} recipe reserves a diagram slot`);

  signatures.add(requiredPrimitives.filter((component) => hasClass(html, component)).join('|'));
  for (const section of html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi)) {
    assert(stripHtml(section[1]).length >= 24, `${recipe.name} recipe contains an empty or filler section`);
  }

  const result = spawnSync(process.execPath, [validator, recipe.path], { encoding: 'utf8' });
  const output = `${result.stdout}${result.stderr}`;
  assert(result.status === 0, `${recipe.name} recipe should pass validation:\n${output}`);
  assert(!/missing (?:labelled table-of-contents nav|breadcrumbs|feedback widget)/i.test(output), `${recipe.name} recipe should not be warned toward portal ceremony`);
}
assert(signatures.size === recipes.length, 'the three design recipes must use meaningfully different structures');

const visual = readFileSync(recipes[2].path, 'utf8');
assert(count(visual, /<figure\b[^>]*class=["'][^"']*linchpin-figure[^"']*["'][^>]*data-complex-figure/gi) === 1, 'visual recipe needs exactly one marked linchpin figure');
assert(/<svg\b[^>]*role=["']img["'][^>]*aria-labelledby=["'][^"']+["'][^>]*>[\s\S]*<title\b[^>]*>[\s\S]*<\/title>[\s\S]*<desc\b[^>]*>[\s\S]*<\/desc>/i.test(visual), 'linchpin figure needs an accessible SVG title and description');
assert(visual.includes('<!-- svg-source:excalidraw -->'), 'linchpin architecture figure needs retained renderer provenance');
assert(/<figcaption\b[^>]*>[\s\S]*\S[\s\S]*<\/figcaption>/i.test(visual), 'linchpin figure needs a caption');
assert(/data-figure-walkthrough-for=["'][^"']+["']/i.test(visual), 'linchpin figure needs a local structured walkthrough');

const templateResult = spawnSync(process.execPath, [validator, '--allow-placeholders', templatePath], { encoding: 'utf8' });
const templateOutput = `${templateResult.stdout}${templateResult.stderr}`;
assert(templateResult.status === 0, `content-free design shell should pass template validation:\n${templateOutput}`);
assert(!/missing (?:labelled table-of-contents nav|breadcrumbs|feedback widget)/i.test(templateOutput), 'content-free design shell should not be warned toward portal ceremony');

console.log('PASS: composable design shell, architecture primitives, and three distinct recipes');

function count(value, pattern) { return (value.match(pattern) || []).length; }
function hasClass(html, className) { return new RegExp(`class=["'][^"']*\\b${className}\\b[^"']*["']`, 'i').test(html); }
function styleContents(html) {
  const match = html.match(/<style\b[^>]*data-tailwind-build=["']design\.tailwind\.css["'][^>]*>([\s\S]*?)<\/style>/i);
  assert(match, 'resource needs inline CSS compiled from design.tailwind.css');
  return match[1];
}
function stripHtml(value) { return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function assert(condition, message) { if (!condition) throw new Error(message); }
