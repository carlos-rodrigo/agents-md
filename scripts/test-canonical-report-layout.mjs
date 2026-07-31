#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { renderCanonicalReport } from './canonical-report.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const specPath = resolve(root, 'skills/html-report-designer/resources/specs/prd-example.document.json');
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const html = renderCanonicalReport(spec, { specPath });
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('http://report.test/prd', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  await page.goto('http://report.test/prd');
  await page.locator('.section-card').first().scrollIntoViewIfNeeded();
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.section-card')).opacity) === 1);
  assert(await page.locator('.side-nav').evaluate((node) => getComputedStyle(node).position) === 'sticky', 'desktop navigation should remain sticky');
  assert(await page.locator('.section-card').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'revealed section should be visible');
  const sidebarSummary = page.locator('.index-details > summary');
  await sidebarSummary.focus();
  await page.keyboard.press('Enter');
  assert(!(await page.locator('.index-details').evaluate((node) => node.open)), 'Enter should collapse the native sidebar disclosure');
  await page.keyboard.press('Space');
  assert(await page.locator('.index-details').evaluate((node) => node.open), 'Space should expand the native sidebar disclosure');
  const lastTocLink = page.locator('nav[aria-label="Table of contents"] a').last();
  await lastTocLink.click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('nav[aria-label="Table of contents"] a')).at(-1)?.classList.contains('is-active'));
  assert(await lastTocLink.evaluate((link) => {
    const linkRect = link.getBoundingClientRect();
    const navRect = link.closest('.side-nav').getBoundingClientRect();
    return linkRect.top >= navRect.top && linkRect.bottom <= navRect.bottom;
  }), 'active TOC entry should remain visible inside the sticky navigation');
  assert(await page.locator('svg[role="img"]').count() === 1, 'PRD should render one accessible Excalidraw SVG');
  assert(await page.locator('.decision-recorder').count() === 1, 'PRD should render one decision recorder');
  assert(errors.length === 0, `report should have no browser errors: ${errors.join('; ')}`);
  await page.emulateMedia({ media: 'print' });
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.section-card')).opacity) === 1);
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.diagram-reveal')).opacity) === 1);
  assert(await page.locator('.section-card').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'default-motion print must reveal sections');
  assert(await page.locator('.diagram-reveal').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'default-motion print must reveal the complete diagram');
  assert(await page.locator('.side-nav').evaluate((node) => getComputedStyle(node).display) === 'none', 'print should omit navigation chrome');
  await context.close();

  const narrow = await browser.newContext({ viewport: { width: 320, height: 700 } });
  const narrowPage = await narrow.newPage();
  await narrowPage.route('http://report.test/prd', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  await narrowPage.goto('http://report.test/prd');
  const overflow = await narrowPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `320px document should not overflow the page (${overflow}px)`);
  assert(await narrowPage.locator('.side-nav').evaluate((node) => getComputedStyle(node).position) === 'static', 'narrow navigation should return to document flow');
  await narrow.close();

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 800, height: 700 } });
  const noJsPage = await noJs.newPage();
  await noJsPage.route('http://report.test/prd', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  await noJsPage.goto('http://report.test/prd');
  assert(await noJsPage.locator('.section-card').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'no-JS sections must remain visible');
  assert(await noJsPage.locator('.diagram-reveal').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'no-JS diagram must remain complete');
  await noJs.close();

  const noObserver = await browser.newContext({ viewport: { width: 800, height: 700 } });
  await noObserver.addInitScript(() => { delete window.IntersectionObserver; });
  const noObserverPage = await noObserver.newPage();
  await noObserverPage.route('http://report.test/prd', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  await noObserverPage.goto('http://report.test/prd');
  assert(await noObserverPage.locator('.section-card').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'observer fallback must reveal every section');
  assert(await noObserverPage.locator('nav[aria-label="Table of contents"] a').first().evaluate((node) => node.classList.contains('is-active')), 'observer fallback must activate the first TOC entry');
  await noObserver.close();

  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 800, height: 700 } });
  const reducedPage = await reduced.newPage();
  await reducedPage.route('http://report.test/prd', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  await reducedPage.goto('http://report.test/prd');
  assert(await reducedPage.locator('.section-card').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'reduced-motion sections must be visible');
  await reduced.close();

  console.log('PASS: canonical report covers native navigation, active TOC, desktop, 320px, no-JS, observer fallback, reduced motion, and print');
} finally {
  await browser.close();
}

function assert(condition, message) { if (!condition) throw new Error(message); }
