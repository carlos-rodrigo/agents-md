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

  const installResult = spawnSync('npm', ['ci', '--prefix', diagramSkill, '--no-audit', '--no-fund'], {
    cwd: project,
    env: { ...process.env },
    encoding: 'utf8',
    timeout: 600_000,
  });
  assertSuccess(installResult, 'copied system-diagram skill installs only from its package and lockfile');
  assert(!`${installResult.stdout}${installResult.stderr}`.includes('EBADENGINE'), 'copied dependency lock must support the active Node runtime without engine warnings');

  const prdSpec = join(reportSkill, 'resources/specs/prd-example.document.json');
  const prdOutput = join(project, 'prd.html');
  assertSuccess(run(join(reportSkill, 'scripts/render-canonical-report.mjs'), [prdSpec, prdOutput]), 'copied report renderer verifies its sibling bundled Excalidraw output');
  assertSuccess(run(join(reportSkill, 'scripts/validate-html-report.mjs'), [prdOutput]), 'copied PRD report validates from unrelated cwd');

  const diagramSpec = join(project, 'diagram.json');
  const diagramOutput = join(project, 'diagram.svg');
  cpSync(join(diagramSkill, 'resources/excalidraw-domain-interaction-example.json'), diagramSpec);
  assertSuccess(run(join(diagramSkill, 'scripts/render-excalidraw-diagram.mjs'), [diagramSpec, diagramOutput]), 'copied system-diagram skill renders after its declared dependencies are installed');
  assertSuccess(run(join(diagramSkill, 'scripts/render-excalidraw-diagram.mjs'), ['--check', diagramSpec, diagramOutput]), 'copied Excalidraw output is deterministic');
  assert(readFileSync(diagramOutput, 'utf8').includes('svg-source:excalidraw'), 'copied diagram renderer must preserve Excalidraw provenance');

  for (const path of [
    join(reportSkill, 'SKILL.md'),
    join(reportSkill, 'scripts/render-canonical-report.mjs'),
    join(reportSkill, 'scripts/canonical-report.mjs'),
    join(reportSkill, 'scripts/validate-html-report.mjs'),
    join(diagramSkill, 'SKILL.md'),
    join(diagramSkill, 'scripts/render-excalidraw-diagram.mjs'),
  ]) {
    const source = readFileSync(path, 'utf8');
    assert(!source.includes('/Users/carlosrodrigo/agents'), `${path} must not contain the author checkout path`);
    assert(!source.includes('import.meta.dirname'), `${path} must remain compatible with Node 18`);
  }

  console.log(`PASS: copied report and Excalidraw skills run from an unrelated working directory under ${process.version}`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function run(command, args) {
  return spawnSync(process.execPath, [command, ...args], { cwd: project, env: { ...process.env }, encoding: 'utf8' });
}
function assertSuccess(result, label) { assert(result.status === 0, `${label}:\n${result.stdout}${result.stderr}`); }
function assert(condition, message) { if (!condition) throw new Error(message); }
