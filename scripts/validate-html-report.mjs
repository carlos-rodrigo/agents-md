#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const args = process.argv.slice(2);
const options = new Set(args.filter((arg) => arg.startsWith('--')));
const files = args.filter((arg) => !arg.startsWith('--'));
const allowPlaceholders = options.has('--allow-placeholders');

if (options.has('--help') || files.length === 0) {
  console.log(`Usage: validate-html-report.mjs [--allow-placeholders] <file.html> [...]

Checks self-contained reviewable HTML reports for the quality gates used by the
html-report-designer skill. Templates may be checked with --allow-placeholders;
generated reports should not use that flag.`);
  process.exit(files.length === 0 ? 2 : 0);
}

let failedFiles = 0;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const errors = [];
  const warnings = [];

  const count = (pattern) => (html.match(pattern) || []).length;
  const has = (pattern) => pattern.test(html);

  if (!/^\s*<!doctype html>/i.test(html)) {
    errors.push('missing <!doctype html>');
  }

  if (!has(/<html\b[^>]*lang=["'][a-z-]+["'][^>]*>/i)) {
    errors.push('missing <html lang="…">');
  }

  const h1Count = count(/<h1\b/gi);
  if (h1Count !== 1) {
    errors.push(`expected exactly one <h1>, found ${h1Count}`);
  }

  if (!allowPlaceholders && has(/\{\{[^}]+\}\}/)) {
    errors.push('unresolved {{PLACEHOLDER}} tokens remain');
  }

  if (!has(/<a\b[^>]*class=["'][^"']*skip-link[^"']*["'][^>]*href=["']#main["'][^>]*>/i)) {
    errors.push('missing skip link targeting #main');
  }

  if (!has(/<main\b[^>]*id=["']main["'][^>]*>/i)) {
    errors.push('missing <main id="main">');
  }

  const externalAssetPatterns = [
    /<(?:script|img|iframe|link)\b[^>]+(?:src|href)=["']https?:\/\//i,
    /@import\s+url\(["']?https?:\/\//i,
    /url\(["']?https?:\/\//i,
  ];
  for (const pattern of externalAssetPatterns) {
    if (has(pattern)) {
      errors.push('uses remote asset or dependency; reports should be self-contained');
      break;
    }
  }

  const reviewIds = [...html.matchAll(/data-review-id\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
  if (reviewIds.length === 0) {
    errors.push('no data-review-id anchors found');
  }

  const seenReviewIds = new Set();
  const duplicateReviewIds = new Set();
  for (const id of reviewIds) {
    if (seenReviewIds.has(id)) duplicateReviewIds.add(id);
    seenReviewIds.add(id);
    if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(id)) {
      errors.push(`review id "${id}" should be lowercase kebab/dot notation`);
    }
  }
  for (const id of duplicateReviewIds) {
    errors.push(`duplicate data-review-id "${id}"`);
  }

  const htmlIds = [...html.matchAll(/\sid\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
  const seenHtmlIds = new Set();
  const duplicateHtmlIds = new Set();
  for (const id of htmlIds) {
    if (seenHtmlIds.has(id)) duplicateHtmlIds.add(id);
    seenHtmlIds.add(id);
  }
  for (const id of duplicateHtmlIds) {
    errors.push(`duplicate id="${id}"`);
  }

  const tableCount = count(/<table\b/gi);
  const captionCount = count(/<caption\b/gi);
  if (captionCount < tableCount) {
    errors.push(`tables need captions: found ${tableCount} table(s), ${captionCount} caption(s)`);
  }

  const svgBlocks = [...html.matchAll(/<svg\b[\s\S]*?<\/svg>/gi)].map((match) => match[0]);
  for (const [index, svg] of svgBlocks.entries()) {
    const hasTitleAndDesc = /<title\b/i.test(svg) && /<desc\b/i.test(svg);
    const hasFigureCaption = /<figure\b[\s\S]*?<figcaption\b/i.test(html);
    if (!hasTitleAndDesc && !hasFigureCaption) {
      errors.push(`svg ${index + 1} needs <title>/<desc> or a surrounding figure caption`);
    }
  }

  const hasProgressiveMotion = has(/IntersectionObserver|\.reveal|diagram-reveal/i);
  if (hasProgressiveMotion && !has(/prefers-reduced-motion/i)) {
    errors.push('motion/reveal behavior must include prefers-reduced-motion handling');
  }

  if (!has(/@media\s+print/i)) {
    warnings.push('missing print stylesheet');
  }

  if (!has(/<nav\b[^>]*aria-label=["'][^"']*(table of contents|contents)[^"']*["']/i)) {
    warnings.push('missing labelled table-of-contents nav; acceptable only for tiny/diagram-only pages');
  }

  if (!has(/<footer\b/i)) {
    warnings.push('missing provenance/footer region');
  }

  if (errors.length > 0) {
    failedFiles += 1;
    console.error(`✗ ${file}`);
    for (const error of errors) console.error(`  error: ${error}`);
    for (const warning of warnings) console.error(`  warn:  ${warning}`);
  } else {
    console.log(`✓ ${file}`);
    for (const warning of warnings) console.log(`  warn: ${warning}`);
  }
}

if (failedFiles > 0) {
  console.error(`\n${failedFiles} file(s) failed HTML report validation.`);
  process.exit(1);
}

console.log(`\nValidated ${files.length} HTML report file(s).`);
