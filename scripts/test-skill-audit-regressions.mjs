#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = (name) => readFileSync(join(root, 'skills', name, 'SKILL.md'), 'utf8');
for (const name of readdirSync(join(root, 'skills'))) {
  const file = join(root, 'skills', name, 'SKILL.md');
  if (!existsSync(file)) continue;
  for (const [, link] of readFileSync(file, 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(?:https?:|mailto:|#)/.test(link)) continue;
    assert(existsSync(resolve(dirname(file), link.split('#')[0])), `${name}: missing linked resource ${link}`);
  }
}
assert(!skill('system-diagram').includes('Author strict `system-diagram-v1` JSON.'), 'authoring must dispatch by version');
assert(skill('html-report-designer').includes('system-diagram-v2'), 'report contract must permit sequence sources');
assert(skill('design-solution').includes('For product-backed work, verify'), 'process must distinguish evidence modes');
assert(skill('design-solution').includes('For technical-evidence-backed work, verify'), 'technical mode must have its own evidence gate');
assert(!skill('code-un-slopify').includes('both reviews'), 'cleanup must not unconditionally restart both reviews');
assert(skill('code-un-slopify').includes('at most two'), 'cleanup review must be bounded');
assert(skill('code-un-slopify').includes('Optional taste suggestions do not block'), 'taste must not block cleanup');

const temp = mkdtempSync(join(tmpdir(), 'prd-audit-portability-'));
try {
  const installed = join(temp, 'skills');
  for (const name of ['prd', 'html-report-designer', 'system-diagram']) cpSync(join(root, 'skills', name), join(installed, name), { recursive: true });
  const cli = join(installed, 'prd/scripts/audit-prd-traceability.mjs');
  assert(existsSync(cli), 'PRD must ship its required audit CLI');
  const spec = JSON.parse(readFileSync(join(root, 'skills/html-report-designer/resources/specs/prd-example.document.json'), 'utf8'));
  const source = join(temp, 'prd.document.json');
  const sidecar = join(temp, 'prd.review.md');
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { cwd: temp, encoding: 'utf8' });
  const save = (value) => writeFileSync(source, JSON.stringify(value));
  const passes = (result) => assert.equal(result.status, 0, result.stdout + result.stderr);
  const fails = (result, message) => { assert.notEqual(result.status, 0); assert.match(result.stderr, message); };
  save(spec);
  passes(run(source));
  fails(run(), /usage/i);
  fails(run(join(temp, 'missing.json')), /ENOENT/);
  writeFileSync(source, '{');
  fails(run(source), /JSON/);
  const broken = structuredClone(spec);
  broken.sections.find((section) => section.role === 'requirements').blocks[0].bddRefs = ['missing-scenario'];
  save(broken);
  fails(run(source), /missing-scenario/);
  const missingAcceptance = structuredClone(spec);
  missingAcceptance.sections.find((section) => section.role === 'requirements').blocks[0].proof = 'Observable ac-missing proves this behavior.';
  save(missingAcceptance);
  fails(run(source), /acceptance/);
  save(spec);
  const sourceBytes = readFileSync(source, 'utf8');
  const decision = spec.sections.flatMap((section) => section.blocks).find((block) => block.type === 'decision');
  const fingerprint = createHash('sha256').update(JSON.stringify(decision)).digest('hex');
  const option = decision.options[0];
  const standalone = `## Decision\n\n- Review ID: \`${decision.id}\`\n- Source fingerprint: \`${fingerprint}\`\n- Status: Recorded review input\n- Decision: ${option.label}\n- Rationale: Existing scope\n- Owner: Product owner\n`;
  const pi = `## Comment 1\n\n- Anchor: \`${decision.id}\`\n- Feedback type: Decision\n\nDecision confirmed: ${option.label} | Option ID: ${option.id} | Rationale: Existing scope | Owner: Product owner | Completion: complete | Source fingerprint: ${fingerprint} | Canonical approval: unchanged.\n`;
  const piEscaped = pi.replace(/\|/g, '\\|');
  for (const record of [standalone, pi, piEscaped]) {
    writeFileSync(sidecar, record);
    passes(run(source, sidecar));
    writeFileSync(sidecar, record.replace(fingerprint, '0'.repeat(64)));
    fails(run(source, sidecar), /stale.*fingerprint/i);
    writeFileSync(sidecar, record.replace(decision.id, 'missing-decision'));
    fails(run(source, sidecar), /unknown.*anchor/i);
  }
  writeFileSync(sidecar, pi.replace(`Option ID: ${option.id}`, 'Option ID: missing-option'));
  fails(run(source, sidecar), /unknown.*option/i);
  writeFileSync(sidecar, standalone.replace(option.label, 'An invented option'));
  fails(run(source, sidecar), /selection.*manual/i);
  writeFileSync(sidecar, `## Comment\n- Anchor: \`prd.problem.current\`\nTighten this copy.\n`);
  passes(run(source, sidecar));
  writeFileSync(sidecar, 'Decision confirmed: unknown format');
  fails(run(source, sidecar), /unsupported|missing/i);
  assert.equal(readFileSync(source, 'utf8'), sourceBytes, 'audit must never reconcile or approve source');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log('PASS: skill resources, evidence modes, bounded reviews, and portable PRD audit regressions');
