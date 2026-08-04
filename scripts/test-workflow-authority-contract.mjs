#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const prd = read('skills/prd/SKILL.md');
const design = read('skills/design-solution/SKILL.md');
const simpleTasks = read('skills/simple-tasks/SKILL.md');
const implementTask = read('skills/implement-task/SKILL.md');
const architectureAdr = read('docs/adrs/architecture.md');
const prdSpec = JSON.parse(read('docs/features/canonical-document-renderer/prd.document.json'));
const designSpec = JSON.parse(read('docs/features/canonical-document-renderer/design.document.json'));

requireAll('PRD source authority', prd, [
  '`prd.document.json` is the editable product authority',
  '`prd.html` is its deterministic review and approval projection',
]);
requireAll('design upstream authority', design, [
  '`prd.document.json` owns approved product behavior',
  '`prd.html` is its current validated review projection',
  'render-canonical-report.mjs" --check',
  '## Handoff',
  '`simple-tasks`',
  'acceptance anchors',
]);
requireAll('task authorization policy', simpleTasks, [
  'New tasks default to `draft`',
  '`authorized_by`',
  '`authorized_at`',
  '`authorization_basis`',
  '`authorization_fingerprint`',
  'explicit user authorization',
  'Approved design',
  'binding task contract is unchanged',
  'Work still waiting on upstream authority remains `draft`',
]);
requireAll('implementation authorization gate', implementTask, [
  '`authorized_by`',
  '`authorized_at`',
  '`authorization_basis`',
  '`authorization_fingerprint`',
  'upstream authority',
  'Do not infer or create authorization',
]);
requireAll('durable task authorization decision', architectureAdr, [
  '## Task readiness authorization',
  'New tasks default to `draft`',
  'explicit user authorization',
  '`authorization_fingerprint`',
  'binding task contract',
]);

const designSources = designSpec.document?.sources ?? [];
assert(designSources.includes('docs/features/canonical-document-renderer/prd.document.json'), 'canonical design must cite editable PRD authority');
assert(designSources.includes('docs/features/canonical-document-renderer/prd.html'), 'canonical design must cite the PRD review projection');
assert(prdSpec.document?.status === 'Approved' || designSpec.document?.status === 'Blocked', 'a design sourced from a non-Approved PRD must remain Blocked');
const prdFreshness = spawnSync(process.execPath, [
  join(root, 'scripts/render-canonical-report.mjs'), '--check',
  join(root, 'docs/features/canonical-document-renderer/prd.document.json'),
  join(root, 'docs/features/canonical-document-renderer/prd.html'),
], { cwd: root, encoding: 'utf8' });
assert(prdFreshness.status === 0, `canonical PRD review projection must be current:\n${prdFreshness.stdout}${prdFreshness.stderr}`);

console.log('PASS: workflow authority is explicit from canonical source through authorized implementation');

function requireAll(label, content, markers) {
  const missing = markers.filter((marker) => !content.includes(marker));
  assert(missing.length === 0, `${label} missing: ${missing.join(', ')}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
