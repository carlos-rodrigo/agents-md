#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const skill = read('skills/prd/SKILL.md');

assert(/^---\n[\s\S]*?name: prd\n[\s\S]*?description: [^\n]+\n[\s\S]*?---\n/.test(skill), 'PRD needs valid frontmatter and a specific description');
requireAll('PRD authority and structure', skill, [
  'Skip a durable PRD for a tiny, obvious change',
  '**Approved** — only after explicit human approval',
  '**`product`**', '**`problem`**', '**`behavior`**', '**`diagram`**', '**`slices`**', '**`scope`**',
  'references/product-slice-contract.md',
  'Every substantive PRD must invoke `system-diagram`',
  'does not use a hand-authored SVG or a `Diagram not applicable` escape',
  '**Decision recorded**',
  'browser decision record is review input',
  '<html-report-designer-dir>/scripts/render-canonical-report.mjs',
  'Do not create tasks directly from the PRD',
  '## Go to the point',
  'State each fact once',
  'one recommended product behavior',
  'Do not use `table` blocks',
  'BDD specification',
  'Feature:',
  'Scenario:',
  'UI changes or visual suggestions',
  'A top-level source list is not enough',
  'Use these category names verbatim',
  'Deduplication pass',
  'responsive wireframe',
  'explicit request or evidence establishes',
  'Preserve accepted decisions',
  'one evidence-backed proposed mockup',
  'base-form verb phrase',
]);
assertInOrder(skill, ['**`product`**', '**`problem`**', '**`behavior`**', '**`diagram`**', '**`slices`**', '**`scope`**', '**`decisions`**'], 'PRD role sequence');
forbidAll('PRD presentation boundary', skill, [
  'prd-template.html', '{{PRD_TOC}}', '{{COMPOSED_PRD_CONTENT}}', '.diagram-reveal', 'add `reveal`', '3–7 outcome-protecting rules',
]);

const reference = 'skills/prd/references/product-slice-contract.md';
assert(existsSync(join(root, reference)), 'PRD product-slice reference must exist');
requireAll('product-slice reference', read(reference), ['Outcome and boundary', 'BDD specification', 'Feature:', 'Scenario:', 'Given', 'When', 'Then', 'Observable sequence', 'Acceptance', 'lowercase source IDs (`ac-001`', 'After this slice', 'lowercase common noun or determiner', 'base-form verb phrase', 'independently testable pass/fail conditions', 'Use one step for simple behavior', 'Duplication test']);

const evals = JSON.parse(read('skills/prd/evals/evals.json'));
const conciseUiEval = evals.evals.find((item) => item.id === 5);
assert(conciseUiEval, 'PRD evals need a concise UI-bearing BDD scenario');
const conciseUiContract = JSON.stringify(conciseUiEval);
requireAll('concise UI PRD eval', conciseUiContract, ['direct', 'BDD', 'mockup', 'table', 'alternative']);
const separationEval = evals.evals.find((item) => item.id === 6);
assert(separationEval, 'PRD evals need a diagram/mockup separation and authority-classification scenario');
requireAll('PRD separation eval', JSON.stringify(separationEval), ['causal product-behavior diagram', 'responsive wireframe', 'human-owned', 'Sourced fact', 'Approved product truth', 'lowercase', 'duplicate']);

const triggers = JSON.parse(read('skills/prd/evals/triggers.json'));
assert(triggers.length >= 10, 'PRD trigger evals need broad positive/negative coverage');
assert(triggers.some((item) => item.should_trigger === true), 'PRD trigger evals need positive cases');
assert(triggers.some((item) => item.should_trigger === false), 'PRD trigger evals need negative cases');
triggers.forEach((item, index) => assertTriggerShape(item, `PRD trigger[${index}]`));
assertUnique(triggers.map((item) => item.query), 'PRD trigger query');
assertTrigger(triggers, 'Design the service architecture for the already Approved import PRD, including ownership, state, and rollout.', false);
assertTrigger(triggers, 'We need a new onboarding recovery flow, but scope and the actor-visible failure behavior are still unresolved.', true);

console.log('PASS: PRD skill has a concise authority, structure, approval, decision, diagram, trigger, and portability contract');

function requireAll(label, content, markers) { const missing = markers.filter((marker) => !content.includes(marker)); assert(missing.length === 0, `${label} missing: ${missing.join(', ')}`); }
function forbidAll(label, content, markers) { const found = markers.filter((marker) => content.includes(marker)); assert(found.length === 0, `${label} retains conflicting guidance: ${found.join(', ')}`); }
function assertTrigger(items, query, expected) { const item = items.find((candidate) => candidate.query === query); assert(item && item.should_trigger === expected, `unexpected trigger contract: ${query}`); }
function assertTriggerShape(item, label) { assert(item && typeof item === 'object' && !Array.isArray(item), `${label} must be an object`); assert(Object.keys(item).sort().join(',') === 'query,should_trigger', `${label} must contain only query and should_trigger`); assert(typeof item.query === 'string' && item.query.trim(), `${label}.query must be non-empty text`); assert(typeof item.should_trigger === 'boolean', `${label}.should_trigger must be boolean`); }
function assertUnique(values, label) { assert(new Set(values).size === values.length, `${label}s must be unique`); }
function assertInOrder(content, markers, label) { const positions = markers.map((marker) => content.indexOf(marker)); assert(positions.every((position) => position >= 0) && positions.every((position, index) => index === 0 || position > positions[index - 1]), `${label} must match the renderer's declared order`); }
function assert(condition, message) { if (!condition) throw new Error(message); }
