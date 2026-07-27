#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const targets = [
  ['generic', 'skills/html-report-designer/resources/report-template.html', '{{COMPOSED_REPORT_CONTENT}}'],
  ['prd', 'skills/html-report-designer/resources/prd-template.html', '{{COMPOSED_PRD_CONTENT}}'],
  ['design', 'skills/html-report-designer/resources/design-template.html', '{{COMPOSED_DESIGN_CONTENT}}'],
];
const composed = `
  <section aria-labelledby="first-title" data-review-id="content.first">
    <h2 id="first-title">First authored question</h2>
    <p>The owning skill decides this content and its order.</p>
  </section>
  <section aria-labelledby="second-title" data-review-id="content.second">
    <h2 id="second-title">Second authored question</h2>
    <p>The shell presents it without adding a report outline.</p>
  </section>`;

const executablePath = chromium.executablePath();
assert(existsSync(executablePath), 'Pinned Playwright Chromium is missing. Run `npx playwright install chromium`.');

const browser = await chromium.launch({ headless: true });
try {
  for (const [name, relativePath, slot] of targets) {
    const template = readFileSync(resolve(root, relativePath), 'utf8');
    assert(template.includes(slot), `${name} template composition slot is missing`);
    const html = template.replace(slot, composed).replace(/\{\{[^}]+\}\}/g, 'Fixture');
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(50);

    await assertDesktopShell(page, name);
    await assertProgressiveNavigation(page, name);

    await page.setViewportSize({ width: 320, height: 900 });
    await assertMobileShell(page, name);
    await assertNoPageOverflow(page, name);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ media: 'print' });
    await assertPrintShell(page, name);

    await page.close();
    console.log(`✓ ${name} shell: desktop, 320px, generated section index, and print`);
  }
} finally {
  await browser.close();
}

console.log(`\nValidated ${targets.length} content-neutral HTML shell layout(s).`);

async function assertDesktopShell(page, name) {
  const result = await page.evaluate(() => {
    const sidebar = document.querySelector('.sidebar');
    const header = document.querySelector('.headerbar');
    const frame = document.querySelector('.content-frame');
    const main = document.querySelector('main#main');
    const article = main?.querySelector(':scope > article');
    return {
      sidebarDisplay: getComputedStyle(sidebar).display,
      sidebarPosition: getComputedStyle(sidebar).position,
      headerPosition: getComputedStyle(header).position,
      headerLeft: header.getBoundingClientRect().left,
      frameLeft: frame.getBoundingClientRect().left,
      mainWidth: main.getBoundingClientRect().width,
      articleWidth: article.getBoundingClientRect().width,
    };
  });
  assert(result.sidebarDisplay !== 'none', `${name} desktop: section rail should be visible`);
  assert(result.sidebarPosition === 'fixed', `${name} desktop: section rail should be fixed`);
  assert(result.headerPosition === 'fixed', `${name} desktop: header bar should be fixed`);
  assert(result.headerLeft > 200, `${name} desktop: header should clear the section rail`);
  assert(result.frameLeft > 200, `${name} desktop: content should clear the section rail`);
  assert(result.mainWidth <= 1100, `${name} desktop: reading/figure canvas should remain focused`);
  assert(result.articleWidth <= result.mainWidth + 1, `${name} desktop: article should remain inside main`);
}

async function assertProgressiveNavigation(page, name) {
  const result = await page.evaluate(() => ({
    authoredHeadings: document.querySelectorAll('main#main > article h2[id]').length,
    desktopLinks: document.querySelectorAll('[data-document-navigation-target] a[href^="#"]').length,
    mobileLinks: document.querySelectorAll('[data-document-navigation-mobile] a[href^="#"]').length,
  }));
  assert(result.authoredHeadings === 2, `${name}: fixture should contain two authored headings`);
  assert(result.desktopLinks === 2, `${name}: desktop index should derive exactly two links from authored headings`);
  assert(result.mobileLinks === 2, `${name}: mobile index should derive exactly two links from authored headings`);
}

async function assertMobileShell(page, name) {
  const result = await page.evaluate(() => ({
    sidebarDisplay: getComputedStyle(document.querySelector('.sidebar')).display,
    headerLeft: document.querySelector('.headerbar').getBoundingClientRect().left,
    frameLeft: document.querySelector('.content-frame').getBoundingClientRect().left,
    mobileNavigation: getComputedStyle(document.querySelector('.mobile-navigation')).display,
  }));
  assert(result.sidebarDisplay === 'none', `${name} 320px: desktop section rail should be hidden`);
  assert(Math.abs(result.headerLeft) <= 1, `${name} 320px: header should span from the viewport edge`);
  assert(Math.abs(result.frameLeft) <= 1, `${name} 320px: content should not retain desktop offset`);
  assert(result.mobileNavigation !== 'none', `${name} 320px: native mobile section control should be available`);
}

async function assertNoPageOverflow(page, name) {
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
  }));
  assert(overflow.page <= overflow.viewport + 1, `${name} 320px: page overflow ${overflow.page}px > ${overflow.viewport}px`);
}

async function assertPrintShell(page, name) {
  const result = await page.evaluate(() => ({
    sidebar: getComputedStyle(document.querySelector('.sidebar')).display,
    header: getComputedStyle(document.querySelector('.headerbar')).display,
    frameMargin: getComputedStyle(document.querySelector('.content-frame')).marginLeft,
    sectionsVisible: Array.from(document.querySelectorAll('main#main > article > section')).every((section) => getComputedStyle(section).display !== 'none'),
  }));
  assert(result.sidebar === 'none', `${name} print: section rail should be removed`);
  assert(result.header === 'none', `${name} print: fixed header should be removed`);
  assert(result.frameMargin === '0px', `${name} print: desktop content offset should be removed`);
  assert(result.sectionsVisible, `${name} print: authored content must remain visible`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
