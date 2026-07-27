#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const resources = join(root, 'skills/html-report-designer/resources');
const validator = join(root, 'scripts/validate-html-report.mjs');
const templatePath = join(resources, 'prd-template.html');
const cssPath = join(resources, 'prd.tailwind.css');
const recipes = [
  {
    name: 'tiny behavior',
    path: join(resources, 'prd-recipe-tiny.html'),
    includes: ['prd-opening', 'boundary', 'rules', 'scope', 'no-go', 'proof', 'sources'],
    excludes: ['flow', 'decision', 'linchpin-figure'],
  },
  {
    name: 'product decision',
    path: join(resources, 'prd-recipe-decision.html'),
    includes: ['prd-opening', 'product-bet', 'boundary', 'review-focus', 'narrative-section', 'flow', 'rules', 'scope', 'no-go', 'proof', 'decision', 'sources'],
    excludes: ['linchpin-figure'],
  },
  {
    name: 'justified visual',
    path: join(resources, 'prd-recipe-visual.html'),
    includes: ['prd-opening', 'product-bet', 'boundary', 'review-focus', 'narrative-section', 'flow', 'rules', 'proof', 'sources', 'linchpin-figure'],
    excludes: ['decision'],
  },
];

for (const recipe of recipes) {
  assert(existsSync(recipe.path), `missing ${recipe.name} recipe: ${basename(recipe.path)}`);
}

const template = readFileSync(templatePath, 'utf8');
const css = readFileSync(cssPath, 'utf8');
const requiredTokens = [
  '--reading-measure', '--type-body', '--type-display', '--space-1', '--surface-page',
  '--accent', '--border', '--status-draft', '--focus-ring', '--print-text',
];
const requiredPrimitives = [
  'prd-opening', 'product-bet', 'boundary', 'review-focus', 'narrative-section',
  'flow', 'rules', 'scope', 'no-go', 'proof', 'decision', 'sources', 'linchpin-figure',
];
for (const token of requiredTokens) assert(css.includes(token), `PRD CSS missing token ${token}`);
for (const primitive of requiredPrimitives) assert(css.includes(`.${primitive}`), `PRD CSS missing rhetorical primitive .${primitive}`);

