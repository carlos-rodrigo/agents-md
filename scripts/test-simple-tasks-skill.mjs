#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
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
]);

for (const [label, content] of [
  ['implement-task', implementTask],
  ['loop skill', loopSkill],
]) {
  requireAll(label, content, [
    '`Required behavior`',
    '`Required implementation`',
    '`In scope`',
    '`Out of scope`',
    '`Invariants`',
    'Treat `Inspect first` or `Likely files` as navigation, not required edits',
    'without chat history or invented product decisions',
  ]);
}

requireAll('loop prompt', loopPrompt, [
  'Goal, Change, Done',
  'required behaviors/implementation, scope/non-goals, invariants',
  'Inspect first/Likely files as advisory navigation',
  'Setup/repro → Fast → User/system → Edge → Gate',
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
