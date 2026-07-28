#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { renderCanonicalReport } from './canonical-report.mjs';

const root = resolve(import.meta.dirname, '..');
const sourcePath = resolve(root, 'skills/html-report-designer/resources/report-example.document.json');
const documentSpec = JSON.parse(readFileSync(sourcePath, 'utf8'));
documentSpec.document = { ...documentSpec.document, id: 'decision-test', title: 'Decision Test', summary: 'Generated decision recorder behavior test.' };
documentSpec.sections = [{
  id: 'decision-test.decisions',
  role: 'decisions',
  title: 'Decision recorders',
  blocks: [
    {
      type: 'decision', id: 'decision.safety', question: 'Safety policy', status: 'open',
      options: [{ id: 'private', label: 'Private' }, { id: 'age-banded', label: 'Age-banded' }],
      owner: 'Product owner', blocking: true,
    },
    {
      type: 'decision', id: 'decision.renderer', question: 'Rendering boundary', status: 'accepted',
      options: [{ id: 'canonical', label: 'Canonical renderer' }, { id: 'specialized', label: 'Specialized templates' }],
      selectedOptionId: 'canonical', rationale: 'One boundary prevents drift.', owner: 'Carlos Rodrigo', blocking: true,
      approvedBy: 'Carlos Rodrigo', approvedAt: '2026-07-28',
    },
  ],
}];
const html = renderCanonicalReport(documentSpec, { specPath: sourcePath });
let servedHtml = html;

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await serve(page);
  await page.goto('http://review.test/report');

  const openRecorder = page.locator('[data-review-id="decision.safety"]');
  const recorded = openRecorder.locator('[data-decision-recorded]');
  assert(await recorded.isDisabled(), 'recording must be disabled before the decision is complete');
  await openRecorder.locator('input[value="age-banded"]').check();
  await openRecorder.locator('[data-decision-rationale]').fill('Protect the youngest users');
  await openRecorder.locator('[data-decision-owner]').fill('Product owner');
  assert(!(await recorded.isDisabled()), 'selection, rationale, and owner should enable recording');
  await recorded.check();
  await expectText(openRecorder.locator('.decision-status'), 'Recorded in this browser');

  await openRecorder.locator('[data-decision-rationale]').fill('Changed after recording');
  assert(!(await recorded.isChecked()), 'editing recorded content must clear the recorded checkbox');
  assert(await openRecorder.getAttribute('data-local-recorded-at') === null, 'editing recorded content must clear its browser recording date');

  await openRecorder.locator('[data-decision-custom]').fill('Regional policy');
  assert(await openRecorder.locator('input[value="other"]').isChecked(), 'typing a custom answer should select Other');
  await openRecorder.locator('[data-decision-rationale]').fill('Required by the regional policy owner');
  await recorded.check();

  const acceptedRecorder = page.locator('[data-review-id="decision.renderer"]');
  assert(await acceptedRecorder.locator('input[type="radio"]').first().isDisabled(), 'accepted choice must be locked');
  assert(await acceptedRecorder.locator('[data-decision-rationale]').isDisabled(), 'accepted rationale must be locked');
  assert(await acceptedRecorder.locator('[data-decision-recorded]').isDisabled(), 'accepted record checkbox must be locked');
  await expectText(acceptedRecorder.locator('.decision-status'), 'Accepted by Carlos Rodrigo on 2026-07-28');

  await page.reload();
  const restoredOpen = page.locator('[data-review-id="decision.safety"]');
  assert(await restoredOpen.locator('input[value="other"]').isChecked(), 'custom option should restore after reload');
  assert((await restoredOpen.locator('[data-decision-custom]').inputValue()) === 'Regional policy', 'custom answer should restore');
  assert((await restoredOpen.locator('[data-decision-rationale]').inputValue()) === 'Required by the regional policy owner', 'rationale should restore');
  assert(await restoredOpen.locator('[data-decision-recorded]').isChecked(), 'recorded checkbox should restore');

  const download = page.waitForEvent('download');
  await page.locator('[data-review-download]').click();
  const downloaded = await download;
  assert(downloaded.suggestedFilename() === 'decision-test.decision-review.md', 'download should use a stable Markdown filename');
  const text = readFileSync(await downloaded.path(), 'utf8');
  for (const marker of [
    'Review ID: `decision.safety`',
    'Source fingerprint: `',
    'Status: Recorded review input',
    'Decision: Regional policy',
    'Rationale: Required by the regional policy owner',
    'Owner: Product owner',
    'Approved by: Not approved',
    'Browser recorded:',
    'Review ID: `decision.renderer`',
    'Status: Accepted',
    'Decision: Canonical renderer',
    'Approved by: Carlos Rodrigo',
    'Approved on: 2026-07-28',
    'Review input only',
  ]) assert(text.includes(marker), `export should include ${marker}`);
  assert((text.match(/^## /gm) || []).length === 2, 'multi-decision export must include every decision recorder');

  const revisedSpec = structuredClone(documentSpec);
  revisedSpec.sections[0].blocks[0].options[0].label = 'Confidential';
  servedHtml = renderCanonicalReport(revisedSpec, { specPath: sourcePath });
  await page.reload();
  assert(!(await page.locator('[data-review-id="decision.safety"] [data-decision-recorded]').isChecked()), 'changing an unselected option must invalidate browser-recorded state through the renderer fingerprint');
  assert(await page.locator('[data-review-id="decision.safety"]').getAttribute('data-local-recorded-at') === null, 'decision fingerprint changes must clear the old local recording date');

  await page.evaluate(() => localStorage.setItem('artifact-review:/report:decision.safety', '{not-json'));
  await page.reload();
  assert(!(await page.locator('[data-review-id="decision.safety"] [data-decision-recorded]').isChecked()), 'corrupt browser state should be discarded safely');
  assert(errors.length === 0, `decision runtime should not emit page errors: ${errors.join('; ')}`);
  await context.close();

  const unavailableContext = await browser.newContext();
  await unavailableContext.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('storage denied'); } }));
  const unavailablePage = await unavailableContext.newPage();
  const unavailableErrors = [];
  unavailablePage.on('pageerror', (error) => unavailableErrors.push(error.message));
  await serve(unavailablePage);
  await unavailablePage.goto('http://review.test/report');
  const unavailableRecorder = unavailablePage.locator('[data-review-id="decision.safety"]');
  await unavailableRecorder.locator('input[value="private"]').check();
  await unavailableRecorder.locator('[data-decision-rationale]').fill('Storage fallback');
  await unavailableRecorder.locator('[data-decision-owner]').fill('Reviewer');
  await unavailableRecorder.locator('[data-decision-recorded]').check();
  await expectText(unavailableRecorder.locator('.decision-status'), 'Browser storage is unavailable');
  assert(unavailableErrors.length === 0, `storage fallback should not emit page errors: ${unavailableErrors.join('; ')}`);
  await unavailableContext.close();

  console.log('PASS: decision input invalidates on edit/meaning change, persists safely, locks accepted authority, and exports every record');
} finally {
  await browser.close();
}

async function serve(page) {
  await page.route('http://review.test/report', (route) => route.fulfill({ contentType: 'text/html', body: servedHtml }));
}

async function expectText(locator, expected) {
  const text = await locator.textContent();
  assert(text?.includes(expected), `expected "${expected}" in "${text}"`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
