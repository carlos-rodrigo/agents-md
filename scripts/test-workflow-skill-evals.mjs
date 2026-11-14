#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skills = {
  'simple-tasks': ['scope', 'blocked', '_active.md', 'todo'],
};

for (const [skillName, coverageTerms] of Object.entries(skills)) {
  const evalPath = join(root, 'skills', skillName, 'evals', 'evals.json');
  const triggerPath = join(root, 'skills', skillName, 'evals', 'triggers.json');
  assert(existsSync(evalPath), `${skillName} needs evals/evals.json`);
  assert(existsSync(triggerPath), `${skillName} needs evals/triggers.json`);

  const suite = JSON.parse(readFileSync(evalPath, 'utf8'));
  assert(suite.skill_name === skillName, `${skillName} eval suite name must match frontmatter`);
  assert(Array.isArray(suite.evals) && suite.evals.length >= 4, `${skillName} needs at least four behavioral evals`);
  assertUnique(suite.evals.map((item) => item.id), `${skillName} eval id`);
  suite.evals.forEach((item, index) => {
    const label = `${skillName} eval[${index}]`;
    assert(Number.isInteger(item.id), `${label}.id must be an integer`);
    assertText(item.prompt, `${label}.prompt`);
    assertText(item.expected_output, `${label}.expected_output`);
    assert(Array.isArray(item.files), `${label}.files must be an array`);
    if (skillName === 'simple-tasks') assert(item.files.length > 0, `${label} needs stateful fixture files`);
    item.files.forEach((file) => assert(existsSync(join(root, 'skills', skillName, file)), `${label} fixture does not exist: ${file}`));
    assert(Array.isArray(item.expectations) && item.expectations.length >= 3, `${label}.expectations needs at least three checks`);
    item.expectations.forEach((expectation, expectationIndex) => assertText(expectation, `${label}.expectations[${expectationIndex}]`));
  });
  const evalText = JSON.stringify(suite);
  coverageTerms.forEach((term) => assert(evalText.includes(term), `${skillName} evals must cover ${term}`));

  const triggers = JSON.parse(readFileSync(triggerPath, 'utf8'));
  assert(Array.isArray(triggers) && triggers.length >= 16, `${skillName} needs at least 16 trigger cases`);
  assert(triggers.filter((item) => item.should_trigger).length >= 7, `${skillName} needs broad positive trigger coverage`);
  assert(triggers.filter((item) => !item.should_trigger).length >= 7, `${skillName} needs broad near-miss trigger coverage`);
  assertUnique(triggers.map((item) => item.query), `${skillName} trigger query`);
  triggers.forEach((item, index) => {
    assertText(item.query, `${skillName} trigger[${index}].query`);
    assert(item.query.length >= 30, `${skillName} trigger[${index}] should be realistic, not a keyword stub`);
    assert(typeof item.should_trigger === 'boolean', `${skillName} trigger[${index}].should_trigger must be boolean`);
  });
}

console.log('PASS: workflow skills have realistic behavioral, trigger, and stateful fixture contracts');

function assertText(value, label) {
  assert(typeof value === 'string' && value.trim().length > 0, `${label} must be non-empty text`);
}

function assertUnique(values, label) {
  assert(new Set(values).size === values.length, `${label}s must be unique`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
