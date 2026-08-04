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
  assert(await page.locator('body').getAttribute('data-visual-mode') === 'editorial-infrastructure-v1', 'canonical reports should declare the approved Editorial Infrastructure visual mode');
  const editorialDesktop = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const article = getComputedStyle(document.querySelector('.report-article'));
    const title = getComputedStyle(document.querySelector('h1'));
    const section = getComputedStyle(document.querySelector('.section-card'));
    return {
      page: body.backgroundColor,
      grid: body.backgroundImage,
      article: article.backgroundColor,
      radius: Number.parseFloat(article.borderRadius),
      border: Number.parseFloat(article.borderTopWidth),
      shadow: article.boxShadow,
      titleSize: Number.parseFloat(title.fontSize),
      sectionDisplay: section.display,
      sectionColumns: section.gridTemplateColumns.split(' ').length,
    };
  });
  assert(editorialDesktop.page === 'rgb(255, 255, 255)', `Editorial Infrastructure should use one white page canvas (${editorialDesktop.page})`);
  assert((editorialDesktop.grid.match(/linear-gradient/g) ?? []).length === 2, `Editorial Infrastructure should carry the square grid across the page (${editorialDesktop.grid})`);
  assert(editorialDesktop.article === 'rgba(0, 0, 0, 0)' && editorialDesktop.radius === 0 && editorialDesktop.border === 0 && editorialDesktop.shadow === 'none', 'report content should share the full-page grid instead of sitting inside a competing opaque card');
  assert(editorialDesktop.titleSize >= 54, `desktop report title should lead with editorial scale (${editorialDesktop.titleSize}px)`);
  assert(editorialDesktop.sectionDisplay === 'grid' && editorialDesktop.sectionColumns === 2, 'desktop report sections should use a numbered chapter rail');
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
  assert(await page.locator('svg[role="img"][data-diagram-style="infrastructure-v1"]').count() === 1, 'PRD should render one accessible infrastructure-style System Diagram SVG');
  assert(await page.locator('.figure-card svg').evaluate((svg) => getComputedStyle(svg).maxWidth === '1024px'), 'screen diagrams should cap their rendered width at 1024px');
  assert(await page.locator('.figure-card').evaluateAll((figures) => figures.every((figure) => figure.scrollWidth <= figure.clientWidth + 1)), 'desktop diagrams should fit their visible figure width without horizontal scrolling');
  assert(await page.locator('.decision-recorder').count() === 1, 'PRD should render one decision recorder');
  const workflow = page.locator('.storyboard').first();
  assert(await workflow.evaluate((node) => node.tagName) === 'OL', 'slice handoffs should use a semantic ordered workflow');
  assert(await workflow.locator(':scope > .storyboard-step').evaluateAll((nodes) => nodes.every((node) => node.tagName === 'LI')), 'every workflow stage should be an ordered-list item');
  const workflowDesktop = await workflow.evaluate((node) => {
    const step = node.querySelector('.storyboard-step');
    const sequence = node.previousElementSibling?.querySelector('.workflow-sequence');
    const stepStyle = getComputedStyle(step);
    return {
      columns: getComputedStyle(node).gridTemplateColumns.split(' ').length,
      radius: Number.parseFloat(stepStyle.borderRadius),
      background: stepStyle.backgroundColor,
      sequenceDisplay: sequence ? getComputedStyle(sequence).display : '',
      sequenceText: sequence?.textContent ?? '',
    };
  });
  assert(workflowDesktop.columns === 2, `desktop workflow should expose each handoff in source order (${workflowDesktop.columns} columns)`);
  assert(workflowDesktop.radius === 0 && workflowDesktop.background === 'rgba(0, 0, 0, 0)', 'workflow stages should share one connected surface rather than appear as competing cards');
  assert(workflowDesktop.sequenceDisplay === 'flex' && workflowDesktop.sequenceText.includes('Choose→Record'), 'workflow heading should make the ordered handoff immediately scannable');
  const collapseStyle = await page.locator('.sidebar-toggle-copy').evaluate((node) => ({ radius: Number.parseFloat(getComputedStyle(node).borderRadius), background: getComputedStyle(node).backgroundColor }));
  assert(collapseStyle.radius === 0 && collapseStyle.background === 'rgba(0, 0, 0, 0)', 'sidebar disclosure should use the report’s quiet linear control style rather than a competing pill');
  assert(errors.length === 0, `report should have no browser errors: ${errors.join('; ')}`);
  await page.emulateMedia({ media: 'print' });
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.section-card')).opacity) === 1);
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.diagram-reveal')).opacity) === 1);
  assert(await page.locator('.section-card').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'default-motion print must reveal sections');
  assert(await page.locator('.diagram-reveal').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'default-motion print must reveal the complete diagram');
  assert(await page.locator('.side-nav').evaluate((node) => getComputedStyle(node).display) === 'none', 'print should omit navigation chrome');
  assert(await page.locator('.figure-card svg').evaluate((node) => getComputedStyle(node).minWidth) === '0px', 'print should remove diagram minimum width');
  assert(await page.evaluate(() => getComputedStyle(document.body).backgroundImage) === 'none', 'print should remove the screen grid for clean output');
  const printMinimumEffectiveText = await page.locator('.figure-card svg').evaluate((svg) => {
    const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    const sizes = [...svg.querySelectorAll('text')].map((text) => Number.parseFloat(getComputedStyle(text).fontSize));
    return Math.min(...sizes) * scale;
  });
  assert(printMinimumEffectiveText >= 12, `print diagram text should remain at least 12px (${printMinimumEffectiveText}px)`);
  await context.close();

  const dark = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark' });
  const darkPage = await dark.newPage();
  await darkPage.route('http://report.test/prd', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  await darkPage.goto('http://report.test/prd');
  const darkTheme = await darkPage.evaluate(() => ({
    page: getComputedStyle(document.body).backgroundColor,
    text: getComputedStyle(document.body).color,
    grid: getComputedStyle(document.body).backgroundImage,
    surface: getComputedStyle(document.querySelector('.decision-recorder')).backgroundColor,
  }));
  assert(darkTheme.page === 'rgb(17, 17, 17)', `dark mode should use the Editorial Infrastructure dark canvas (${darkTheme.page})`);
  assert(darkTheme.text === 'rgb(245, 245, 242)', `dark mode should use light body text (${darkTheme.text})`);
  assert(darkTheme.grid.includes('linear-gradient'), 'dark mode should preserve the square-grid canvas');
  assert(darkTheme.surface !== 'rgb(255, 255, 255)', `dark mode surfaces must not remain white (${darkTheme.surface})`);
  const darkContrast = await darkPage.evaluate(() => {
    const rgb = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = (value) => rgb(value).map((channel) => { const unit = channel / 255; return unit <= .04045 ? unit / 12.92 : ((unit + .055) / 1.055) ** 2.4; }).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
    const ratio = (foreground, background) => { const a = luminance(foreground); const b = luminance(background); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
    const background = (node) => { for (let current = node; current; current = current.parentElement) { const value = getComputedStyle(current).backgroundColor; if (value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') return value; } return getComputedStyle(document.body).backgroundColor; };
    return Object.fromEntries([['decisionOption', '.decision-option'], ['statusChip', '.status-chip'], ['backToTop', '.back-to-top']].map(([key, selector]) => { const node = document.querySelector(selector); return [key, ratio(getComputedStyle(node).color, background(node))]; }));
  });
  for (const [element, ratio] of Object.entries(darkContrast)) assert(ratio >= 4.5, `${element} dark-mode contrast must meet WCAG AA (${ratio.toFixed(2)}:1)`);
  await darkPage.emulateMedia({ media: 'print', colorScheme: 'dark' });
  assert(await darkPage.locator('body').evaluate((node) => getComputedStyle(node).backgroundColor) === 'rgb(255, 255, 255)', 'print must remain white even from dark mode');
  await dark.close();

  const narrow = await browser.newContext({ viewport: { width: 320, height: 700 } });
  const narrowPage = await narrow.newPage();
  await narrowPage.route('http://report.test/prd', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  await narrowPage.goto('http://report.test/prd');
  const overflow = await narrowPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `320px document should not overflow the page (${overflow}px)`);
  const narrowGrid = await narrowPage.evaluate(() => getComputedStyle(document.body).backgroundImage);
  assert((narrowGrid.match(/linear-gradient/g) ?? []).length === 2, 'the square-grid canvas should continue across narrow pages');
  assert(await narrowPage.locator('.section-card').first().evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length) === 1, 'narrow Editorial Infrastructure chapters should stack into one reading column');
  const tocOverflow = await narrowPage.locator('nav[aria-label="Table of contents"]').evaluate((node) => node.scrollWidth - node.clientWidth);
  assert(tocOverflow <= 1, `narrow navigation should wrap without horizontal scrolling (${tocOverflow}px)`);
  assert(await narrowPage.locator('.back-to-top').evaluate((node) => getComputedStyle(node).display) === 'none', 'narrow reports should hide the fixed back-to-top control instead of obscuring content');
  const canvasContrast = await narrowPage.locator('.breadcrumbs').evaluate((node) => {
    const parse = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = (rgb) => {
      const channels = rgb.map((value) => { const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4; });
      return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
    };
    const foreground = luminance(parse(getComputedStyle(node).color));
    const background = luminance(parse(getComputedStyle(document.body).backgroundColor));
    return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
  });
  assert(canvasContrast >= 4.5, `small canvas labels should meet WCAG AA contrast (${canvasContrast})`);
  const figureOverflow = await narrowPage.locator('.figure-card').evaluate((node) => node.scrollWidth - node.clientWidth);
  assert(figureOverflow > 500, `320px diagram should preserve legibility through local horizontal overflow (${figureOverflow}px)`);
  const minimumEffectiveText = await narrowPage.locator('.figure-card svg').evaluate((svg) => {
    const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    const sizes = [...svg.querySelectorAll('text')].map((text) => Number.parseFloat(getComputedStyle(text).fontSize));
    return Math.min(...sizes) * scale;
  });
  assert(minimumEffectiveText >= 12, `narrow diagram text should remain at least 12px through local overflow (${minimumEffectiveText}px)`);
  assert(await narrowPage.locator('.side-nav').evaluate((node) => getComputedStyle(node).position) === 'static', 'narrow navigation should return to document flow');
  const narrowWorkflow = await narrowPage.locator('.storyboard').first().evaluate((node) => ({
    columns: getComputedStyle(node).gridTemplateColumns.split(' ').length,
    sequenceDirection: getComputedStyle(node.previousElementSibling.querySelector('.workflow-sequence')).flexDirection,
    stageRadius: Number.parseFloat(getComputedStyle(node.querySelector('.storyboard-step')).borderRadius),
  }));
  assert(narrowWorkflow.columns === 1 && narrowWorkflow.sequenceDirection === 'column', 'narrow workflow should become one connected vertical sequence');
  assert(narrowWorkflow.stageRadius === 0, 'narrow workflow stages must not revert to disconnected cards');
  await narrow.close();

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 800, height: 700 } });
  const noJsPage = await noJs.newPage();
  await noJsPage.route('http://report.test/prd', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  await noJsPage.goto('http://report.test/prd');
  assert(await noJsPage.locator('.section-card').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'no-JS sections must remain visible');
  assert(await noJsPage.locator('.diagram-reveal').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'no-JS diagram must remain complete');
  const noJsRecorder = noJsPage.locator('.decision-recorder').first();
  assert(await noJsRecorder.locator('[data-decision-recorded]').isDisabled(), 'no-JS decision recording must remain disabled until the runtime can validate completeness');
  assert((await noJsRecorder.locator('.decision-status').textContent())?.includes('JavaScript'), 'no-JS decision recorder must explain that review input is not recorded');
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
  assert(await reducedPage.locator('.diagram-reveal').first().evaluate((node) => Number(getComputedStyle(node).opacity)) === 1, 'reduced-motion diagram must remain complete without stagger delays');
  await reduced.close();

  console.log('PASS: canonical report covers native navigation, active TOC, desktop, 320px, no-JS, observer fallback, reduced motion, and print');
} finally {
  await browser.close();
}

function assert(condition, message) { if (!condition) throw new Error(message); }
