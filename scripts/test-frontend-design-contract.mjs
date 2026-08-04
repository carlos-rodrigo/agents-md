#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFileSync(join(root, path), 'utf8');
const skill = read('skills/frontend-design/SKILL.md');

assert(/^---\n[\s\S]*?\n---\n/.test(skill), 'frontend-design needs YAML frontmatter');
requireAll('frontend-design', skill, [
  '## Quality precedence',
  '**Operate:**',
  '**Read:**',
  '**Persuade:**',
  '**Experience:**',
  '## Proposed mockup mode',
  'one evidence-grounded direction',
  'does not authorize implementation',
  '## Product truth and authority',
  '## State completeness',
  '## Content and layout resilience',
  '## Verification',
  'Do not invent required controls, fields, roles, domain categories, validation, completion rules, storage behavior, export behavior, or product capabilities',
  'Example quantities describe scale, not limits or business rules',
  'Do not use absolute positioning for meaning-bearing connectors',
  'preserve a printable or static summary',
]);
forbidAll('frontend-design', skill, [
  'Pick an extreme',
  'What makes this UNFORGETTABLE?',
  'hover states that surprise',
  'NEVER use generic AI-generated aesthetics',
  "don't hold back",
  'one well-orchestrated page load with staggered reveals',
]);

const references = {
  'skills/frontend-design/references/new-surface.md': [
    '## Discover', '## Ground visual direction', '## Direction contract',
    'A redesign replaces visual language but preserves approved product truth',
  ],
  'skills/frontend-design/references/interaction-and-states.md': [
    '## Product-authority guard', '## State matrix', '## Content resilience',
    '## App-like offline artifacts',
  ],
  'skills/frontend-design/references/visual-direction.md': [
    '## Derive, do not decorate', '## Composition', '## Specificity test',
  ],
  'skills/frontend-design/references/verification.md': [
    '## Source-of-truth audit', '400% reflow', '## Accessibility',
    '## Visual critique',
  ],
};
for (const [path, markers] of Object.entries(references)) {
  assert(existsSync(join(root, path)), `missing frontend reference ${path}`);
  assert(skill.includes(path.replace('skills/frontend-design/', '')), `frontend-design does not link ${path}`);
  requireAll(path, read(path), markers);
}

const triggers = parseJson('skills/frontend-design/evals/triggers.json');
assert(Array.isArray(triggers) && triggers.length >= 15, 'frontend trigger set should cover at least 15 cases');
assert(triggers.some((item) => item.should_trigger === true), 'frontend triggers need positive cases');
assert(triggers.some((item) => item.should_trigger === false), 'frontend triggers need negative cases');
assertUnique(triggers.map((item) => item.query), 'frontend trigger query');
for (const [index, item] of triggers.entries()) {
  assert(typeof item.query === 'string' && item.query.trim().length >= 12, `trigger ${index} needs a meaningful query`);
  assert(typeof item.should_trigger === 'boolean', `trigger ${index} needs a boolean should_trigger`);
}
assertTrigger(triggers, 'Review these existing UI files for WCAG issues but do not modify them.', false);
assertTrigger(triggers, 'Build an accessible command palette component for our web application.', true);
assertTrigger(triggers, 'The Draft PRD needs one proposed high-fidelity mockup for product review before approval.', true);
assertTrigger(triggers, 'Write a PRD for bulk status editing; product behavior is still undecided.', false);

const evalDocument = parseJson('skills/frontend-design/evals/evals.json');
assert(evalDocument.skill_name === 'frontend-design', 'frontend eval file needs the frontend-design skill name');
assert(Array.isArray(evalDocument.evals) && evalDocument.evals.length >= 8, 'frontend eval set should cover implementation and proposed-mockup scenarios');
assertUnique(evalDocument.evals.map((item) => item.id), 'frontend eval id');
assert(evalDocument.evals.some((item) => item.id === 'prd-proposed-mockup'), 'frontend evals need the PRD proposed-mockup boundary');
for (const item of evalDocument.evals) {
  assert(/^[a-z0-9-]+$/.test(item.id), `invalid frontend eval id ${item.id}`);
  assert(typeof item.prompt === 'string' && item.prompt.trim().length >= 40, `${item.id} needs a meaningful prompt`);
  assert(typeof item.expected_output === 'string' && item.expected_output.trim().length >= 60, `${item.id} needs an observable expected output`);
}

console.log('PASS: frontend-design authority, state, resilience, reference, trigger, and evaluation contracts');

function parseJson(path) {
  try {
    return JSON.parse(read(path));
  } catch (error) {
    throw new Error(`${path} is not valid JSON: ${error.message}`);
  }
}

function assertTrigger(triggers, query, expected) {
  const item = triggers.find((candidate) => candidate.query === query);
  assert(item, `missing representative trigger: ${query}`);
  assert(item.should_trigger === expected, `unexpected trigger result for: ${query}`);
}

function assertUnique(values, label) {
  assert(new Set(values).size === values.length, `${label}s must be unique`);
}

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
