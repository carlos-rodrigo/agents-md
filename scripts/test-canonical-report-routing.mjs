#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const text = (path) => readFileSync(join(root, path), 'utf8');
const resources = 'skills/html-report-designer/resources';

for (const path of [
  `${resources}/report-template.html`,
  `${resources}/report.tailwind.css`,
  `${resources}/canonical-report-v1.schema.json`,
  'skills/html-report-designer/scripts/canonical-report.mjs',
  'skills/html-report-designer/scripts/render-canonical-report.mjs',
  'skills/html-report-designer/scripts/validate-html-report.mjs',
]) assert(existsSync(join(root, path)), `missing canonical report resource ${path}`);

for (const required of [
  'docs/features/canonical-document-renderer/prd.document.json',
  'docs/features/canonical-document-renderer/prd.html',
  'docs/features/canonical-document-renderer/design.document.json',
  'docs/features/canonical-document-renderer/design.html',
  'docs/features/html-report-validation/prd.document.json',
  'docs/features/html-report-validation/prd.html',
  'docs/features/canonical-document-renderer/diagrams/product-review-flow.json',
  'docs/features/canonical-document-renderer/diagrams/product-review-flow.svg',
  'docs/features/canonical-document-renderer/diagrams/canonical-rendering-path.json',
  'docs/features/canonical-document-renderer/diagrams/canonical-rendering-path.svg',
  'docs/features/html-report-validation/diagrams/report-validation-flow.json',
  'docs/features/html-report-validation/diagrams/report-validation-flow.svg',
  'skills/system-diagram/resources/excalidraw-slice-example.json',
  'skills/system-diagram/resources/excalidraw-slice-example.svg',
  'skills/system-diagram/resources/excalidraw-domain-interaction-example.json',
  'skills/system-diagram/resources/excalidraw-domain-interaction-example.svg',
]) assert(existsSync(join(root, required)), `missing required durable artifact ${required}`);

for (const legacy of [
  `${resources}/prd-template.html`, `${resources}/design-template.html`,
  `${resources}/prd.tailwind.css`, `${resources}/design.tailwind.css`,
  'skills/system-diagram/resources/system-diagram-template.html',
  'skills/system-diagram/resources/system-diagram.tailwind.css',
]) assert(!existsSync(join(root, legacy)), `parallel report path must be removed: ${legacy}`);

const schema = JSON.parse(text(`${resources}/canonical-report-v1.schema.json`));
assert(schema.$id === 'https://carlosrodrigo.dev/schemas/canonical-report-v1.schema.json', 'canonical schema needs a stable ID');
assert(schema.properties?.schemaVersion?.const === 'canonical-report-v1', 'canonical schema version must match the renderer');
assert(schema.$defs.namedText.required.includes('id'), 'step IDs must be required by the public schema');
assert(schema.$defs.scenarioWithoutType.additionalProperties === false && !Object.hasOwn(schema.$defs.scenarioWithoutType.properties, 'type'), 'nested slice scenarios must omit block type');
assert(Object.hasOwn(schema.$defs.decision.properties, 'approvedAt') && !Object.hasOwn(schema.$defs.decision.properties, 'recordedAt'), 'canonical decision authority must use approvedAt, not browser recording terminology');
assert(schema.$defs.document.properties.updated.format === 'date' && schema.$defs.decision.properties.approvedAt.format === 'date', 'public schema must require real document and decision dates');
assert(schema.$defs.acceptance.properties.id.allOf.some((rule) => rule.pattern === '^ac-[0-9]{3,}$'), 'public schema must require lowercase acceptance IDs');
assert(schema.$defs.option.properties.id.allOf.some((rule) => rule.not?.const === 'other'), 'public schema must reserve the renderer-owned custom option ID');

const template = text(`${resources}/report-template.html`);
requireAll('sole canonical template', template, [
  'name="canonical-report" content="canonical-report-v1"',
  'name="canonical-template-digest"',
  'data-report-template="canonical-report-v1"',
  '{{REPORT_TOC}}', '{{COMPOSED_REPORT_CONTENT}}', '{{EMBEDDED_DOCUMENT_SPEC}}',
  'data-artifact-motion="native"', 'data-document-navigation="progressive"', 'data-artifact-review-state="persistent"',
]);
for (const sample of ['MAIN_SCENARIO', 'STORY_001', 'ARCH_ROUTE', 'DECISION_CARD_TITLE']) assert(!template.includes(sample), `template must not prescribe ${sample}`);

const tailwindConfig = text('scripts/report-tailwind.config.cjs');
assert(/content:\s*\[\]/.test(tailwindConfig), 'canonical CSS build must not scan generated HTML/CSS as utility content');
for (const unusedUtility of ['.visible{', '.static{', '.absolute{']) assert(!template.includes(unusedUtility), `compiled canonical template retains unused utility ${unusedUtility}`);

const build = text('scripts/build-html-report-css.mjs');
assert((build.match(/const reportTemplateName = 'report-template\.html'/g) || []).length === 1, 'asset build must target one report template');
assert(!build.includes('const groups ='), 'single-template asset build must not retain multi-template grouping');
for (const legacy of ['prd-template.html', 'design-template.html', 'system-diagram-template.html']) assert(!build.includes(legacy), `asset build still references ${legacy}`);

for (const [label, path] of [['PRD', 'skills/prd/SKILL.md'], ['design', 'skills/design-solution/SKILL.md']]) {
  const skill = text(path);
  requireAll(`${label} canonical routing`, skill, ['canonical-report-v1', '<html-report-designer-dir>/scripts/render-canonical-report.mjs', 'Never patch generated HTML']);
}
const diagramSkill = text('skills/system-diagram/SKILL.md');
requireAll('system diagram ownership', diagramSkill, ['does not own a report template or page shell', '<system-diagram-dir>/scripts/render-excalidraw-diagram.mjs']);
const reviewRuntime = text(`${resources}/artifact-review-state.js`);
const reportCss = text(`${resources}/report.tailwind.css`);
for (const obsoleteCss of ['--surface-raised', '--radius-xl', '.approval-checklist', '.related-artifacts', '.path-draw', '.review-option-selector']) assert(!reportCss.includes(obsoleteCss), `canonical CSS retains obsolete selector/token: ${obsoleteCss}`);
for (const obsolete of ['Was this report useful?', 'data-feedback=', 'sessionStorage']) {
  assert(!`${template}\n${reviewRuntime}`.includes(obsolete), `canonical report must not restore obsolete session-only feedback: ${obsolete}`);
}

const durableDocs = resolve(root, 'docs/features');
for (const htmlPath of walkFiles(durableDocs).filter((path) => path.endsWith('.html'))) {
  const specPath = htmlPath.replace(/\.html$/, '.document.json');
  assert(existsSync(specPath), `durable report needs adjacent editable source: ${htmlPath}`);
  requireAll(`durable report ${htmlPath}`, readFileSync(htmlPath, 'utf8'), ['name="canonical-report" content="canonical-report-v1"']);
}

console.log('PASS: every durable document routes through one canonical report template and portable renderer');

function walkFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function requireAll(label, content, markers) { const missing = markers.filter((marker) => !content.includes(marker)); assert(missing.length === 0, `${label} missing: ${missing.join(', ')}`); }
function assert(condition, message) { if (!condition) throw new Error(message); }
