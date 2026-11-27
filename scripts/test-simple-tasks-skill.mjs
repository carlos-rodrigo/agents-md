#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const simpleTasks = read('skills/simple-tasks/SKILL.md');
const feedbackLoop = read('skills/feedback-loop/SKILL.md');
const plan = read('skills/plan/SKILL.md');
const areYouProud = read('skills/are-you-proud/SKILL.md');

assert(!existsSync(join(root, 'skills/simple-tasks/scripts/validate-task.mjs')), 'task document validator must be removed');
for (const path of ['AGENTS.md', 'skills/simple-tasks/SKILL.md']) {
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
for (const marker of ['- Eval:', '- Discriminates:', '- Guard:', '- Outcome (after deploy, non-blocking):', 'A case that passes sometimes is a failure', 'rerun from the first check that failed or that the fix could affect', 'evidence-backed no-op', 'outside the required checks', 'Run the Gate last', 'Each review finding counts as one distinct failure', 'never `done`', 'Every task gets reviewed']) {
  assert(feedbackLoop.includes(marker), `feedback-loop skill missing ${marker}`);
}
for (const marker of ['## When the loop cannot be written yet', '- Diagnose:', '- Baseline:', '- Harness:', '- Diagnosis:', '- Candidates:', 'Trust it only after it shows the failure on the base', 'keep the simplest one that meets the expected observation', 'Stop when two experiments in a row add no new information', 'Do not start the fix yet', 'diagnostic code never enters the change', 'Failing to reproduce is not a no-op', 'ask the user rather than invent a threshold', 'not only that the symptom stopped', 'Record that run on the base as the Baseline', 'wait for the observable condition instead of waiting longer', 'fails on base most runs, for the diagnosed reason', 'counts as a repair attempt under Stop', 'The user owns that decision', 'creates or rescopes tasks only after the user approves', 'Skip these stages when the checks can be written directly', 'do Diagnose → Baseline → Harness once']) {
  assert(feedbackLoop.includes(marker), `feedback-loop diagnosis stage missing ${marker}`);
}
for (const [name, text] of [['simple-tasks', simpleTasks], ['plan', plan]]) {
  assert(/always ends with an Oracle review that uses the `are-you-proud` skill/.test(text), `${name} must say up front that the Oracle reviews`);
  assert(text.includes('agent `oracle`') && /read the `are-you-proud` skill and review it yourself, and report that the review was not independent/.test(text), `${name} must use the Oracle and state when self-review replaced it`);
  assert(/final verdict, the number of rounds, and the reviewer/.test(text) && text.includes('it does not delay the review'), `${name} reports the verdict and does not wait on user decisions`);
  assert(text.includes('a round that led to a fix is never the last'), `${name} review cannot stop right after a fix`);
  assert(!text.includes('Outside manager-led work, apply it yourself'), `${name} review has one reviewer rule`);
}
for (const marker of ['Test (property or differential):', 'at least 3 trials each', 'run the Gate on the base and record it as `Base`', 'A failing base is a blocker unless fixing that failure is the task', 'adds no failure beyond them', 'special-cases test inputs', 'before every review round', "treats the builder's Result as claims", '- Base:', '- Tried:', '- Next:', 'Update `Tried` and `Next` after each milestone']) {
  assert(feedbackLoop.includes(marker), `feedback-loop proof-integrity rule missing ${marker}`);
}
assert(areYouProud.includes('No unapproved deletion, skipping, or loosening of tests') && areYouProud.includes('are claims until a rerun or saved artifact confirms them'), 'are-you-proud checks test gaming and unverified claims');
assert(simpleTasks.includes('Diagnose, Baseline, and Harness steps say what to find out') && simpleTasks.includes('are not placeholders'), 'tasks needing diagnosis are still ready');
assert(!/`prd`|loop:gate|nuvo-/.test(feedbackLoop), 'feedback-loop has no references to removed skills or other projects');
assert(feedbackLoop.includes('foreground `subagent` tool'), 'Oracle review uses a foreground subagent');
assert(feedbackLoop.includes('manager summons Oracle') && feedbackLoop.includes('manager alone updates the active board'), 'managed delivery separates builder proof from manager review and coordination');
assert(feedbackLoop.includes('self-review is not independent approval'), 'managed delivery cannot bypass unavailable Oracle review');
const instructions = read('AGENTS.md');
assert(instructions.includes('delegate the authorized task or task set to `manager`'), 'implementation requests route to manager');
assert(instructions.includes('clear, specific names from the domain') && instructions.includes('keep comments that explain non-obvious reasons'), 'readability guidance preserves useful comments');
assert(simpleTasks.includes('Do not mark `done` without a result and feedback-loop evidence'), 'completion still requires actual evidence');
assert(feedbackLoop.includes('A task is `done` only when every check passed'), 'failed checks still block completion');
assert(simpleTasks.includes('A task does not grant permission beyond the user\'s request'), 'permission boundaries remain');
assert(simpleTasks.includes('Execute the task brief directly'), 'task briefs are executed directly');
assert(!existsSync(join(root, 'skills/loop')), 'shell loop skill must be removed; manager replaces it');
assert(!existsSync(join(root, 'skills/implement-task')), 'redundant implementation skill must be removed');
for (const path of ['skills/simple-tasks/SKILL.md', 'README.md', 'docs/adrs/architecture.md']) {
  assert(!read(path).includes('implement-task'), `${path} references the removed skill`);
}

for (const marker of ['.features/{feature}/plan.md', '## Decisions needed', '## Behavior', '## Design', '## Verification', '## Build order', '## Review with are-you-proud', 'Iterate until proud', 'no must-fix and no should-fix findings']) {
  assert(plan.includes(marker), `plan skill missing ${marker}`);
}
assert(simpleTasks.includes('## Review the tasks') && simpleTasks.includes('`are-you-proud`') && simpleTasks.includes('Iterate until proud'), 'task sets iterate are-you-proud until proud');
assert(simpleTasks.includes('- Files:'), 'tasks name the files they expect to change');
for (const marker of ['## Write the brief', '## Ready to implement', '- Required implementation:', '- Inspect first:', '(navigation only)', 'Copy any decision that exists only in chat', '- Current:', 'only the manager updates the board']) {
  assert(simpleTasks.includes(marker), `simple-tasks missing ${marker}`);
}
assert(!/authorization_|validate-task|`draft`|`ready`|html-report|document\.json/.test(simpleTasks), 'simple-tasks has no authorization, validator, or report machinery');
for (const marker of ['## Iterate until proud', 'no must-fix and no should-fix findings', '## For plans and tasks', '**Consistency:**', '**Clarity:**', '**Ambiguity:**', '**Verifiability:**']) {
  assert(areYouProud.includes(marker), `are-you-proud missing ${marker}`);
}

for (const path of ['skills/plan/SKILL.md', 'skills/simple-tasks/SKILL.md', 'skills/feedback-loop/SKILL.md', 'README.md']) {
  assert(!/(?:after|up to) (?:3|three) rounds/i.test(read(path)), `${path} still caps review rounds`);
}

console.log('PASS: task workflow keeps scope, feedback loops, and review without document-validation machinery');