assert(count(template, /<h1\b/gi) === 1, 'content-free shell needs exactly one h1 location');
assert(/<main\b[^>]*id=["']main["'][^>]*>[\s\S]*<article\b/i.test(template), 'content-free shell needs main/article landmarks');
assert(/class=["'][^"']*skip-link[^"']*["'][^>]*href=["']#main["']/i.test(template), 'content-free shell needs a skip link');
assert(template.includes('{{COMPOSED_PRD_CONTENT}}'), 'content-free shell needs one composition insertion point');
assert(template.includes('{{SOURCE_PATHS}}'), 'content-free shell needs provenance support');
assert(count(template, /<section\b/gi) === 0, 'content-free shell must not prescribe PRD sections');
assert(count(template, /<script\b[^>]*data-artifact-motion=["']native["']/gi) === 1, 'PRD shell needs one shared optional artifact-motion runtime');
assert(count(template, /<script\b[^>]*data-document-navigation=["']progressive["']/gi) === 1, 'PRD shell needs one progressive static-document navigation runtime');
assert(template.includes('class="sidebar"') && template.includes('class="headerbar"'), 'PRD shell needs the Protocol-derived document chrome');
assert(template.includes('prefers-reduced-motion: reduce'), 'PRD shell motion must honor reduced motion');

const forbiddenFamilies = [
  '.doc-shell', '.breadcrumbs', '.back-to-top', '.prev-next',
  '.feedback-widget', '.wireframe-', '.diagram-viewport', '.ui-option-',
  '.option-gallery', '.card-gallery', '.reveal', '.prose',
];
for (const fragment of forbiddenFamilies) {
  assert(!css.includes(fragment), `PRD source CSS retains dormant family ${fragment}`);
  assert(!template.includes(fragment), `generated PRD shell retains dormant family ${fragment}`);
}

const shellStyle = styleContents(template);
const signatures = new Set();
for (const recipe of recipes) {
  const html = readFileSync(recipe.path, 'utf8');
  assert(count(html, /<style\b/gi) === 1, `${recipe.name} recipe needs exactly one shared inline style block`);
  assert(styleContents(html) === shellStyle, `${recipe.name} recipe must use the shared compiled PRD CSS without one-off styles`);
  assert(!/\sstyle=["']/i.test(html), `${recipe.name} recipe must not use inline one-off style attributes`);
  assert(!/\{\{[^}]+\}\}/.test(html), `${recipe.name} recipe has unresolved placeholders`);
  assert(!/\b(?:N\/A|not applicable|TBD)\b/i.test(html), `${recipe.name} recipe contains filler`);
  assert(count(html, /<h1\b/gi) === 1, `${recipe.name} recipe needs exactly one h1`);
  assert(count(html, /data-review-id=/gi) >= 5, `${recipe.name} recipe needs stable review anchors on meaningful claims`);
  for (const component of recipe.includes) assert(hasClass(html, component), `${recipe.name} recipe missing .${component}`);
  for (const component of recipe.excludes) assert(!hasClass(html, component), `${recipe.name} recipe includes irrelevant .${component}`);
  for (const fragment of forbiddenFamilies) assert(!html.includes(fragment), `${recipe.name} recipe retains dormant family ${fragment}`);

  const sections = [...html.matchAll(/<section\b[^>]*class=["']([^"']+)["']/gi)].map((match) => match[1]).join('|');
  assert(sections.length > 0, `${recipe.name} recipe needs a meaningful composition`);
  signatures.add(requiredPrimitives.filter((component) => hasClass(html, component)).join('|'));
  for (const section of html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi)) {
    assert(stripHtml(section[1]).length >= 24, `${recipe.name} recipe contains an empty or filler section`);
  }

  const result = spawnSync(process.execPath, [validator, recipe.path], { encoding: 'utf8' });
  const validationOutput = `${result.stdout}${result.stderr}`;
  assert(result.status === 0, `${recipe.name} recipe should pass validation:\n${validationOutput}`);
  assert(!/missing (?:labelled table-of-contents nav|breadcrumbs|feedback widget)/i.test(validationOutput), `${recipe.name} recipe should not be warned toward portal chrome`);
}
assert(signatures.size === recipes.length, 'the three PRD recipes must use meaningfully different structures');

const visual = readFileSync(recipes[2].path, 'utf8');
assert(/<figure\b[^>]*class=["'][^"']*linchpin-figure[^"']*["'][^>]*data-complex-figure/i.test(visual), 'visual recipe needs one marked linchpin figure');
assert(/<svg\b[^>]*role=["']img["'][^>]*aria-labelledby=["'][^"']+["'][^>]*>[\s\S]*<title\b[^>]*>[\s\S]*<\/title>[\s\S]*<desc\b[^>]*>[\s\S]*<\/desc>/i.test(visual), 'linchpin figure needs an accessible SVG title and description');
assert(/<figcaption\b[^>]*>[\s\S]*\S[\s\S]*<\/figcaption>/i.test(visual), 'linchpin figure needs a caption');
assert(/data-figure-walkthrough-for=["'][^"']+["']/i.test(visual), 'linchpin figure needs a local structured text equivalent');

const templateResult = spawnSync(process.execPath, [validator, '--allow-placeholders', templatePath], { encoding: 'utf8' });
const templateValidationOutput = `${templateResult.stdout}${templateResult.stderr}`;
assert(templateResult.status === 0, `content-free PRD shell should pass template validation:\n${templateValidationOutput}`);
assert(!/missing (?:labelled table-of-contents nav|breadcrumbs|feedback widget)/i.test(templateValidationOutput), 'content-free PRD shell should not be warned toward portal chrome');

console.log('PASS: composable PRD shell, rhetorical primitives, and three distinct recipes');

function count(value, pattern) {
  return (value.match(pattern) || []).length;
}

function hasClass(html, className) {
  return new RegExp(`class=["'][^"']*\\b${className}\\b[^"']*["']`, 'i').test(html);
}

function styleContents(html) {
  const match = html.match(/<style\b[^>]*data-tailwind-build=["']prd\.tailwind\.css["'][^>]*>([\s\S]*?)<\/style>/i);
  assert(match, 'resource needs inline CSS compiled from prd.tailwind.css');
  return match[1];
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
