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

  const isPrdReport = /^(prd|prd-template)\.html$/i.test(basename(file));
  if (isPrdReport) {
    const requiredPrdReviewIds = [
      ['summary', 'executive summary'],
      ['what', 'What section'],
      ['what.capability-001', 'first feature capability'],
      ['why', 'Why section'],
      ['why.success-signals', 'success signals'],
      ['how', 'How section'],
      ['how.story-001', 'first product story'],
      ['how.workflow-001', 'first product workflow'],
      ['acceptance', 'acceptance criteria'],
      ['acceptance.ac-001', 'first acceptance criterion'],
      ['open-questions', 'open questions'],
      ['ready-for-design', 'ready-for-design handoff'],
    ];
    for (const [id, label] of requiredPrdReviewIds) {
      if (!seenReviewIds.has(id)) {
        errors.push(`PRD report missing ${label} data-review-id "${id}"`);
      }
    }
  }

  const isDesignReport = /^(design|design-template)\.html$/i.test(basename(file));
  if (isDesignReport) {
    const requiredDesignReviewIds = [
      ['prd-story-inventory', 'PRD story/BDD inventory'],
      ['architecture-overview', 'high-level architecture overview'],
      ['architecture-overview.figure', 'high-level architecture diagram'],
      ['architecture-delta', 'new/changed component delta'],
      ['slice-plan', 'PRD-derived slice plan'],
      ['slice-designs.slice-001', 'first per-slice outside-in design'],
      ['slice-designs.slice-001.diagram', 'first per-slice architecture mini diagram'],
      ['story-coverage', 'story/spec coverage matrix'],
      ['tasks-and-feedback', 'task feedback hooks'],
    ];
    for (const [id, label] of requiredDesignReviewIds) {
      if (!seenReviewIds.has(id)) {
        errors.push(`design report missing ${label} data-review-id "${id}"`);
      }
    }
  }

  const isSystemDiagramReport = /^system-diagram-template\.html$/i.test(basename(file)) || has(/data-visual-mode=["']system-diagram-packet["']/i);
  if (isSystemDiagramReport) {
    const requiredDiagramReviewIds = [
      ['diagram.brief', 'diagram brief'],
      ['diagram.brief.question', 'diagram question'],
      ['diagram.figure', 'diagram figure'],
      ['diagram.svg', 'reviewable SVG'],
      ['diagram.legend', 'semantic legend'],
      ['diagram.evidence', 'source evidence'],
      ['diagram.quality-gate', 'diagram quality gate'],
    ];
    for (const [id, label] of requiredDiagramReviewIds) {
      if (!seenReviewIds.has(id)) {
        errors.push(`system diagram missing ${label} data-review-id "${id}"`);
      }
    }

    if (!has(/<style\b[^>]*data-tailwind-build=["']system-diagram\.tailwind\.css["']/i)) {
      errors.push('system diagram template must inline CSS compiled from system-diagram.tailwind.css');
    }
    if (!has(/<svg\b[^>]*viewBox=["'][^"']+["'][^>]*role=["']img["']/i)) {
      errors.push('system diagram SVG must include viewBox and role="img"');
    }
    if (!has(/class=["'][^"']*diagram-arrow-label[^"']*["']/i)) {
      errors.push('system diagram arrows need visible labels');
    }
    if (!has(/data-review-id=["']diagram\.edge-label\.[^"']+["']/i)) {
      errors.push('system diagram arrow labels must be foreground reviewable edge-label groups');
    }
    if (!has(/class=["'][^"']*diagram-label-bg[^"']*["']/i)) {
      errors.push('system diagram arrow labels need a background pill to avoid overlap with components');
    }
    if (!has(/class=["'][^"']*diagram-reveal[^"']*["']/i)) {
      warnings.push('system diagram has no staged diagram node/path reveal motion');
    }
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
    if (isSystemDiagramReport) {
      if (!/<svg\b[^>]*viewBox=["'][^"']+["']/i.test(svg)) {
        errors.push(`system diagram svg ${index + 1} is missing a viewBox`);
      }
      if (!/data-review-id\s*=\s*["'][^"']+["']/i.test(svg)) {
        errors.push(`system diagram svg ${index + 1} needs reviewable node/group anchors`);
      }
      const tinyText = [...svg.matchAll(/font-size\s*=\s*["']?([0-9.]+)(?:px)?["']?/gi)]
        .map((match) => Number(match[1]))
        .filter((size) => Number.isFinite(size) && size < 12);
      if (tinyText.length > 0) {
        errors.push(`system diagram svg ${index + 1} has text smaller than 12px`);
      }
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

  if (has(/class=["'][^"']*on-this-page[^"']*["']/i)) {
    errors.push('right-side on-this-page rail is not allowed; use the collapsible left index instead');
  }

  if (!has(/<footer\b/i)) {
    warnings.push('missing provenance/footer region');
  }

  if (has(/class=["'][^"']*topbar/i)) {
    errors.push('top navigation menu is not allowed; use the collapsible left sidebar instead');
  }

  if (!has(/class=["'][^"']*breadcrumbs/i)) {
    warnings.push('missing breadcrumbs; acceptable for tiny/diagram-only pages');
  }

  if (!has(/class=["'][^"']*feedback-widget/i)) {
    warnings.push('missing feedback widget; acceptable for tiny/diagram-only pages');
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
