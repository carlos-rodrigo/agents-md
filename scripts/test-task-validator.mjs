#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceValidator = join(root, 'skills/simple-tasks/scripts/validate-task.mjs');
assert(existsSync(sourceValidator), 'Simple Tasks must bundle scripts/validate-task.mjs');

const temp = mkdtempSync(join(tmpdir(), 'simple-task-validator-'));
const installedSkills = join(temp, 'installed-skills');
const installedSkill = join(installedSkills, 'simple-tasks');
const project = join(temp, 'project');
const tasks = join(project, '.features/example/tasks');

try {
  mkdirSync(join(installedSkill, 'scripts'), { recursive: true });
  cpSync(sourceValidator, join(installedSkill, 'scripts/validate-task.mjs'));
  mkdirSync(tasks, { recursive: true });

  writeTask('001-ready.md', readyTask());
  writeBoard('- [ ] TASK-001 — Ready behavior (ready)', 'TASK-001', 'complete');
  assertSuccess(run('001-ready.md'), 'authorized ready task validates from unrelated cwd');

  writeTask('001-ready.md', readyTask().replace('authorized_by: Carlos Rodrigo\n', ''));
  assertFailure(run('001-ready.md'), 'missing authorization field authorized_by', 'ready task without authorizer fails');

  writeTask('001-ready.md', readyTask().replace('- Goal: User observes the documented result', '- Goal:'));
  assertFailure(run('001-ready.md'), 'Goal bullet must have a value', 'empty binding bullet fails');

  writeTask('001-ready.md', readyTask().replace('Fast: `node test.mjs`', 'Fast: `TBD`'));
  assertFailure(run('001-ready.md'), 'unresolved placeholder', 'ready task with unresolved placeholder fails');

  for (const marker of ['{bounded request context}', '{expected result}', '{title}']) {
    writeTask('001-ready.md', readyTask().replace('Add one bounded behavior', marker));
    assertFailure(run('001-ready.md'), 'unresolved placeholder', `documented placeholder ${marker} fails`);
  }

  writeTask('001-ready.md', readyTask() + '\n## Notes\n\nPlaceholder validators must permit types such as `Promise<Result>`, unions such as `{ kind: "a" | "b" }` or `{ result?: "ok" | "error" }`, and objects such as `{ enabled: true }`, `{ required: true }`, or `{ fixture: fixturePath }`.\n');
  assertSuccess(run('001-ready.md'), 'legitimate generic and object syntax is not a placeholder');

  const fingerprinted = writeTask('001-ready.md', readyTask());
  writeFileSync(join(tasks, '001-ready.md'), fingerprinted.replace('Add one bounded behavior', 'Add two unauthorized behaviors'));
  assertFailure(run('001-ready.md'), 'authorization_fingerprint does not match', 'binding-contract edits invalidate authorization');

  writeApprovedDesign('Approved');
  writeTask('001-ready.md', readyTask({ basis: 'approved-design: docs/features/example/design.document.json' }));
  assertSuccess(runSourceValidator('001-ready.md'), 'Approved design source/current report authorizes readiness');

  writeApprovedDesign('Draft');
  writeTask('001-ready.md', readyTask({ basis: 'approved-design: docs/features/example/design.document.json' }));
  assertFailure(runSourceValidator('001-ready.md'), 'design status is Draft, expected Approved', 'Draft design cannot authorize readiness');

  writeApprovedDesign('Approved', { staleHtml: true });
  writeTask('001-ready.md', readyTask({ basis: 'approved-design: docs/features/example/design.document.json' }));
  assertFailure(runSourceValidator('001-ready.md'), 'review projection does not match', 'stale design report cannot authorize readiness');

  writeApprovedDesign('MalformedApproved');
  writeTask('001-ready.md', readyTask({ basis: 'approved-design: docs/features/example/design.document.json' }));
  assertFailure(runSourceValidator('001-ready.md'), 'canonical renderer --check failed', 'malformed Approved design cannot authorize readiness');

  writeTask('001-ready.md', doneTask());
  writeBoard('- [x] TASK-001 — Ready behavior (done)', 'none', 'complete');
  assertSuccess(run('001-ready.md'), 'done task with complete Result validates');

  writeTask('001-ready.md', doneTask().replace('- Review: self Are You Proud → no findings\n', ''));
  assertFailure(run('001-ready.md'), 'Review bullet', 'done task without review receipt fails');

  writeTask('001-ready.md', doneTask().replace('- Gate: npm test → passed', '- Gate: npm test → failed'));
  assertFailure(run('001-ready.md'), 'done task Gate records failure', 'done task cannot retain a failing final gate');

  writeTask('001-ready.md', doneTask().replace('- Gate: npm test → passed', '- Gate: npm test → skipped'));
  assertFailure(run('001-ready.md'), 'Gate records failure or incomplete evidence', 'done task cannot treat a skipped final gate as success');

  writeTask('001-ready.md', doneTask().replace('- Gate: npm test → passed', '- Gate: npm test → not passed'));
  assertFailure(run('001-ready.md'), 'Gate records failure or incomplete evidence', 'done task rejects negated success vocabulary');

  writeTask('001-ready.md', doneTask().replace('acceptance red → unit red/green → acceptance green', 'acceptance not green'));
  assertFailure(run('001-ready.md'), 'done task TDD records failure', 'done task rejects negated green evidence');

  writeTask('001-ready.md', doneTask().replace('binding instructions checked → satisfied', 'binding instructions checked → not satisfied'));
  assertFailure(run('001-ready.md'), 'done task Task contract records failure', 'done task rejects a negated contract receipt');

  writeTask('001-ready.md', doneTask().replace('node test.mjs → passed', 'not verified'));
  assertFailure(run('001-ready.md'), 'Feedback loop records failure', 'done task rejects negated feedback evidence');

  writeTask('001-ready.md', doneTask().replace('self Are You Proud → no findings', 'not approved'));
  assertFailure(run('001-ready.md'), 'Review records incomplete evidence', 'done task rejects negated review evidence');

  writeTask('001-ready.md', doneTask().replace('self Are You Proud → no findings', 'skipped because this fixture has no review surface'));
  assertSuccess(run('001-ready.md'), 'done task accepts a documented review skip with reason');

  writeTask('001-ready.md', doneTask() + '- Gate: failed\n');
  assertFailure(run('001-ready.md'), 'exactly one Gate bullet', 'duplicate terminal labels fail');

  writeTask('001-ready.md', blockedTask());
  writeBoard('- [ ] TASK-001 — Ready behavior (blocked)', 'TASK-001', 'blocked');
  assertSuccess(run('001-ready.md'), 'authorized blocked task with complete blocker receipt validates');

  writeTask('001-ready.md', blockedTask().replace('authorized_by: Carlos Rodrigo\n', ''));
  assertFailure(run('001-ready.md'), 'missing authorization field authorized_by', 'blocked task cannot bypass prior authorization');

  writeTask('001-ready.md', blockedTask().replace('- Blocker owner: environment', '- Blocker owner: somebody'));
  assertFailure(run('001-ready.md'), 'Blocker owner must be user, environment, upstream, or oracle', 'blocked task owner uses canonical vocabulary');

  writeTask('001-ready.md', blockedTask().replace('node test.mjs → fixture unavailable', 'node test.mjs → passed'));
  assertFailure(run('001-ready.md'), 'Last failing check must record a non-success terminal state', 'blocked task cannot record a passing last check');

  writeTask('001-ready.md', blockedTask().replace('acceptance red', 'anything at all'));
  assertFailure(run('001-ready.md'), 'TDD state must use', 'blocked task TDD state uses canonical terminal vocabulary');

  writeTask('001-ready.md', blockedTask().replace('acceptance red', 'no acceptance boundary'));
  assertSuccess(run('001-ready.md'), 'blocked task accepts the documented no-acceptance-boundary state');

  writeTask('001-ready.md', blockedTask().replace('acceptance red', 'acceptance still failing'));
  assertSuccess(run('001-ready.md'), 'blocked task accepts the documented still-failing state');

  writeTask('001-ready.md', blockedTask().replace('acceptance red', 'acceptance not red'));
  assertFailure(run('001-ready.md'), 'without negating the state', 'blocked task rejects negated TDD state vocabulary');

  writeTask('001-ready.md', blockedTask().replace('skipped because fixture is unavailable', 'passed'));
  assertFailure(run('001-ready.md'), 'Gate must record failed, blocked, skipped, unavailable, or not-run state', 'blocked task cannot record a passing gate');

  writeTask('001-ready.md', blockedTask().replace('skipped because fixture is unavailable', 'not skipped'));
  assertFailure(run('001-ready.md'), 'Gate must record failed, blocked, skipped, unavailable, or not-run state', 'blocked task rejects negated failure vocabulary');

  writeTask('001-ready.md', readyTask());
  writeTask('002-dependent.md', readyTask({ id: 'TASK-002', order: 2, depends: 'TASK-001', title: 'Dependent behavior' }));
  writeBoard('- [ ] TASK-001 — Ready behavior (ready)\n- [ ] TASK-002 — Dependent behavior (ready)', 'TASK-001', 'TASK-002');
  assertFailure(run('002-dependent.md'), 'dependency TASK-001 is not done', 'unsatisfied dependency fails');

  writeTask('001-ready.md', readyTask());
  rmSync(join(tasks, '002-dependent.md'), { force: true });
  writeBoard('- [ ] TASK-0010 — Collision title mentions TASK-001 (ready)', 'TASK-0010', 'complete');
  assertFailure(run('001-ready.md'), 'no exact progress entry for TASK-001', 'progress ID collisions do not match');

  writeTask('001-ready.md', readyTask());
  writeBoard('- [ ] TASK-001 — First copy (ready)\n- [ ] TASK-001 — Duplicate copy (ready)', 'TASK-001', 'complete');
  assertFailure(run('001-ready.md'), 'duplicate progress entry for TASK-001', 'duplicate progress IDs fail');

  writeTask('001-ready.md', readyTask());
  writeBoard('- [ ] TASK-001 — Ready behavior (ready)', 'complete', 'none');
  assertFailure(run('001-ready.md'), 'Current pointer must be TASK-NNN or none', 'label-specific board pointer states are enforced');

  writeTask('001-ready.md', doneTask());
  writeBoard('- [x] TASK-001 — Ready behavior (done)', 'TASK-001', 'complete');
  assertFailure(run('001-ready.md'), 'Current still points to done task TASK-001', 'stale current pointer fails');

  console.log('PASS: portable task validator enforces authority, contract fingerprints, receipts, dependencies, and board consistency');
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function readyTask({ id = 'TASK-001', order = 1, depends = 'none', title = 'Ready behavior', basis = 'user-request: explicit bounded user authorization' } = {}) {
  return `---\nid: ${id}\nstatus: ready\norder: ${order}\ncreated: 2026-07-31\nauthorized_by: Carlos Rodrigo\nauthorized_at: 2026-07-31\nauthorization_basis: "${basis}"\nauthorization_fingerprint: __FINGERPRINT__\n---\n\n# ${id} — ${title}\n\n## Brief\n\n- Goal: User observes the documented result\n- Change: Add one bounded behavior\n- Done: Public output contains the result\n\n## Context\n\n- Source anchors: docs/features/example/design.document.json#acceptance\n- Facts / decisions: Approved design and explicit authorization\n- Depends: ${depends}\n\n## Execute\n\n- Required behavior: Public input produces the documented output\n- In scope: public adapter and focused test\n- Out of scope: adjacent API behavior\n- Invariants: existing errors remain unchanged\n\n## Feedback loop\n\n- State: Public output is observable\n- Contract: Goal, Change, Done, and Execute are satisfied\n- Setup / repro: current contract check fails before implementation\n- Fast: \`node test.mjs\` → focused check passes\n- User/system: run CLI → output contains field\n- Edge: invalid input → existing error remains\n- Gate: \`npm test\` → exits 0\n- Result: record actual action and observation below\n\n## Escalate if\n\n- Approval required: none beyond repository gates\n- Blocked when: public contract must change\n`;
}

function doneTask() {
  return readyTask().replace('status: ready', 'status: done') + `\n## Result\n\n- Status: done\n- Changed: src/example.js, test/example.test.js\n- TDD: acceptance red → unit red/green → acceptance green\n- Task contract: binding instructions checked → satisfied\n- Feedback loop: node test.mjs → passed\n- Gate: npm test → passed\n- Review: self Are You Proud → no findings\n- Follow-up applied to next task: none\n`;
}

function blockedTask() {
  return readyTask().replace('status: ready', 'status: blocked') + `\n## Result\n\n- Status: blocked\n- Changed: none\n- Last failing check: node test.mjs → fixture unavailable\n- Attempts: 1; confirmed missing fixture\n- TDD state: acceptance red\n- Blocker owner: environment\n- Gate: skipped because fixture is unavailable\n- Needed to unblock: provide the fixture\n`;
}

function writeTask(name, content) {
  const taskPath = join(tasks, name);
  const withoutFingerprint = content.replace('authorization_fingerprint: __FINGERPRINT__\n', '');
  writeFileSync(taskPath, withoutFingerprint);
  if (!content.includes('__FINGERPRINT__')) return content;
  const result = spawnSync(process.execPath, [join(installedSkill, 'scripts/validate-task.mjs'), '--fingerprint', taskPath], { cwd: project, encoding: 'utf8' });
  assert(result.status === 0, `fingerprint generation failed:\n${result.stdout}${result.stderr}`);
  const materialized = content.replace('__FINGERPRINT__', result.stdout.trim());
  writeFileSync(taskPath, materialized);
  return materialized;
}

function writeApprovedDesign(status, { staleHtml = false } = {}) {
  const featureDir = join(project, 'docs/features/example');
  rmSync(featureDir, { recursive: true, force: true });
  if (status === 'MalformedApproved') {
    mkdirSync(featureDir, { recursive: true });
    const malformed = { schemaVersion: 'canonical-report-v1', document: { id: 'example-design', kind: 'design', status: 'Approved', title: 'Example', summary: 'Example', updated: '2026-07-31', sources: ['user'], approval: { approvedBy: 'Carlos Rodrigo', approvedAt: '2026-07-31' } }, sections: [] };
    writeFileSync(join(featureDir, 'design.document.json'), JSON.stringify(malformed, null, 2));
    writeFileSync(join(featureDir, 'design.html'), `<script type="application/json" data-document-spec="canonical-report-v1">\n${JSON.stringify(malformed, null, 2)}\n</script>`);
    return;
  }

  cpSync(join(root, 'docs/features/canonical-document-renderer'), featureDir, { recursive: true });
  const sourcePath = join(featureDir, 'design.document.json');
  const reportPath = join(featureDir, 'design.html');
  const spec = JSON.parse(readFileSync(sourcePath, 'utf8'));
  spec.document.status = status;
  if (status === 'Approved') spec.document.approval = { approvedBy: 'Eval Product Owner', approvedAt: '2026-07-31' };
  else delete spec.document.approval;
  writeFileSync(sourcePath, `${JSON.stringify(spec, null, 2)}\n`);
  const rendered = spawnSync(process.execPath, [join(root, 'scripts/render-canonical-report.mjs'), sourcePath, reportPath], { cwd: root, encoding: 'utf8' });
  assert(rendered.status === 0, `synthetic ${status} design should render:\n${rendered.stdout}${rendered.stderr}`);
  if (staleHtml) {
    writeFileSync(reportPath, readFileSync(reportPath, 'utf8').split('Put all document presentation behind one portable renderer').join('Stale title'));
  }
}

function writeBoard(progress, current, next) {
  writeFileSync(join(tasks, '_active.md'), `# Current Feature: Example\n\nStarted: 2026-07-31\n\n## Goal\n- Validate tasks\n\n## Progress\n${progress}\n\n## Current / Next\n- Current: ${current}\n- Next: ${next}\n- Blockers: ${next === 'blocked' ? 'fixture' : 'none'}\n`);
}

function run(taskName) {
  return spawnSync(process.execPath, [join(installedSkill, 'scripts/validate-task.mjs'), join(tasks, taskName), join(tasks, '_active.md')], { cwd: project, encoding: 'utf8' });
}

function runSourceValidator(taskName) {
  return spawnSync(process.execPath, [sourceValidator, join(tasks, taskName), join(tasks, '_active.md')], { cwd: project, encoding: 'utf8' });
}

function assertSuccess(result, label) {
  assert(result.status === 0, `${label}:\n${result.stdout}${result.stderr}`);
}

function assertFailure(result, expected, label) {
  assert(result.status !== 0, `${label}: expected failure`);
  assert(`${result.stdout}${result.stderr}`.includes(expected), `${label}: missing diagnostic ${expected}:\n${result.stdout}${result.stderr}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
