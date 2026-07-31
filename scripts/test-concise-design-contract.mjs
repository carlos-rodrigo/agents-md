#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const skill = read('skills/design-solution/SKILL.md');

assert(/^---\n[\s\S]*?name: design-solution\n[\s\S]*?description: [^\n]+\n[\s\S]*?---\n/.test(skill), 'design-solution needs valid frontmatter and a specific description');
requireAll('design authority and structure', skill, [
  'Start durable design only from an explicitly human-approved `prd.document.json`',
  'Skip a durable design for a tiny clear change',
  '**Approved** — only after explicit human approval',
  '**`authority`**', '**`pressure`**', '**`seam`**', '**`path`**', '**`diagram`**', '**`decisions`**', '**`proof`**', '**`boundary`**',
  'references/optional-design-recipes.md',
  'Every durable design must invoke `system-diagram`',
  'do not use hand-authored SVGs or a `Diagram not applicable` escape',
  '**Decision recorded**',
  'New architecture choices remain Proposed until a human accepts them',
  'docs/adrs/architecture.md',
  '<html-report-designer-dir>/scripts/render-canonical-report.mjs',
  'create task files inside this skill',
]);
assertInOrder(skill, ['**`authority`**', '**`pressure`**', '**`seam`**', '**`path`**', '**`diagram`**', '**`decisions`**', '**`proof`**', '**`boundary`**'], 'design role sequence');
forbidAll('design presentation and workflow boundary', skill, [
  'design-template.html', '{{DESIGN_TOC}}', '{{COMPOSED_DESIGN_CONTENT}}', '.diagram-reveal', 'add `reveal`', 'explicit approved product brief', 'Slices/tasks:', 'execute directly',
]);

const reference = 'skills/design-solution/references/optional-design-recipes.md';
assert(existsSync(join(root, reference)), 'optional design recipes must exist');
requireAll('optional design recipes', read(reference), ['Interface consequences', 'Contracts, domain, data, and persistence', 'Operations, rollout, and risk', 'Outside-in architecture slice outline', 'Traceability']);

const triggers = JSON.parse(read('skills/design-solution/evals/triggers.json'));
assert(triggers.length >= 10, 'design trigger evals need broad positive/negative coverage');
assert(triggers.some((item) => item.should_trigger === true), 'design trigger evals need positive cases');
assert(triggers.some((item) => item.should_trigger === false), 'design trigger evals need negative cases');
triggers.forEach((item, index) => assertTriggerShape(item, `design trigger[${index}]`));
assertUnique(triggers.map((item) => item.query), 'design trigger query');
assertTrigger(triggers, 'Write a PRD because the actor workflow, permission behavior, and observable acceptance are still unclear.', false);
assertTrigger(triggers, 'Translate the Approved import PRD into a technical design with ownership, retry recovery, and contracts.', true);

console.log('PASS: design-solution has a concise approved-authority, architecture, decision, diagram, trigger, and task-boundary contract');

function requireAll(label, content, markers) { const missing = markers.filter((marker) => !content.includes(marker)); assert(missing.length === 0, `${label} missing: ${missing.join(', ')}`); }
function forbidAll(label, content, markers) { const found = markers.filter((marker) => content.includes(marker)); assert(found.length === 0, `${label} retains conflicting guidance: ${found.join(', ')}`); }
function assertTrigger(items, query, expected) { const item = items.find((candidate) => candidate.query === query); assert(item && item.should_trigger === expected, `unexpected trigger contract: ${query}`); }
function assertTriggerShape(item, label) { assert(item && typeof item === 'object' && !Array.isArray(item), `${label} must be an object`); assert(Object.keys(item).sort().join(',') === 'query,should_trigger', `${label} must contain only query and should_trigger`); assert(typeof item.query === 'string' && item.query.trim(), `${label}.query must be non-empty text`); assert(typeof item.should_trigger === 'boolean', `${label}.should_trigger must be boolean`); }
function assertUnique(values, label) { assert(new Set(values).size === values.length, `${label}s must be unique`); }
function assertInOrder(content, markers, label) { const positions = markers.map((marker) => content.indexOf(marker)); assert(positions.every((position) => position >= 0) && positions.every((position, index) => index === 0 || position > positions[index - 1]), `${label} must match the renderer's declared order`); }
function assert(condition, message) { if (!condition) throw new Error(message); }
