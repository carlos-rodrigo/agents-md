#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const skillPath = 'skills/un-slopify/SKILL.md';

assert(existsSync(join(root, skillPath)), 'un-slopify skill must exist');
const skill = read(skillPath);
const agents = read('AGENTS.md');
const readme = read('README.md');

assert(/^---\n[\s\S]*?name: un-slopify\n[\s\S]*?description: [^\n]+\n[\s\S]*?---\n/.test(skill), 'un-slopify needs valid frontmatter and a specific description');
requireAll('AGENTS output discipline', agents, [
  'Write answer-first, high-information output',
  'State each material point once',
  'Concision must not weaken artifact contracts or become a word-count target',
]);
requireAll('un-slopify contract', skill, [
  'semantic-preserving compactor',
  '## Inputs',
  '## Modes',
  '### Audit',
  '### Rewrite',
  '### Embedded',
  '## Invariants',
  'Preserve material meaning',
  'Preserve consequential literals',
  'Do not invent',
  'Do not resolve ambiguity',
  'One assertion, one home',
  'Respect artifact grammar',
  'Do not edit generated projections',
  'Executable code is audit-only',
  '## Artifact profiles',
  'PRD',
  'Design / ADR',
  'Plan / task',
  'Review',
  'Code comments',
  '## Output',
  '## Acceptance gate',
  'Reduction is evidence, not a target',
]);
forbidAll('un-slopify scope boundary', skill, [
  'evade AI detection',
  'always rewrite executable code',
  'delete every caveat',
]);
assert(readme.includes('**un-slopify**'), 'README must list the un-slopify skill');

const evals = JSON.parse(read('skills/un-slopify/evals/evals.json'));
assert(evals.skill_name === 'un-slopify', 'un-slopify eval suite name must match frontmatter');
assert(Array.isArray(evals.evals) && evals.evals.length >= 7, 'un-slopify needs at least seven behavioral evals');
assertUnique(evals.evals.map((item) => item.id), 'un-slopify eval id');
evals.evals.forEach((item, index) => {
  const label = `un-slopify eval[${index}]`;
  assert(Number.isInteger(item.id), `${label}.id must be an integer`);
  assertText(item.prompt, `${label}.prompt`);
  assertText(item.expected_output, `${label}.expected_output`);
  assert(Array.isArray(item.files), `${label}.files must be an array`);
  assert(Array.isArray(item.expectations) && item.expectations.length >= 3, `${label}.expectations needs at least three checks`);
  item.expectations.forEach((expectation, expectationIndex) => assertText(expectation, `${label}.expectations[${expectationIndex}]`));
});
const evalText = JSON.stringify(evals);
requireAll('un-slopify eval coverage', evalText, ['PRD', 'ADR', 'file:line', 'code comments', 'executable code', 'uncertainty', 'URL']);

const triggers = JSON.parse(read('skills/un-slopify/evals/triggers.json'));
assert(Array.isArray(triggers) && triggers.length >= 16, 'un-slopify needs at least 16 trigger cases');
assert(triggers.filter((item) => item.should_trigger).length >= 8, 'un-slopify needs at least eight positive trigger cases');
assert(triggers.filter((item) => !item.should_trigger).length >= 8, 'un-slopify needs at least eight negative trigger cases');
assertUnique(triggers.map((item) => item.query), 'un-slopify trigger query');
triggers.forEach((item, index) => {
  assertText(item.query, `un-slopify trigger[${index}].query`);
  assert(item.query.length >= 30, `un-slopify trigger[${index}] should be realistic, not a keyword stub`);
  assert(typeof item.should_trigger === 'boolean', `un-slopify trigger[${index}].should_trigger must be boolean`);
});

console.log('PASS: un-slopify has concise defaults, semantic-preservation boundaries, artifact profiles, and eval coverage');

function requireAll(label, content, markers) {
  const missing = markers.filter((marker) => !content.includes(marker));
  assert(missing.length === 0, `${label} missing: ${missing.join(', ')}`);
}
function forbidAll(label, content, markers) {
  const found = markers.filter((marker) => content.includes(marker));
  assert(found.length === 0, `${label} retains conflicting guidance: ${found.join(', ')}`);
}
function assertText(value, label) {
  assert(typeof value === 'string' && value.trim().length > 0, `${label} must be non-empty text`);
}
function assertUnique(values, label) {
  assert(new Set(values).size === values.length, `${label}s must be unique`);
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
