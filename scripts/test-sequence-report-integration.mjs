#!/usr/bin/env node
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const renderer = resolve(root, 'skills/html-report-designer/scripts/render-canonical-report.mjs');
const source = resolve(root, 'skills/html-report-designer/resources/specs/prd-example.document.json');
const tempSpec = resolve(root, 'skills/html-report-designer/resources/specs/.sequence-report-test.document.json');
const output = resolve(tmpdir(), `sequence-report-${process.pid}.html`);
const document = JSON.parse(readFileSync(source, 'utf8'));
const diagram = document.sections.find((section) => section.role === 'diagram').blocks[0];
diagram.svgPath = '../../../system-diagram/resources/sequence-minimal-v2.svg';
diagram.sourcePath = '../../../system-diagram/resources/sequence-minimal-v2.json';
document.document = { ...document.document, id: 'sequence-report-test', title: 'Sequence report test', summary: 'Sequence report integration test.' };
writeFileSync(tempSpec, `${JSON.stringify(document, null, 2)}\n`);
try {
  const rendered = spawnSync(process.execPath, [renderer, tempSpec, output], { cwd: root, encoding: 'utf8' });
  assert(rendered.status === 0, `sequence report render failed:\n${rendered.stdout}\n${rendered.stderr}`);
  const html = readFileSync(output, 'utf8');
  assert(html.includes('data-diagram-schema="system-diagram-v2"'), 'report must embed sequence-v2 SVG');
  assert(html.includes('data-diagram-type="sequence"'), 'report must preserve sequence marker');
  assert(html.includes('Sequence report test'), 'report should render the test document');
  const tampered = readFileSync(resolve(root, 'skills/system-diagram/resources/sequence-minimal-v2.svg'), 'utf8').replace('data-diagram-type="sequence"', 'data-diagram-type="wrong"');
  const svgPath = resolve(root, 'skills/system-diagram/resources/sequence-minimal-v2.svg');
  writeFileSync(svgPath, tampered);
  try {
    const rejected = spawnSync(process.execPath, [renderer, tempSpec, output], { cwd: root, encoding: 'utf8' });
    assert(rejected.status !== 0 && `${rejected.stdout}${rejected.stderr}`.includes('markers do not match'), 'marker tampering must block report rendering');
  } finally {
    const regenerate = spawnSync(process.execPath, [resolve(root, 'skills/system-diagram/scripts/render-sequence-diagram.mjs'), resolve(root, 'skills/system-diagram/resources/sequence-minimal-v2.json'), svgPath], { cwd: root, encoding: 'utf8' });
    assert(regenerate.status === 0, `failed to restore sequence fixture: ${regenerate.stderr}`);
  }
  console.log('✓ canonical report accepts exact sequence-v2 output and rejects marker tampering');
} finally { rmSync(tempSpec, { force: true }); rmSync(output, { force: true }); }
function assert(value, message) { if (!value) throw new Error(message); }
