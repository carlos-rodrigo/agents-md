#!/usr/bin/env node
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const reportRenderer = resolve(root, 'skills/html-report-designer/scripts/render-canonical-report.mjs');
const source = resolve(root, 'skills/html-report-designer/resources/specs/prd-example.document.json');
const specPath = resolve(root, 'skills/html-report-designer/resources/specs/.sequence-browser.document.json');
const outputPath = resolve(tmpdir(), `sequence-browser-${process.pid}.html`);
const document = JSON.parse(readFileSync(source, 'utf8'));
const diagram = document.sections.find((section) => section.role === 'diagram').blocks[0];
diagram.svgPath = '../../../system-diagram/resources/sequence-recovery-v2.svg';
diagram.sourcePath = '../../../system-diagram/resources/sequence-recovery-v2.json';
document.document = { ...document.document, id: 'sequence-browser-test', title: 'Sequence browser test', summary: 'Sequence browser test.' };
writeFileSync(specPath, `${JSON.stringify(document, null, 2)}\n`);
const rendered = spawnSync(process.execPath, [reportRenderer, specPath, outputPath], { cwd: root, encoding: 'utf8' });
if (rendered.status !== 0) throw new Error(`${rendered.stdout}\n${rendered.stderr}`);
const html = readFileSync(outputPath, 'utf8');
const browser = await chromium.launch({ headless: true });
const assert = (value, message) => { if (!value) throw new Error(message); };
try {
  for (const config of [{ name: 'wide', viewport: { width: 1280, height: 800 }, javaScriptEnabled: true }, { name: 'narrow', viewport: { width: 320, height: 800 }, javaScriptEnabled: true }, { name: 'no-js', viewport: { width: 1280, height: 800 }, javaScriptEnabled: false }, { name: 'reduced', viewport: { width: 1280, height: 800 }, javaScriptEnabled: true, reducedMotion: 'reduce' }]) {
    const context = await browser.newContext(config); const page = await context.newPage(); const errors = []; page.on('pageerror', (error) => errors.push(error.message)); page.on('console', (message) => message.type() === 'error' && errors.push(message.text())); await page.setContent(html);
    assert(errors.length === 0, `${config.name}: ${errors.join('; ')}`); assert(await page.locator('svg[data-diagram-type="sequence"]').count() === 1, `${config.name}: sequence figure missing`); assert(await page.locator('.diagram-walkthrough li').count() >= 1, `${config.name}: walkthrough missing`);
    if (config.name === 'narrow') { assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'narrow: page overflow'); assert(await page.locator('svg[data-diagram-type="sequence"]').evaluate((node) => Math.abs(node.getBoundingClientRect().width - Number(node.getAttribute('width'))) < 1), 'narrow: sequence was inflated beyond its authored dimensions'); }
    if (config.name === 'no-js' || config.name === 'reduced') assert(await page.locator('.section-card').first().evaluate((node) => getComputedStyle(node).opacity === '1'), `${config.name}: content hidden`);
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const page = await context.newPage(); await page.setContent(html); await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' }); assert(await page.locator('.diagram-reveal').evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).opacity === '1')), 'print: diagram hidden'); await context.close();
  console.log('✓ sequence report browser matrix: wide, 320px, no-JS, reduced-motion, print');
} finally { await browser.close(); rmSync(specPath, { force: true }); rmSync(outputPath, { force: true }); }
