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
const protocolPatternFixture = `
  <section aria-labelledby="patterns-title" data-review-id="content.patterns">
    <h2 id="patterns-title">Reusable pattern behavior</h2>
    <p class="eyebrow">Accessible label</p>
    <p><a href="#patterns-title" data-pattern-link>Review the reusable patterns</a></p>
    <div class="hero-wash" data-pattern-hero><p>A restrained optional overview wash.</p></div>
    <aside class="doc-note" data-pattern-note><strong>Readiness note.</strong> Evidence remains visible in every output mode.</aside>
    <dl class="property-list">
      <div class="property" data-pattern-property><dt>State</dt><dd>Ready for focused review</dd></div>
      <div class="property"><dt>Evidence</dt><dd>Rendered behavior and regression checks</dd></div>
    </dl>
    <div class="split-row" data-pattern-split><div>Current behavior</div><div>Expected behavior</div></div>
    <div class="code-group" data-pattern-code>
      <header>Validation command</header>
      <pre><code>const immutablePayload = "${'abcdefghijklmnopqrstuvwxyz'.repeat(14)}";</code></pre>
    </div>
    <div class="resource-grid" data-pattern-resources>
      <article class="resource-card"><span class="meta-tag" data-pattern-tag>TEST</span><p><a href="#first-title">First resource</a></p></article>
      <article class="resource-card"><p><a href="#second-title">Second resource</a></p></article>
      <article class="resource-card"><p><a href="#patterns-title">Third resource</a></p></article>
      <article class="resource-card"><p><a href="#patterns-title">Fourth resource</a></p></article>
    </div>
    <hr class="section-divider">
  </section>`;

const executablePath = chromium.executablePath();
assert(existsSync(executablePath), 'Pinned Playwright Chromium is missing. Run `npx playwright install chromium`.');
assert(contrast('rgb(5, 150, 105)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)') < 4.5, 'contrast guard should reject the previous emerald text regression');

const browser = await chromium.launch({ headless: true });
try {
  for (const [name, relativePath, slot] of targets) {
    const template = readFileSync(resolve(root, relativePath), 'utf8');
    assert(template.includes(slot), `${name} template composition slot is missing`);
    const usesProtocolPatterns = ['prd', 'design'].includes(name);
    const content = usesProtocolPatterns ? `${composed}${protocolPatternFixture}` : composed;
    const html = template.replace(slot, content).replace(/\{\{[^}]+\}\}/g, 'Fixture');
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(50);

    await assertDesktopShell(page, name);
    await assertProtocolTypography(page, name);
    await assertProgressiveNavigation(page, name, usesProtocolPatterns ? 3 : 2);
    if (usesProtocolPatterns) await assertProtocolPatternScreen(page, name);

    await page.setViewportSize({ width: 320, height: 900 });
    await assertMobileShell(page, name);
    await assertNoPageOverflow(page, name);
    if (usesProtocolPatterns) {
      await assertProtocolPatternMobile(page, name);
      await page.evaluate(() => document.documentElement.style.fontSize = '200%');
      await assertNoPageOverflow(page, `${name} at 200% text`);
      await assertProtocolPatternMobile(page, `${name} at 200% text`);
      await page.evaluate(() => document.documentElement.style.removeProperty('font-size'));
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ media: 'print' });
    await assertPrintShell(page, name);
    if (usesProtocolPatterns) await assertProtocolPatternPrint(page, name);

    await page.close();
    const patternCoverage = usesProtocolPatterns ? ', reusable patterns, and 200% text' : '';
    console.log(`✓ ${name} shell: desktop, 320px, generated section index, print${patternCoverage}`);
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

async function assertProtocolTypography(page, name) {
  if (!['prd', 'design'].includes(name)) return;
  const result = await page.evaluate(() => ({
    body: Number.parseFloat(getComputedStyle(document.body).fontSize),
    h1: Number.parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
    h2: Number.parseFloat(getComputedStyle(document.querySelector('main h2')).fontSize),
    h2Line: Number.parseFloat(getComputedStyle(document.querySelector('main h2')).lineHeight),
    lead: Number.parseFloat(getComputedStyle(document.querySelector('.lede')).fontSize),
  }));
  assert(result.body === 14, `${name}: Protocol body type should be 14px, received ${result.body}px`);
  assert(result.lead === 16, `${name}: Protocol lead should be 16px, received ${result.lead}px`);
  assert(result.h1 === 24, `${name}: Protocol page title should be 24px, received ${result.h1}px`);
  assert(result.h2 === 18, `${name}: Protocol section heading should be 18px, received ${result.h2}px`);
  assert(result.h2Line === 28, `${name}: Protocol section heading line height should be 28px, received ${result.h2Line}px`);
}

