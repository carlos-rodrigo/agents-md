#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'skills/implement-task/SKILL.md'), 'utf8');

requireAll([
  'Load `simple-tasks`',
  'scripts/validate-task.mjs',
  '`authorization_fingerprint`',
  'verification_plan',
  'If the acceptance check already passes',
  'already satisfied',
  'non-discriminating',
  'no-op',
  'sourced acceptance',
  'Do not invent product behavior',
  'Failed required checks cannot produce `done`',
]);
forbidAll([
  'If it already passes, tighten the test/task',
  'Refresh semantic index',
]);

const lineCount = skill.split('\n').length;
assert(lineCount <= 220, `Implement Task should remain a lean execution specialization (found ${lineCount} lines, max 220)`);

console.log('PASS: Implement Task handles red, false-positive, no-op, and failure paths without duplicated completion work');

function requireAll(markers) {
  const missing = markers.filter((marker) => !skill.includes(marker));
  assert(missing.length === 0, `Implement Task missing: ${missing.join(', ')}`);
}

function forbidAll(markers) {
  const found = markers.filter((marker) => skill.includes(marker));
  assert(found.length === 0, `Implement Task retains unsafe/unrelated guidance: ${found.join(', ')}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
