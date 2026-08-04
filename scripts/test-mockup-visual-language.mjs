#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { copyFileSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const renderer = resolve(root, 'skills/html-report-designer/scripts/render-mockup.mjs');
const fixture = resolve(root, 'skills/frontend-design/evals/files/editorial-mockup.html');
const temp = resolve(root, `.tmp-editorial-mockup-${process.pid}.html`);
copyFileSync(fixture, temp);
try {
  run([temp]);
  const css = readFileSync(resolve(root, 'skills/html-report-designer/resources/report.tailwind.css'), 'utf8').trim();
  const digest = createHash('sha256').update(css).digest('hex');
  const rendered = readFileSync(temp, 'utf8');
  assert(rendered.includes(`data-editorial-infrastructure="v1" data-editorial-infrastructure-sha256="${digest}"`), 'mockup must carry the canonical Editorial Infrastructure digest');
  assert(rendered.includes('data-visual-mode="editorial-infrastructure-v1"'), 'mockup body must declare the Editorial Infrastructure visual mode');
  assert(rendered.includes('mockup-editorial-bridge:start'), 'mockup must include the managed visual-language bridge');
  assert(rendered.includes('.mockup-title h1') && rendered.includes('font: 400 clamp(44px, 5.5vw, 76px)/.98 var(--sans) !important'), 'mockup bridge must enforce canonical title typography');
  assert(rendered.includes('.app-window { border: 1px solid var(--border) !important; border-radius: 0 !important'), 'mockup bridge must enforce canonical figure treatment');
  assert(rendered.includes('editorial-infrastructure:start') && rendered.includes(css.slice(0, 80)), 'mockup must inline the canonical report CSS');
  run(['--check', temp]);
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(pathToFileURL(temp).href);
    const theme = await page.evaluate(() => ({ page: getComputedStyle(document.body).backgroundColor, text: getComputedStyle(document.body).color, titleFont: getComputedStyle(document.querySelector('h1')).fontFamily }));
    assert(theme.page === 'rgb(17, 17, 17)' && theme.text === 'rgb(245, 245, 242)', `mockup must inherit canonical dark colors (${JSON.stringify(theme)})`);
    assert(theme.titleFont.includes('Geist'), `mockup must inherit canonical title typography (${theme.titleFont})`);
    await context.close();
  } finally { await browser.close(); }
  writeFileSync(temp, rendered.replace('editorial-infrastructure:start', 'editorial-infrastructure:changed'));
  const stale = spawnSync(process.execPath, [renderer, '--check', temp], { encoding: 'utf8' });
  assert(stale.status !== 0, 'stale mockup content must be rejected');
  console.log('PASS: mockup renderer embeds current Editorial Infrastructure CSS and rejects stale output');
} finally { rmSync(temp, { force: true }); }
function run(args) { const result = spawnSync(process.execPath, [renderer, ...args], { encoding: 'utf8' }); assert(result.status === 0, `${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`); }
function assert(value, message) { if (!value) throw new Error(message); }
