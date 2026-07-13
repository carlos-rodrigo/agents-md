#!/usr/bin/env node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const validator = join(root, 'scripts/validate-html-report.mjs');
const template = readFileSync(join(root, 'skills/html-report-designer/resources/prd-template.html'), 'utf8');
const insertionPoint = '<p class="section-summary">{{DOMAIN_INTERACTIONS_SUMMARY}}</p>';
const temp = mkdtempSync(join(tmpdir(), 'html-report-validator-'));

try {
  assert(template.includes(insertionPoint), 'PRD template domain insertion point is missing');

  const missingUiEvidencePath = join(temp, 'missing-ui-evidence', 'prd.html');
  writeFixture(
    missingUiEvidencePath,
    template.replace('data-review-id="ui-options.existing-ui-evidence"', 'data-review-id="ui-options.unanchored-ui-note"'),
  );
  const missingUiEvidence = runValidator(missingUiEvidencePath);
  assert(missingUiEvidence.status !== 0, 'PRD without existing UI continuity evidence should fail validation');
  assert(
    `${missingUiEvidence.stdout}${missingUiEvidence.stderr}`.includes('existing UI continuity evidence'),
    'missing existing UI evidence failure should explain the required fix',
  );

  const missingMockupGatePath = join(temp, 'missing-mockup-gate', 'prd.html');
  writeFixture(
    missingMockupGatePath,
    template.replace('data-review-id="ui-options.mockup-decision"', 'data-review-id="ui-options.unanchored-mockup-note"'),
  );
  const missingMockupGate = runValidator(missingMockupGatePath);
  assert(missingMockupGate.status !== 0, 'PRD without a mockup decision gate should fail validation');
  assert(
    `${missingMockupGate.stdout}${missingMockupGate.stderr}`.includes('mockup decision gate'),
    'missing mockup gate failure should explain the required fix',
  );

  const danglingUiOptionPath = join(temp, 'dangling-ui-option', 'prd.html');
  writeFixture(
    danglingUiOptionPath,
    template.replace('data-ui-option-ref="ui-options.option-a"', 'data-ui-option-ref="ui-options.missing-option"'),
  );
  const danglingUiOption = runValidator(danglingUiOptionPath);
  assert(danglingUiOption.status !== 0, 'PRD with a dangling UI option selector should fail validation');
  assert(
    `${danglingUiOption.stdout}${danglingUiOption.stderr}`.includes('UI option selector references missing data-review-id'),
    'dangling UI option failure should explain the required fix',
  );

  const invalidPath = join(temp, 'invalid', 'prd.html');
  writeFixture(
    invalidPath,
    template.replace(insertionPoint, `${insertionPoint}<div role="img" aria-label="Domain flow">Fact → balance</div>`),
  );
  const invalid = runValidator(invalidPath);
  assert(invalid.status !== 0, 'non-Excalidraw PRD domain diagram should fail validation');
  assert(
    `${invalid.stdout}${invalid.stderr}`.includes('PRD domain diagrams must use an inline SVG rendered from Excalidraw'),
    'non-Excalidraw failure should explain the required fix',
  );

  const validPath = join(temp, 'valid', 'prd.html');
  const svg = `<svg viewBox="0 0 100 40" role="img" aria-labelledby="test-title test-desc" data-review-id="domain.test.svg"><title id="test-title">Domain flow</title><desc id="test-desc">Fact changes balance.</desc><!-- svg-source:excalidraw --><g class="diagram-reveal" data-review-id="domain.test.node"><text x="10" y="20" font-size="14">Fact → balance</text></g></svg>`;
  writeFixture(validPath, template.replace(insertionPoint, `${insertionPoint}${svg}`));
  const valid = runValidator(validPath);
  assert(valid.status === 0, `Excalidraw PRD domain diagram should pass validation:\n${valid.stdout}${valid.stderr}`);

  console.log('✓ HTML report validator PRD UI and diagram checks');
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function runValidator(path) {
  return spawnSync(process.execPath, [validator, '--allow-placeholders', path], { encoding: 'utf8' });
}

function writeFixture(path, content) {
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, content);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