async function assertProgressiveNavigation(page, name, expectedHeadings) {
  const result = await page.evaluate(() => ({
    authoredHeadings: document.querySelectorAll('main#main > article h2[id]').length,
    desktopLinks: document.querySelectorAll('[data-document-navigation-target] a[href^="#"]').length,
    mobileLinks: document.querySelectorAll('[data-document-navigation-mobile] a[href^="#"]').length,
  }));
  assert(result.authoredHeadings === expectedHeadings, `${name}: fixture should contain ${expectedHeadings} authored headings`);
  assert(result.desktopLinks === expectedHeadings, `${name}: desktop index should derive exactly ${expectedHeadings} links from authored headings`);
  assert(result.mobileLinks === expectedHeadings, `${name}: mobile index should derive exactly ${expectedHeadings} links from authored headings`);
}

async function assertProtocolPatternScreen(page, name) {
  await page.locator('[data-pattern-link]').focus();
  await page.waitForTimeout(200);
  const result = await page.evaluate(() => {
    const style = (selector, pseudo) => getComputedStyle(document.querySelector(selector), pseudo);
    const columns = (selector) => style(selector).gridTemplateColumns.split(' ').filter(Boolean).length;
    return {
      pageBackground: style('body').backgroundColor,
      linkColor: style('[data-pattern-link]').color,
      linkDecoration: style('[data-pattern-link]').textDecorationColor,
      linkFocus: style('[data-pattern-link]').boxShadow,
      eyebrowColor: style('.eyebrow').color,
      tagColor: style('[data-pattern-tag]').color,
      tagBackground: style('[data-pattern-tag]').backgroundColor,
      noteColor: style('[data-pattern-note]').color,
      noteBackground: style('[data-pattern-note]').backgroundColor,
      noteIconColor: style('[data-pattern-note]', '::before').color,
      noteIconBackground: style('[data-pattern-note]', '::before').backgroundColor,
      propertyColumns: columns('[data-pattern-property]'),
      splitColumns: columns('[data-pattern-split]'),
      resourceColumns: columns('[data-pattern-resources]'),
      heroDisplay: style('[data-pattern-hero]', '::before').display,
    };
  });
  assertContrast(result.linkColor, result.pageBackground, `${name}: body link`);
  assertContrast(result.eyebrowColor, result.pageBackground, `${name}: eyebrow`);
  assertContrast(result.tagColor, result.tagBackground, `${name}: metadata tag`, result.pageBackground);
  assertContrast(result.noteColor, result.noteBackground, `${name}: document note`, result.pageBackground);
  assertContrast(result.noteIconColor, result.noteIconBackground, `${name}: document note marker`);
  assert(result.linkDecoration !== 'rgba(0, 0, 0, 0)', `${name}: focused link should expose its underline`);
  assert(result.linkFocus !== 'none', `${name}: focused link should retain a visible focus ring`);
  assert(result.propertyColumns === 2, `${name}: property rows should use two columns on desktop`);
  assert(result.splitColumns === 2, `${name}: split rows should use two columns on wide screens`);
  assert(result.resourceColumns === 4, `${name}: resource grids should use four columns on wide screens`);
  assert(result.heroDisplay !== 'none', `${name}: an opted-in hero wash should render on screen`);
}

async function assertProtocolPatternMobile(page, name) {
  const result = await page.evaluate(() => {
    const style = (selector) => getComputedStyle(document.querySelector(selector));
    const columns = (selector) => style(selector).gridTemplateColumns.split(' ').filter(Boolean).length;
    const code = document.querySelector('[data-pattern-code] pre');
    return {
      propertyColumns: columns('[data-pattern-property]'),
      splitColumns: columns('[data-pattern-split]'),
      resourceColumns: columns('[data-pattern-resources]'),
      codeScrollsLocally: code.scrollWidth > code.clientWidth,
    };
  });
  assert(result.propertyColumns === 1, `${name}: property rows should stack at narrow widths`);
  assert(result.splitColumns === 1, `${name}: split rows should stack at narrow widths`);
  assert(result.resourceColumns === 1, `${name}: resource grids should stack at narrow widths`);
  assert(result.codeScrollsLocally, `${name}: long code should scroll inside its code group`);
}

