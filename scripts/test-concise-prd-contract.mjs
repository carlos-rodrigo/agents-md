#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const prd = read('skills/prd/SKILL.md');
const report = read('skills/html-report-designer/SKILL.md');
const design = read('skills/design-solution/SKILL.md');
const diagram = read('skills/system-diagram/SKILL.md');
const template = read('skills/html-report-designer/resources/prd-template.html');

requireAll('prd product contract', prd, [
  '## What we are building',
  '## Why we are building it',
  '## How it should work: product slices',
  'An ordered, end-to-end increment of user value',
  'As a {actor}, I want {capability}, so that {outcome}.',
  '**Given** {starting context}',
  '**When** {actor action or trigger}',
  '**Then** {observable result}',
  'one compact storyboard panel for every product-visible step',
  'SLICE-* → STORY-* → EX-* → AC-*',
  '### 6. After this slice',
  'After this slice, {actor} can {new capability or understood outcome}.',
  'not an implementation layer',
  '3–7 outcome-protecting rules',
  'one product-behavior diagram',
  'Diagram not applicable',
]);
requireAll('prd report composition', prd, [
  '{{PRD_TOC}}',
  '{{PRD_ARTIFACT_LINKS}}',
  '{{COMPOSED_PRD_CONTENT}}',
  'Compose the sourced PRD content before fitting it to the report shell',
  'The template must not add, remove, reorder, or multiply product requirements',
]);

requireAll('html report ownership boundary', report, [
  'Presentation must not determine PRD substance',
  'The `prd` skill owns which product slices, stories, scenarios, storyboards, rules, and acceptance criteria exist',
  'one intended-flow storyboard per user-facing product slice',
  'multiple UI alternatives only when an unresolved product decision requires comparison',
  'scroll-reveal motion',
  'high-quality explanatory diagram',
]);

requireAll('content-neutral PRD template', template, [
  '{{PRD_TOC}}',
  '{{PRD_ARTIFACT_LINKS}}',
  '{{COMPOSED_PRD_CONTENT}}',
  '{{PRD_HEADER_SUPPORT}}',
  'data-artifact-motion="native"',
]);
forbidAll('content-neutral PRD template', template, [
  '{{STORY_001_TITLE}}',
  '{{MAIN_GIVEN}}',
  '{{UI_OPTION_A_TITLE}}',
  'id="domain-interactions"',
  'id="ready-for-design"',
]);

requireAll('design-solution', design, [
  'approved product definition, rationale, product slices, stories, scenarios, observable acceptance',
  'Missing required PRD behavior blocks design',
  'optional UI alternatives and domain maps do not',
  'Design must not invent product behavior',
]);
requireAll('system-diagram', diagram, [
  'A substantive PRD normally includes one product-behavior diagram',
  'A durable feature design normally includes one causal architecture diagram',
  'Diagram not applicable',
  'existing evidence supports the figure',
]);

forbidAll('prd', prd, [
  'Stories, post-story flow rows, domain maps, diagrams, wireframes, UI alternatives, selectors, and readiness ceremony are optional',
  'Start from a byte-for-byte copy of this template',
]);
forbidAll('html-report-designer', report, [
  '2-3 detailed UI wireframe options with step-by-step use and expected outcomes when the change is user-facing',
]);

console.log('PASS: PRD guidance requires product-complete slices while the HTML shell remains content-neutral');

function requireAll(label, content, markers) {
  const missing = markers.filter((marker) => !content.includes(marker));
  assert(missing.length === 0, `${label} missing: ${missing.join(', ')}`);
}

function forbidAll(label, content, markers) {
  const found = markers.filter((marker) => content.includes(marker));
  assert(found.length === 0, `${label} retains conflicting guidance: ${found.join(', ')}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
