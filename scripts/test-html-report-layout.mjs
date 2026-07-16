#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const targets = [
  {
    name: 'report',
    path: 'skills/html-report-designer/resources/report-template.html',
    stacked: ['.scenario-stack'],
    visualComparison: true,
  },
  {
    name: 'prd',
    path: 'skills/html-report-designer/resources/prd-template.html',
    stacked: ['.scenario-stack', '.story-outcome-list', '.ui-option-list'],
  },
  {
    name: 'design',
    path: 'skills/html-report-designer/resources/design-template.html',
    stacked: ['.scenario-stack', '.story-list', '.slice-list', '.domain-walkthrough'],
    visualComparison: true,
  },
];

const executablePath = chromium.executablePath();
assert(existsSync(executablePath), 'Pinned Playwright Chromium is missing. Run `npx playwright install chromium`.');

const browser = await chromium.launch({ headless: true });
try {
  for (const target of targets) {
    const html = readFileSync(resolve(root, target.path), 'utf8');
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.setContent(html, { waitUntil: 'load' });

    await assertStackedSections(page, target, 'desktop');
    await assertRichHtmlSemantics(page, target);
    if (target.visualComparison) await assertVisualComparison(page, target, 'desktop');

    await page.setViewportSize({ width: 320, height: 900 });
    await assertNoPageOverflow(page, target);
    await assertStackedSections(page, target, '320px');
    if (target.visualComparison) await assertVisualComparison(page, target, '320px');

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ media: 'print' });
    await assertStackedSections(page, target, 'print');
    if (target.visualComparison) await assertVisualComparison(page, target, 'print');
    await assertClosedDetailsPrintReadable(page, target);
    await page.close();
    console.log(`✓ ${target.name} template: desktop, 320px, and print layout`);
  }
} finally {
  await browser.close();
}

console.log(`\nValidated ${targets.length} HTML report template layout(s).`);

async function assertStackedSections(page, target, mode) {
  for (const selector of target.stacked) {
    const results = await page.locator(selector).evaluateAll((containers) => containers.map((container) => {
      const children = Array.from(container.children).filter((child) => {
        const style = getComputedStyle(child);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      const rects = children.map((child) => {
        const rect = child.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, width: rect.width };
      });
      const containerWidth = container.getBoundingClientRect().width;
      return {
        childCount: children.length,
        fullWidth: rects.every((rect) => Math.abs(rect.width - containerWidth) <= 2),
        ordered: rects.every((rect, index) => index === 0 || rect.top >= rects[index - 1].bottom - 1),
      };
    }));
    assert(results.length > 0, `${target.name} ${mode}: missing sequential container ${selector}`);
    for (const result of results) {
      assert(result.childCount >= 2, `${target.name} ${mode}: ${selector} needs at least 2 sequential items`);
      assert(result.fullWidth, `${target.name} ${mode}: ${selector} items must remain full width`);
      assert(result.ordered, `${target.name} ${mode}: ${selector} visual order must match DOM order`);
    }
  }
}

async function assertNoPageOverflow(page, target) {
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
  }));
  assert(
    overflow.page <= overflow.viewport + 1,
    `${target.name} 320px: page-level horizontal overflow (${overflow.page}px > ${overflow.viewport}px)`,
  );
}

async function assertVisualComparison(page, target, mode) {
  const result = await page.locator('[data-layout-exception="visual-diff"]').first().evaluate((container) => {
    const children = Array.from(container.children).filter((child) => child.matches('article'));
    const tops = children.map((child) => Math.round(child.getBoundingClientRect().top));
    return { count: children.length, sideBySide: new Set(tops).size === 1 };
  }).catch(() => null);
  const shouldBeSideBySide = mode === 'desktop';
  assert(result, `${target.name}: missing explicit visual-diff layout exception`);
  assert(result.count === 2, `${target.name}: visual-diff exception must contain exactly 2 equivalent states`);
  assert(
    result.sideBySide === shouldBeSideBySide,
    `${target.name} ${mode}: visual-diff states must be ${shouldBeSideBySide ? 'side by side' : 'stacked'}`,
  );
}

async function assertClosedDetailsPrintReadable(page, target) {
  const result = await page.evaluate(() => {
    const contents = Array.from(document.querySelectorAll('details:not([open]) > :not(summary)'));
    return {
      count: contents.length,
      readable: contents.every((element) => getComputedStyle(element).display !== 'none'),
    };
  });
  assert(result.count > 0, `${target.name} print: template needs a closed supporting-evidence disclosure fixture`);
  assert(result.readable, `${target.name} print: closed disclosure content must print expanded/readable`);
}

async function assertRichHtmlSemantics(page, target) {
  const invalid = await page.locator(':not(svg)[role="img"]').count();
  assert(invalid === 0, `${target.name}: rich HTML containers must not use role="img"`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
