#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const validator = join(root, 'scripts/validate-html-report.mjs');
const renderer = join(root, 'scripts/render-canonical-report.mjs');
const resources = join(root, 'skills/html-report-designer/resources');
const template = join(resources, 'report-template.html');
const temp = mkdtempSync(join(tmpdir(), 'canonical-report-validator-'));

try {
  assertSuccess(run(validator, ['--allow-placeholders', template]), 'sole template validates with placeholders');

  const reportPath = join(temp, 'report.html');
  assertSuccess(run(renderer, [join(resources, 'report-example.document.json'), reportPath]), 'render base report');
  const base = readFileSync(reportPath, 'utf8');
  assertSuccess(run(validator, [reportPath]), 'canonical report validates');

  assertFailure('missing-doctype.html', base.replace(/<!doctype html>/i, ''), 'missing <!doctype html>');
  assertFailure('second-h1.html', base.replace('</h1>', '</h1><h1>Duplicate</h1>'), 'expected exactly one <h1>');
  assertFailure('missing-main.html', base.replace('id="main"', 'id="content"'), '<main id="main">');
  assertFailure('remote-asset.html', base.replace('</head>', '<link rel="stylesheet" href="https://example.com/report.css"></head>'), 'remote asset');
  assertFailure('remote-css-url.html', base.replace('/* tailwind-report-css:end */', 'body{background:url(https://example.com/image.png)}\n/* tailwind-report-css:end */'), 'remote asset');
  assertFailure('duplicate-review-id.html', base.replace('</header>', '</header><p data-review-id="summary">Duplicate</p>'), 'duplicate data-review-id');
  assertFailure('invalid-review-id.html', base.replace('data-review-id="summary"', 'data-review-id="Document Outcome"'), 'lowercase kebab/dot notation');
  assertFailure('missing-canonical.html', base.replace('name="canonical-report"', 'name="legacy-report"'), 'missing canonical-report-v1 metadata');
  assertFailure('stale-digest.html', base.replace(/name="canonical-template-digest" content="[^"]+"/, 'name="canonical-template-digest" content="stale"'), 'canonical template digest is stale');
  assertFailure('missing-spec.html', base.replace(/<script type="application\/json"[\s\S]*?<\/script>/, ''), 'missing embedded canonical-report-v1 DocumentSpec');
  assertFailure('missing-print.html', base.replace(/@media print/g, '@media screen'), 'missing print stylesheet');
  assertFailure('unmanaged-script.html', base.replace('</article>', '<script>alert(1)</script></article>'), 'unmanaged inline script');
  assertFailure('inline-handler.html', base.replace('<h1>', '<h1 onclick="alert(1)">'), 'inline event handler');
  assertFailure('unsafe-href.html', base.replace('href="#main"', 'href="java\tscript:alert(1)"'), 'unsafe href URL scheme');

  const adjacentSpecPath = join(temp, 'adjacent.document.json');
  const adjacentHtmlPath = join(temp, 'adjacent.html');
  writeFileSync(adjacentSpecPath, readFileSync(join(resources, 'report-example.document.json'), 'utf8'));
  assertSuccess(run(renderer, [adjacentSpecPath, adjacentHtmlPath]), 'render adjacent canonical source');
  writeFileSync(adjacentHtmlPath, readFileSync(adjacentHtmlPath, 'utf8').replace('The renderer owns presentation', 'Patched generated HTML'));
  const patchedResult = run(validator, [adjacentHtmlPath]);
  assert(patchedResult.status !== 0 && `${patchedResult.stdout}${patchedResult.stderr}`.includes('does not byte-match its adjacent DocumentSpec'), 'validator must reject patched durable HTML when adjacent source exists');

  const prdPath = join(temp, 'prd.html');
  assertSuccess(run(renderer, [join(resources, 'specs/prd-example.document.json'), prdPath]), 'render PRD fixture');
  const prd = readFileSync(prdPath, 'utf8');
  assertSuccess(run(validator, [prdPath]), 'PRD fixture validates');
  assertFailure('prd-without-system-diagram.html', prd.replace('svg-source:system-diagram', 'svg-source:hand-authored'), 'require System Diagram SVG provenance');
  assertFailure('prd-without-diagram-style.html', prd.replace('data-diagram-style="infrastructure-v1"', 'data-diagram-style="custom"'), 'require the infrastructure-v1 diagram style');
  assertFailure('prd-without-diagram-digest.html', prd.replace(/ data-diagram-output-sha256="[a-f0-9]{64}"/, ''), 'needs an output digest');
  assertFailure('prd-with-tampered-diagram.html', prd.replace('>Evidence</text>', '>Tampered evidence</text>'), 'output digest does not match its embedded SVG');
  assertFailure('prd-without-decision-recorder.html', prd.replace('class="decision-recorder"', 'class="decision-card"'), 'every DocumentSpec decision must render exactly one decision recorder');
  assertFailure('prd-without-decision-fingerprint.html', prd.replace(/ data-decision-source-fingerprint="[a-f0-9]{64}"/, ''), 'decision-source fingerprint');

  const notTemplate = join(temp, 'placeholder.html');
  writeFileSync(notTemplate, readFileSync(template, 'utf8'));
  const result = run(validator, ['--allow-placeholders', notTemplate]);
  assert(result.status !== 0 && `${result.stdout}${result.stderr}`.includes('only valid for report-template.html'), 'placeholder mode must be limited to the canonical template');

  console.log('PASS: validator enforces canonical shell/profile parity, managed scripts, adjacent-source freshness, decisions, and System Diagram provenance');
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function assertFailure(name, html, expected) {
  const path = join(temp, name);
  writeFileSync(path, html);
  const result = run(validator, [path]);
  const output = `${result.stdout}${result.stderr}`;
  assert(result.status !== 0, `${name} should fail`);
  assert(output.includes(expected), `${name} should explain "${expected}":\n${output}`);
}
function run(command, args) { return spawnSync(process.execPath, [command, ...args], { cwd: root, encoding: 'utf8' }); }
function assertSuccess(result, label) { assert(result.status === 0, `${label}:\n${result.stdout}${result.stderr}`); }
function assert(condition, message) { if (!condition) throw new Error(message); }
