#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const simpleTasks = read('skills/simple-tasks/SKILL.md');
const implementTask = read('skills/implement-task/SKILL.md');
const loopSkill = read('skills/loop/SKILL.md');
const loopPrompt = read('skills/loop/prompt.md');
const feedbackLoop = read('skills/feedback-loop/SKILL.md');

requireAll('simple-tasks template', simpleTasks, [
  '- Source anchors:',
  '- Facts / decisions:',
  '- Required behavior:',
  '- In scope:',
  '- Out of scope:',
  '- Invariants:',
  '- Inspect first (advisory, not a required edit):',
  '- Setup / repro:',
  '- Fast:',
  '- User/system:',
  '- Edge:',
  '- Gate:',
  '## Loop-ready detail floor',
  'fresh agent readiness check',
  'without chat history, broad rediscovery, or invented product behavior',
  'scripts/validate-task.mjs',
  '<simple-tasks-dir>',
  'authorization_basis',
  'authorization_fingerprint',
  '- Last failing check:',
  '- Follow-up applied to next task:',
]);

requireAll('implement-task', implementTask, [
  'Required behavior/implementation, scope/non-goals, invariants',
  'Treat `Inspect first` and legacy `Likely files` as navigation',
  'without chat history or invented decisions',
  'scripts/validate-task.mjs',
  '<simple-tasks-dir>',
]);

requireAll('loop skill', loopSkill, [
  '`Required behavior`',
  '`Required implementation`',
  '`In scope`',
  '`Out of scope`',
  '`Invariants`',
  'Treat `Inspect first` or `Likely files` as navigation, not required edits',
  'without chat history or invented product decisions',
  'scripts/validate-task.mjs',
  '<simple-tasks-dir>',
  '`authorization_fingerprint`',
]);

requireAll('loop prompt', loopPrompt, [
  'Goal, Change, Done',
  'required behaviors/implementation, scope/non-goals, invariants',
  'Inspect first/Likely files as advisory navigation',
  'Setup/repro → Fast → User/system → Edge → Gate',
  'authorization metadata/fingerprint',
]);
requireAll('feedback-loop', feedbackLoop, ['- Setup / repro:', '- Fast:', '- User/system:', '- Edge:', '- Gate:']);

assert(!loopPrompt.includes('Goal, Done, Execute bullets'), 'loop prompt still contains the old task-contract interpretation');
assert(simpleTasks.indexOf('- Source anchors:') < simpleTasks.indexOf('- Required behavior:'), 'source anchors must precede execution requirements');
assert(simpleTasks.indexOf('- Required behavior:') < simpleTasks.indexOf('- Setup / repro:'), 'requirements must precede verification');

console.log('PASS: simple-tasks loop-ready detail floor and downstream contracts are aligned');

function requireAll(label, content, markers) {
  const missing = markers.filter((marker) => !content.includes(marker));
  assert(missing.length === 0, `${label} missing: ${missing.join(', ')}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
