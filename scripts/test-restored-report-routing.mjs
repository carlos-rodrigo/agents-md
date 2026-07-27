#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const text = (path) => readFileSync(join(root, path), 'utf8');

const prdSkill = text('skills/prd/SKILL.md');
requireAll('PRD content-neutral template routing', prdSkill, [
  'skills/html-report-designer/resources/prd-template.html',
  '{{PRD_TOC}}',
  '{{PRD_HEADER_SUPPORT}}',
  '{{COMPOSED_PRD_CONTENT}}',
  'The template must not add, remove, reorder, or multiply product requirements',
]);

const designSkill = text('skills/design-solution/SKILL.md');
requireAll('design content-neutral template routing', designSkill, [
  'skills/html-report-designer/resources/design-template.html',
  '{{DESIGN_TOC}}',
  '{{DESIGN_HEADER_SUPPORT}}',
  '{{COMPOSED_DESIGN_CONTENT}}',
  'The template must not add, remove, reorder, or multiply architecture decisions',
]);
for (const [label, skill] of [['PRD', prdSkill], ['design', designSkill]]) {
  assert(!skill.includes('Start from a byte-for-byte copy of this template'), `${label} generation still locks content to a fixed sample document`);
}

const buildScript = text('scripts/build-html-report-css.mjs');
const buildConfig = text('scripts/restored-report-tailwind.config.cjs');
requireAll('report CSS and motion build', buildScript, [
  'scripts/restored-report-tailwind.config.cjs',
  "html: ['report-template.html']",
  "html: ['prd-template.html']",
  "html: ['design-template.html']",
  "path: join(root, htmlResources, 'artifact-motion.js')",
]);
requireAll('report Tailwind config', buildConfig, [
  '@tailwindcss/typography',
  './skills/html-report-designer/resources/*-template.html',
  './skills/html-report-designer/resources/*.tailwind.css',
]);

const templates = [
  ['PRD', text('skills/html-report-designer/resources/prd-template.html'), ['{{PRD_TOC}}', '{{PRD_HEADER_SUPPORT}}', '{{COMPOSED_PRD_CONTENT}}']],
  ['design', text('skills/html-report-designer/resources/design-template.html'), ['{{DESIGN_TOC}}', '{{DESIGN_HEADER_SUPPORT}}', '{{COMPOSED_DESIGN_CONTENT}}']],
];
for (const [label, template, slots] of templates) {
  requireAll(`${label} content-neutral shell`, template, [
    'data-visual-mode="vercel-docs-packet"',
    'class="doc-shell"',
    'class="side-nav"',
    'class="breadcrumbs"',
    'data-artifact-motion="native"',
    'keepActiveLinkVisible',
    'aria-label="Toggle document sidebar"',
    'class="sidebar-toggle-copy"',
    ...slots,
  ]);
}
for (const fixedContent of ['{{STORY_001_TITLE}}', '{{MAIN_GIVEN}}', '{{UI_OPTION_A_TITLE}}', '{{ARCH_ROUTE_NAME}}', '{{SLICE_1_ENDPOINT_NAME}}']) {
  for (const [label, template] of templates) {
    assert(!template.includes(fixedContent), `${label} shell still prescribes report content: ${fixedContent}`);
  }
}

const motion = text('skills/html-report-designer/resources/artifact-motion.js');
requireAll('shared scroll reveal runtime', motion, [
  "document.documentElement.classList.add('js')",
  "document.querySelectorAll('.reveal')",
  "IntersectionObserver",
  "prefers-reduced-motion: reduce",
  "is-visible",
  'showAll',
]);
for (const cssPath of ['skills/html-report-designer/resources/prd.tailwind.css', 'skills/html-report-designer/resources/design.tailwind.css']) {
  const css = text(cssPath);
  requireAll(`${cssPath} progressive motion CSS`, css, [
    '.reveal { opacity: 1;',
    '.js .reveal { opacity: 0;',
    '@media (prefers-reduced-motion: reduce)',
    '.diagram-reveal',
    '.path-draw',
    '.doc-shell:has(.index-details:not([open]))',
    '.index-details:not([open]) > summary::before',
    '.sidebar-toggle-copy::before',
    'content: "Collapse"',
    'transition: grid-template-columns',
    'max-width: none;',
    'width: 100%;',
    'min-height: calc(100vh - var(--space-8)); max-height: calc(100vh - var(--space-8));',
    'padding-right: var(--space-4); border-right: 1px solid var(--border);',
    ':where([data-review-id]) { position: relative; }',
    'z-index: 2;'
  ]);
  assert(!css.includes('[data-review-id] { position: relative; }'), `${cssPath} review anchors must not override sticky positioning`);
  assert(!css.includes('filter: blur('), `${cssPath} should not blur text during reveal motion`);
}

console.log('PASS: PRD and design generation use content-neutral shells with progressive motion and a sticky, active-item-aware collapsible sidebar');

function requireAll(label, content, markers) {
  const missing = markers.filter((marker) => !content.includes(marker));
  assert(missing.length === 0, `${label} missing: ${missing.join(', ')}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
