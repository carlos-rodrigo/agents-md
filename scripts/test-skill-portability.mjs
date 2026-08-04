#!/usr/bin/env node
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'report-skills-portability-'));
const installed = join(temp, 'installed-skills');
const project = join(temp, 'unrelated-project');

try {
  const reportSkill = join(installed, 'html-report-designer');
  const diagramSkill = join(installed, 'system-diagram');
  cpSync(join(root, 'skills/html-report-designer'), reportSkill, { recursive: true });
  cpSync(join(root, 'skills/system-diagram'), diagramSkill, { recursive: true });
  mkdirSync(project, { recursive: true });

  const reportSpec = join(reportSkill, 'resources/report-example.document.json');
  const reportOutput = join(project, 'report.html');
  assertSuccess(run(join(reportSkill, 'scripts/render-canonical-report.mjs'), [reportSpec, reportOutput]), 'copied report skill renders from unrelated cwd');
  assertSuccess(run(join(reportSkill, 'scripts/validate-html-report.mjs'), [reportOutput]), 'copied report skill validates its output');
  assertSuccess(run(join(reportSkill, 'scripts/render-canonical-report.mjs'), ['--check', reportSpec, reportOutput]), 'copied report output is deterministic');

  const prdSpec = join(reportSkill, 'resources/specs/prd-example.document.json');
  const prdOutput = join(project, 'prd.html');
  assertSuccess(run(join(reportSkill, 'scripts/render-canonical-report.mjs'), [prdSpec, prdOutput]), 'copied report renderer verifies its sibling bundled System Diagram output');
  assertSuccess(run(join(reportSkill, 'scripts/validate-html-report.mjs'), [prdOutput]), 'copied PRD report validates from unrelated cwd');

  const diagramSpec = join(project, 'diagram.json');
  const diagramOutput = join(project, 'diagram.svg');
  cpSync(join(diagramSkill, 'resources/system-domain-interaction-example.json'), diagramSpec);
  assertSuccess(run(join(diagramSkill, 'scripts/render-system-diagram.mjs'), [diagramSpec, diagramOutput]), 'copied dependency-free System Diagram skill renders from an unrelated cwd');
  assertSuccess(run(join(diagramSkill, 'scripts/render-system-diagram.mjs'), ['--check', diagramSpec, diagramOutput]), 'copied System Diagram output is deterministic');
  const diagram = readFileSync(diagramOutput, 'utf8');
  assert(diagram.includes('svg-source:system-diagram'), 'copied diagram renderer must preserve System Diagram provenance');
  assert(diagram.includes('data-diagram-style="infrastructure-v1"'), 'copied diagram renderer must preserve the infrastructure visual system');

  const sequenceSpec = join(project, 'sequence.json');
  const sequenceOutput = join(project, 'sequence.svg');
  cpSync(join(diagramSkill, 'resources/sequence-minimal-v2.json'), sequenceSpec);
  assertSuccess(run(join(diagramSkill, 'scripts/render-sequence-diagram.mjs'), [sequenceSpec, sequenceOutput]), 'copied sequence renderer renders from an unrelated cwd');
  assertSuccess(run(join(diagramSkill, 'scripts/render-sequence-diagram.mjs'), ['--check', sequenceSpec, sequenceOutput]), 'copied sequence output is deterministic');
  const sequence = readFileSync(sequenceOutput, 'utf8');
  assert(sequence.includes('data-diagram-schema="system-diagram-v2"'), 'copied sequence renderer must preserve the v2 schema marker');
  assert(sequence.includes('data-diagram-style="infrastructure-v1"'), 'copied sequence renderer must preserve infrastructure-v1 style');

  for (const path of [
    join(reportSkill, 'SKILL.md'),
    join(reportSkill, 'scripts/render-canonical-report.mjs'),
    join(reportSkill, 'scripts/canonical-report.mjs'),
    join(reportSkill, 'scripts/validate-html-report.mjs'),
    join(diagramSkill, 'SKILL.md'),
    join(diagramSkill, 'scripts/render-system-diagram.mjs'),
    join(diagramSkill, 'scripts/render-sequence-diagram.mjs'),
    join(diagramSkill, 'scripts/spec-sequence-v2.mjs'),
    join(diagramSkill, 'scripts/layout-sequence-v1.mjs'),
  ]) {
    const source = readFileSync(path, 'utf8');
    assert(!source.includes('/Users/carlosrodrigo/agents'), `${path} must not contain the author checkout path`);
    assert(!source.includes('import.meta.dirname'), `${path} must remain compatible with Node 18`);
  }

  console.log(`PASS: copied report and dependency-free System Diagram skills run from an unrelated working directory under ${process.version}`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function run(command, args) {
  return spawnSync(process.execPath, [command, ...args], { cwd: project, env: { ...process.env }, encoding: 'utf8' });
}
function assertSuccess(result, label) { assert(result.status === 0, `${label}:\n${result.stdout}${result.stderr}`); }
function assert(condition, message) { if (!condition) throw new Error(message); }