async function assertProtocolPatternPrint(page, name) {
  const initial = await page.evaluate(() => {
    const link = getComputedStyle(document.querySelector('[data-pattern-link]'));
    return { color: link.color, transitionDuration: link.transitionDuration };
  });
  assert(initial.color === 'rgb(0, 0, 0)', `${name} print: links should become black without waiting for a transition`);
  assert(initial.transitionDuration === '0s', `${name} print: transitions should be disabled`);
  await page.locator('.resource-card a').first().focus();
  const result = await page.evaluate(() => {
    const style = (selector, pseudo) => getComputedStyle(document.querySelector(selector), pseudo);
    const columns = (selector) => style(selector).gridTemplateColumns.split(' ').filter(Boolean).length;
    return {
      codeBackground: style('[data-pattern-code]').backgroundColor,
      codeColor: style('[data-pattern-code]').color,
      codeShadow: style('[data-pattern-code]').boxShadow,
      codeWrap: style('[data-pattern-code] pre').whiteSpace,
      headerBackground: style('[data-pattern-code] > header').backgroundColor,
      headerColor: style('[data-pattern-code] > header').color,
      noteBackground: style('[data-pattern-note]').backgroundColor,
      noteColor: style('[data-pattern-note]').color,
      cardBackground: style('.resource-card').backgroundColor,
      cardColor: style('.resource-card').color,
      cardShadow: style('.resource-card').boxShadow,
      tagBackground: style('[data-pattern-tag]').backgroundColor,
      tagColor: style('[data-pattern-tag]').color,
      heroDisplay: style('[data-pattern-hero]', '::before').display,
      linkColor: style('.resource-card a').color,
      linkDecoration: style('.resource-card a').textDecorationLine,
      linkFocus: style('.resource-card a').boxShadow,
      splitColumns: columns('[data-pattern-split]'),
      resourceColumns: columns('[data-pattern-resources]'),
    };
  });
  for (const [surface, color] of [
    ['code group', result.codeBackground],
    ['code header', result.headerBackground],
    ['document note', result.noteBackground],
    ['resource card', result.cardBackground],
    ['metadata tag', result.tagBackground],
  ]) assert(color === 'rgb(255, 255, 255)', `${name} print: ${surface} should use a white surface, received ${color}`);
  for (const [content, color] of [
    ['code group', result.codeColor],
    ['code header', result.headerColor],
    ['document note', result.noteColor],
    ['resource card', result.cardColor],
    ['metadata tag', result.tagColor],
  ]) assert(color === 'rgb(0, 0, 0)', `${name} print: ${content} should use black text, received ${color}`);
  assert(result.codeShadow === 'none', `${name} print: code groups should not retain a shadow`);
  assert(result.cardShadow === 'none', `${name} print: focused resource cards should not retain a shadow`);
  assert(result.codeWrap === 'pre-wrap', `${name} print: long code should wrap instead of clipping`);
  assert(result.heroDisplay === 'none', `${name} print: decorative hero wash should be removed`);
  assert(result.linkColor === 'rgb(0, 0, 0)', `${name} print: focused links should use black text`);
  assert(result.linkDecoration.includes('underline'), `${name} print: links should remain visually identifiable`);
  assert(result.linkFocus === 'none', `${name} print: links should not print a focus ring`);
  assert(result.splitColumns === 1, `${name} print: split evidence should return to reading order`);
  assert(result.resourceColumns === 2, `${name} print: resource grids should use two readable columns`);
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

function assertContrast(foreground, background, label, underlay = 'rgb(255, 255, 255)') {
  const ratio = contrast(foreground, background, underlay);
  assert(ratio >= 4.5, `${label} contrast ${ratio.toFixed(2)}:1 is below WCAG AA`);
}

function contrast(foreground, background, underlay) {
  const foregroundColor = composite(parseColor(foreground), parseColor(underlay));
  const backgroundColor = composite(parseColor(background), parseColor(underlay));
  const values = [foregroundColor, backgroundColor].map(luminance).sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
}

function parseColor(value) {
  const channels = value.match(/[\d.]+/g)?.map(Number);
  assert(channels?.length >= 3, `cannot parse rendered color ${value}`);
  return [channels[0], channels[1], channels[2], channels[3] ?? 1];
}

function composite([red, green, blue, alpha], [underRed, underGreen, underBlue]) {
  return [
    red * alpha + underRed * (1 - alpha),
    green * alpha + underGreen * (1 - alpha),
    blue * alpha + underBlue * (1 - alpha),
  ];
}

function luminance(color) {
  const [red, green, blue] = color
    .map((channel) => channel / 255)
    .map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return .2126 * red + .7152 * green + .0722 * blue;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
