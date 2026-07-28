#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const runtime = readFileSync(resolve(root, 'skills/html-report-designer/resources/artifact-review-state.js'), 'utf8');
const html = `<!doctype html><html><head><title>Decision Test</title></head><body><article>
  <fieldset class="review-option-selector" data-review-id="decision.safety">
    <legend>Safety policy</legend>
    <label><input type="radio" name="safety"><span>Private</span></label>
    <label><input type="radio" name="safety"><span>Age-banded</span></label>
    <label><input type="radio" name="safety"><input type="text" aria-label="Custom safety policy"></label>
  </fieldset>
  <section class="feedback-widget"></section>
</article><script>${runtime}</script></body></html>`;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();
await page.route('http://review.test/report', (route) => route.fulfill({ contentType: 'text/html', body: html }));
await page.goto('http://review.test/report');

const radios = page.locator('input[type="radio"]');
await radios.nth(1).check();
await expectText(page.locator('.review-selection-status'), 'Saved in this browser');
await page.reload();
assert(await radios.nth(1).isChecked(), 'selected option should restore after reload');
await expectText(page.locator('.review-selection-status'), 'Restored from this browser');

const custom = page.locator('input[type="text"]');
await custom.fill('Guardian alert');
assert(await radios.nth(2).isChecked(), 'typing a custom answer should select its radio option');
await page.reload();
assert(await radios.nth(2).isChecked(), 'custom option should restore after reload');
assert((await custom.inputValue()) === 'Guardian alert', 'custom answer should restore after reload');

const download = page.waitForEvent('download');
await page.locator('[data-review-download]').click();
const downloaded = await download;
assert(downloaded.suggestedFilename() === 'decision-test.review-selections.md', 'download should use a stable Markdown filename');
const downloadText = readFileSync(await downloaded.path(), 'utf8');
assert(downloadText.includes('Review ID: `decision.safety`'), 'export should include the stable review ID');
assert(downloadText.includes('Selected: Guardian alert'), 'export should include the selected custom answer');

await browser.close();
console.log('PASS: review selections persist across reloads and export as Markdown');

async function expectText(locator, expected) {
  const text = await locator.textContent();
  assert(text?.includes(expected), `expected "${expected}" in "${text}"`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
