#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const simpleTasks = read('skills/simple-tasks/SKILL.md');
const loopSkill = read('skills/loop/SKILL.md');
const loopPrompt = read('skills/loop/prompt.md');
const feedbackLoop = read('skills/feedback-loop/SKILL.md');
const plan = read('skills/plan/SKILL.md');
const areYouProud = read('skills/are-you-proud/SKILL.md');

assert(!existsSync(join(root, 'skills/simple-tasks/scripts/validate-task.mjs')), 'task document validator must be removed');
for (const path of ['AGENTS.md', 'skills/simple-tasks/SKILL.md', 'skills/loop/SKILL.md', 'skills/loop/prompt.md']) {
  assert(!/validate-task\.mjs|authorization_fingerprint|authorization_basis|authorized_by|authorized_at|verification_plan|--fingerprint/.test(read(path)), `${path} still requires removed machinery`);
}
for (const status of ['todo', 'in-progress', 'blocked', 'done']) {
  assert(simpleTasks.includes('`' + status + '`'), `task lifecycle missing ${status}`);
}
assert(simpleTasks.includes('status: todo'), 'new tasks start todo');
assert(!/`draft`|`ready`|## Validation/.test(simpleTasks), 'task skill must use the current lifecycle without document validation');
for (const marker of ['- Goal:', '- Done:', '- Depends:', '## Feedback loop']) {
  assert(simpleTasks.includes(marker), `task brief lost ${marker}`);
}
assert(simpleTasks.includes('with the `feedback-loop` skill'), 'tasks get their feedback loop from the feedback-loop skill');
for (const marker of ['- Setup:', '- Repro:', '- Test:', '- Browser: agent-browser', '- API: `curl', '- Script:', '- Edge:', '- Gate:', '- Review: Oracle', '## Result section', 'Removing or weakening an expected observation']) {
  assert(feedbackLoop.includes(marker), `feedback-loop skill missing ${marker}`);
}
assert(feedbackLoop.includes('Fix every must-fix and should-fix finding') && feedbackLoop.includes('Iterate until proud'), 'review rounds iterate until proud');
assert(feedbackLoop.includes('foreground `subagent` tool'), 'shell-loop Oracle review uses a foreground subagent');
assert(feedbackLoop.includes('manager summons Oracle') && feedbackLoop.includes('manager alone updates the active board'), 'managed delivery separates builder proof from manager review and coordination');
assert(feedbackLoop.includes('self-review is not independent approval'), 'managed delivery cannot bypass unavailable Oracle review');
const instructions = read('AGENTS.md');
assert(instructions.includes('delegate the authorized task or task set to `manager`'), 'implementation requests route to manager');
assert(instructions.includes('clear, specific names from the domain') && instructions.includes('keep comments that explain non-obvious reasons'), 'readability guidance preserves useful comments');
assert(simpleTasks.includes('Do not mark `done` without a result and feedback-loop evidence'), 'completion still requires actual evidence');
assert(feedbackLoop.includes('A task is `done` only when every check passed'), 'failed checks still block completion');
assert(loopSkill.includes('Task status alone does not grant permission'), 'permission boundaries remain');
assert(loopSkill.includes('`todo`') && loopSkill.includes('`in-progress`'), 'loop follows the current lifecycle');
assert(loopPrompt.includes('todo/in-progress'), 'background prompt follows the current lifecycle');
assert(loopPrompt.includes('Do not infer permission from task status'), 'status is not permission');
assert(loopPrompt.includes("Run the task's feedback loop before marking done"), 'background work runs the feedback loop');
assert(loopPrompt.includes('foreground `subagent` tool (agent `oracle`)'), 'background work runs Oracle review rounds');
assert(loopSkill.includes('Execute the task brief directly') && loopPrompt.includes('Execute the task brief directly'), 'loop executes task briefs directly');
assert(!existsSync(join(root, 'skills/implement-task')), 'redundant implementation skill must be removed');
for (const path of ['skills/simple-tasks/SKILL.md', 'skills/loop/SKILL.md', 'skills/loop/prompt.md', 'README.md', 'docs/adrs/architecture.md']) {
  assert(!read(path).includes('implement-task'), `${path} references the removed skill`);
}

for (const marker of ['.features/{feature}/plan.md', '## Decisions needed', '## Behavior', '## Design', '## Verification', '## Build order', '## Review with are-you-proud', 'Iterate until proud', 'no must-fix and no should-fix findings']) {
  assert(plan.includes(marker), `plan skill missing ${marker}`);
}
assert(simpleTasks.includes('## Review the tasks') && simpleTasks.includes('`are-you-proud`') && simpleTasks.includes('Iterate until proud'), 'task sets iterate are-you-proud until proud');
assert(simpleTasks.includes('- Files:'), 'tasks name the files they expect to change');
for (const marker of ['## Iterate until proud', 'no must-fix and no should-fix findings', '## For plans and tasks', '**Consistency:**', '**Clarity:**', '**Ambiguity:**', '**Verifiability:**']) {
  assert(areYouProud.includes(marker), `are-you-proud missing ${marker}`);
}

for (const path of ['skills/plan/SKILL.md', 'skills/simple-tasks/SKILL.md', 'skills/feedback-loop/SKILL.md', 'skills/loop/prompt.md', 'skills/loop/SKILL.md', 'README.md']) {
  assert(!/(?:after|up to) (?:3|three) rounds/i.test(read(path)), `${path} still caps review rounds`);
}

console.log('PASS: task workflow keeps scope, feedback loops, and review without document-validation machinery');
