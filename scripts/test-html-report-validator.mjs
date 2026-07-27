#!/usr/bin/env node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const validator = join(root, 'scripts/validate-html-report.mjs');
const resources = join(root, 'skills/html-report-designer/resources');
const templates = [
  ['generic shell', join(resources, 'report-template.html'), '{{COMPOSED_REPORT_CONTENT}}'],
  ['PRD shell', join(resources, 'prd-template.html'), '{{COMPOSED_PRD_CONTENT}}'],
  ['design shell', join(resources, 'design-template.html'), '{{COMPOSED_DESIGN_CONTENT}}'],
];
const temp = mkdtempSync(join(tmpdir(), 'html-report-validator-'));

try {
  for (const [label, path] of templates) {
    assertSuccess(runValidator(path, { allowPlaceholders: true }), `${label} with placeholders`);
    const finished = finishTemplate(readFileSync(path, 'utf8'));
    const finishedPath = fixture(`${slug(label)}-finished.html`, finished);
    assertSuccess(runValidator(finishedPath), `${label} after placeholder replacement and rich-wrapper cleanup`);
  }

  const baseTemplate = readFileSync(join(resources, 'report-template.html'), 'utf8');
  const base = replacePlaceholders(baseTemplate);

  assertFailureIncludes(
    runValidator(fixture('missing-doctype.html', base.replace(/<!doctype html>/i, ''))),
    'missing <!doctype html>',
    'report without doctype',
  );
  assertFailureIncludes(
    runValidator(fixture('second-h1.html', base.replace('</h1>', '</h1><h1>Duplicate</h1>'))),
    'expected exactly one <h1>',
    'report with two h1 elements',
  );
  assertFailureIncludes(
    runValidator(fixture('missing-main.html', base.replace('id="main"', 'id="content"'))),
    '<main id="main">',
    'report without main target',
  );
  assertFailureIncludes(
    runValidator(fixture('remote-asset.html', base.replace('</head>', '<link rel="stylesheet" href="https://example.com/report.css" /></head>'))),
    'remote asset',
    'report with a remote stylesheet',
  );
  assertFailureIncludes(
    runValidator(fixture('local-image.html', base.replace('</header>', '</header><img src="diagram.png" alt="Diagram" />'))),
    'not embedded as a data URI',
    'report with a non-embedded image',
  );
  assertFailureIncludes(
    runValidator(fixture('duplicate-review-id.html', base.replace('</header>', '</header><p data-review-id="summary">Duplicate anchor</p>'))),
    'duplicate data-review-id',
    'report with duplicate review anchors',
  );
  assertFailureIncludes(
    runValidator(fixture('invalid-review-id.html', base.replace('data-review-id="summary"', 'data-review-id="Document Outcome"'))),
    'lowercase kebab/dot notation',
    'report with an unstable review id',
  );
  assertFailureIncludes(
    runValidator(fixture('rich-role-img.html', insertContent(baseTemplate, '<div role="img"><h2 id="state">State</h2><button>Save</button></div>'))),
    'rich HTML must not use role="img"',
    'rich HTML hidden behind role img',
  );
  assertFailureIncludes(
    runValidator(fixture('empty-details.html', insertContent(baseTemplate, '<details><summary> </summary><p>Evidence</p></details>'))),
    'meaningful non-empty <summary>',
    'disclosure with empty summary',
  );
  assertFailureIncludes(
    runValidator(fixture('table-without-contract.html', insertContent(baseTemplate, '<table><tr><th>Name</th></tr><tr><td>A</td></tr></table>'))),
    'non-empty <caption>',
    'table without caption and scoped headers',
  );
  assertFailureIncludes(
    runValidator(fixture('inaccessible-svg.html', insertContent(baseTemplate, '<figure><svg role="img"><path d="M0 0H10" /></svg><figcaption>Path</figcaption></figure>'))),
    'non-empty <title>',
    'informational SVG without accessible naming',
  );

  const complexWithoutWalkthrough = '<figure data-complex-figure data-review-id="figure.path"><p class="figure-question">How to read: left to right.</p><svg viewBox="0 0 10 10" role="img" aria-labelledby="path-title path-desc"><title id="path-title">Path</title><desc id="path-desc">One path.</desc></svg><figcaption>One path.</figcaption></figure>';
  assertFailureIncludes(
    runValidator(fixture('complex-without-walkthrough.html', insertContent(baseTemplate, complexWithoutWalkthrough))),
    'adjacent structured walkthrough',
    'complex figure without a text equivalent',
  );

  const validComplex = `${complexWithoutWalkthrough}<ol data-figure-walkthrough-for="figure.path"><li>Read the path.</li></ol>`;
  assertSuccess(
    runValidator(fixture('valid-complex.html', insertContent(baseTemplate, validComplex))),
    'optional accessible complex figure',
  );

  const goodTable = '<table><caption>Decision evidence</caption><thead><tr><th scope="col">Source</th></tr></thead><tbody><tr><td>Request</td></tr></tbody></table>';
  assertSuccess(runValidator(fixture('valid-table.html', insertContent(baseTemplate, goodTable))), 'optional accessible table');

  const noPrint = base.replace(/@media\s+print/gi, '@media screen');
  assertFailureIncludes(runValidator(fixture('missing-print.html', noPrint)), 'missing print stylesheet', 'report without print CSS');

  console.log('PASS: HTML validator enforces the shared document system without prescribing content');
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function replacePlaceholders(content) {
  return content.replace(/\{\{[^}]+\}\}/g, 'Fixture');
}

function finishTemplate(content) {
  return replacePlaceholders(content)
    .replace(/(<(?:article|div|figure|section|main|aside)\b[^>]*?)\srole=["']img["']/gi, '$1');
}

function insertContent(template, content) {
  const slot = ['{{COMPOSED_REPORT_CONTENT}}', '{{COMPOSED_PRD_CONTENT}}', '{{COMPOSED_DESIGN_CONTENT}}']
    .find((candidate) => template.includes(candidate));
  const inserted = slot
    ? template.replace(slot, content)
    : template.replace('</article>', `${content}</article>`);
  assert(inserted !== template, 'template needs a composition slot or article insertion point');
  return replacePlaceholders(inserted);
}

function fixture(name, content) {
  const path = join(temp, name);
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, content);
  return path;
}

function runValidator(path, { allowPlaceholders = false } = {}) {
  const args = [validator];
  if (allowPlaceholders) args.push('--allow-placeholders');
  args.push(path);
  return spawnSync(process.execPath, args, { encoding: 'utf8' });
}

function assertFailureIncludes(result, expected, label) {
  assert(result.status !== 0, `${label} should fail validation`);
  const output = `${result.stdout}${result.stderr}`;
  assert(output.includes(expected), `${label} should explain "${expected}":\n${output}`);
}

function assertSuccess(result, label) {
  assert(result.status === 0, `${label} should pass validation:\n${result.stdout}${result.stderr}`);
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
