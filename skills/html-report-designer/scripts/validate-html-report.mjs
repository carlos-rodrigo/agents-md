#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderCanonicalReport, templateDigest, validateDocumentSpec } from './canonical-report.mjs';

const args = process.argv.slice(2);
const options = new Set(args.filter((arg) => arg.startsWith('--')));
const files = args.filter((arg) => !arg.startsWith('--'));
const allowPlaceholders = options.has('--allow-placeholders');

if (options.has('--help') || files.length === 0) {
  console.log(`Usage: validate-html-report.mjs [--allow-placeholders] <file.html> [...]

Checks the sole canonical report shell, embedded structured DocumentSpec,
shared accessibility/portability invariants, decision recorders, and required
System Diagram provenance. Use --allow-placeholders only for report-template.html.`);
  process.exit(files.length === 0 ? 2 : 0);
}

let failedFiles = 0;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const errors = [];
  const resolvedFile = resolve(file);
  const count = (pattern) => (html.match(pattern) || []).length;
  const has = (pattern) => pattern.test(html);
  const stripHtml = (value) => value
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  if (!/^\s*<!doctype html>/i.test(html)) errors.push('missing <!doctype html>');
  if (!allowPlaceholders && !has(/<html\b[^>]*lang=["'][a-z-]+["'][^>]*>/i)) errors.push('missing <html lang="…">');
  if (!has(/<meta\b[^>]*name=["']viewport["'][^>]*>/i)) errors.push('missing responsive viewport meta tag');
  if (!has(/<title\b[^>]*>[\s\S]*?\S[\s\S]*?<\/title>/i)) errors.push('missing non-empty document <title>');

  const h1Count = count(/<h1\b/gi);
  if (h1Count !== 1) errors.push(`expected exactly one <h1>, found ${h1Count}`);

  if (!has(/<meta\b[^>]*name=["']canonical-report["'][^>]*content=["']canonical-report-v1["'][^>]*>/i)) {
    errors.push('missing canonical-report-v1 metadata; reports must use the sole canonical renderer');
  }
  if (!has(/<html\b[^>]*data-report-template=["']canonical-report-v1["']/i)) errors.push('missing canonical report template marker');
  if (!has(/<style\b[^>]*data-tailwind-build=["']report\.tailwind\.css["']/i)) errors.push('missing canonical managed style block');

  if (!allowPlaceholders) {
    const digest = html.match(/<meta\b[^>]*name=["']canonical-template-digest["'][^>]*content=["']([^"']+)["']/i)?.[1];
    if (!digest) errors.push('missing canonical template digest');
    else if (digest !== templateDigest()) errors.push('canonical template digest is stale; rerender through html-report-designer');

    const embeddedSpecJson = html.match(/<script\b[^>]*type=["']application\/json["'][^>]*data-document-spec=["']canonical-report-v1["'][^>]*>([\s\S]*?)<\/script>/i)?.[1];
    if (!embeddedSpecJson) errors.push('missing embedded canonical-report-v1 DocumentSpec');
    else {
      try {
        const embeddedSpec = validateDocumentSpec(JSON.parse(embeddedSpecJson));
        const htmlKind = html.match(/<html\b[^>]*data-document-kind=["']([^"']+)["']/i)?.[1];
        if (htmlKind !== embeddedSpec.document.kind) errors.push('rendered document kind does not match embedded DocumentSpec');
        const decisions = embeddedSpec.sections.flatMap((section) => section.blocks.filter((block) => block.type === 'decision'));
        const decisionRecorderTags = [...html.matchAll(/<fieldset\b([^>]*class=["'][^"']*\bdecision-recorder\b[^>]*)>/gi)].map((match) => match[1]);
        if (decisionRecorderTags.length !== decisions.length) errors.push('every DocumentSpec decision must render exactly one decision recorder');
        if (decisionRecorderTags.some((attributes) => !/data-decision-source-fingerprint=["'][a-f0-9]{64}["']/i.test(attributes))) errors.push('every decision recorder must carry its exact decision-source fingerprint');
        if (embeddedSpec.document.kind === 'prd' || embeddedSpec.document.kind === 'design') {
          if (!has(/<!--\s*svg-source:system-diagram\s*-->/i)) errors.push(`${embeddedSpec.document.kind} reports require System Diagram SVG provenance`);
          if (!has(/data-diagram-style=["']infrastructure-v1["']/i)) errors.push(`${embeddedSpec.document.kind} reports require the infrastructure-v1 diagram style`);
        }
      } catch (error) {
        errors.push(`invalid embedded DocumentSpec: ${error.message}`);
      }
    }

    const adjacentSpecPath = resolvedFile.replace(/\.html$/i, '.document.json');
    if (adjacentSpecPath !== resolvedFile && existsSync(adjacentSpecPath)) {
      try {
        const adjacentSourceSpec = JSON.parse(readFileSync(adjacentSpecPath, 'utf8'));
        if (renderCanonicalReport(adjacentSourceSpec, { specPath: adjacentSpecPath }) !== html) errors.push('generated HTML does not byte-match its adjacent DocumentSpec; rerender instead of patching HTML');
      } catch (error) {
        errors.push(`cannot verify adjacent DocumentSpec: ${error.message}`);
      }
    }
  } else if (resolvedFile.endsWith('report-template.html') === false) {
    errors.push('--allow-placeholders is only valid for report-template.html');
  }

  if (!has(/<a\b[^>]*class=["'][^"']*\bskip-link\b[^"']*["'][^>]*href=["']#main["'][^>]*>/i)) {
    errors.push('missing skip link targeting #main');
  }
  if (count(/<main\b[^>]*id=["']main["'][^>]*>/gi) !== 1) errors.push('expected exactly one <main id="main">');

  const markupWithoutManagedBodies = html
    .replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, '<script$1></script>')
    .replace(/<style\b([^>]*)>[\s\S]*?<\/style>/gi, '<style$1></style>');
  const startTagAttributes = [...markupWithoutManagedBodies.matchAll(/<[a-z][a-z0-9:-]*\b([^<>]*)>/gi)].map((match) => match[1]);
  const styleContexts = [
    ...[...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]),
    ...startTagAttributes.flatMap((attributes) => [...attributes.matchAll(/\bstyle\s*=\s*["']([^"']*)["']/gi)].map((match) => match[1])),
  ];
  const remoteElementAsset = /<(?:script|img|iframe|audio|video|source|link)\b[^>]+(?:src|href)=["']https?:\/\//i.test(markupWithoutManagedBodies);
  const remoteCssAsset = styleContexts.some((css) => /@import\s+(?:url\()?\s*["']?https?:\/\//i.test(css) || /url\(\s*["']?https?:\/\//i.test(css));
  if (remoteElementAsset || remoteCssAsset) errors.push('uses a remote asset or runtime dependency; durable reports must be self-contained');
  if (/<script\b[^>]*\bsrc=["'][^"']+["']/i.test(markupWithoutManagedBodies)) errors.push('external/local script src is not self-contained; inline optional scripts');
  const scriptTags = [...html.matchAll(/<script\b([^>]*)>/gi)].map((match) => match[1]);
  const managedScript = /data-document-spec=["']canonical-report-v1["']|data-artifact-motion=["']native["']|data-document-navigation=["']progressive["']|data-artifact-review-state=["']persistent["']/i;
  if (scriptTags.some((attributes) => !managedScript.test(attributes))) errors.push('unmanaged inline script; canonical reports allow only the embedded DocumentSpec and shared managed runtimes');
  if (startTagAttributes.some((attributes) => /\son[a-z]+\s*=/i.test(` ${attributes}`))) errors.push('inline event handler attributes are not allowed');
  const unsafeHref = startTagAttributes
    .flatMap((attributes) => [...attributes.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]))
    .find((href) => /^(?:javascript|data|vbscript):/i.test(href.replace(/[\u0000-\u0020\u007f]+/g, '')));
  if (unsafeHref) errors.push(`unsafe href URL scheme: ${unsafeHref}`);
  if (/<link\b[^>]*\brel=["']stylesheet["']/i.test(markupWithoutManagedBodies)) errors.push('external/local stylesheet link is not self-contained; inline compiled CSS');
  const images = [...markupWithoutManagedBodies.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)];
  for (const image of images) {
    if (!/^data:/i.test(image[1])) errors.push(`image source "${image[1]}" is not embedded as a data URI`);
    if (!/\balt=["'][^"']*["']/i.test(image[0])) errors.push('every <img> needs an alt attribute');
  }

  const reviewIds = [...html.matchAll(/data-review-id\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
  if (reviewIds.length === 0) errors.push('no data-review-id anchors found');
  validateUniqueIds(reviewIds, 'data-review-id', /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/, errors);

  const htmlIds = [...html.matchAll(/\sid\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
  validateUniqueIds(htmlIds, 'id', null, errors);

  const main = html.match(/<main\b[^>]*id=["']main["'][^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';
  const mainHeadingLevels = [...main.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
  for (let index = 1; index < mainHeadingLevels.length; index += 1) {
    if (mainHeadingLevels[index] > mainHeadingLevels[index - 1] + 1) {
      errors.push(`main heading order skips from h${mainHeadingLevels[index - 1]} to h${mainHeadingLevels[index]}`);
    }
  }

  const navs = [...html.matchAll(/<nav\b([^>]*)>/gi)];
  for (const nav of navs) {
    if (!/aria-label=["'][^"']+\S[^"']*["']/i.test(nav[1]) && !/aria-labelledby=["'][^"']+["']/i.test(nav[1])) {
      errors.push('every <nav> needs aria-label or aria-labelledby');
    }
  }

  const detailsBlocks = [...html.matchAll(/<details\b([^>]*)>([\s\S]*?)<\/details>/gi)];
  for (const block of detailsBlocks) {
    const summary = block[2].match(/^\s*<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ?? '';
    if (stripHtml(summary).length < 4) errors.push('every <details> needs a meaningful non-empty <summary> as its first child');
  }
  const hasClosedDetails = detailsBlocks.some((block) => !/\bopen(?:\s|=|$)/i.test(block[1]));
  if (hasClosedDetails && !has(/@media\s+print[\s\S]*?details:not\(\[open\]\)\s*>\s*:not\(summary\)\s*\{[^}]*display\s*:\s*block/i)) {
    errors.push('closed <details> content must print expanded with a details:not([open]) rule');
  }

  if (!allowPlaceholders && has(/<(?:article|div|figure|section|main|aside)\b[^>]*\brole=["']img["'][^>]*>/i)) {
    errors.push('rich HTML must not use role="img" wrappers; use semantic figure content and preserve child semantics');
  }

  const figures = [...html.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/gi)];
  for (const [index, figure] of figures.entries()) {
    const attributes = figure[1];
    const body = figure[2];
    if (!/<figcaption\b[^>]*>[\s\S]*?\S[\s\S]*?<\/figcaption>/i.test(body)) {
      errors.push(`figure ${index + 1} needs a non-empty <figcaption>`);
    }
    if (/\bdiagram-figure\b/i.test(attributes)) {
      const expectedDigest = attributes.match(/data-diagram-output-sha256=["']([a-f0-9]{64})["']/i)?.[1];
      const embeddedSvg = body.match(/<svg\b[\s\S]*?<\/svg>/i)?.[0];
      if (!expectedDigest) errors.push(`diagram figure ${index + 1} needs an output digest`);
      else if (!embeddedSvg || createHash('sha256').update(embeddedSvg).digest('hex') !== expectedDigest) errors.push(`diagram figure ${index + 1} output digest does not match its embedded SVG`);
    }
  }

  const complexFigures = [...html.matchAll(/<figure\b([^>]*\bdata-complex-figure\b[^>]*)>([\s\S]*?)<\/figure>/gi)];
  for (const figure of complexFigures) {
    const reviewId = figure[1].match(/data-review-id=["']([^"']+)["']/i)?.[1];
    if (!reviewId) {
      errors.push('complex figures need a stable data-review-id');
      continue;
    }
    if (!/<p\b[^>]*class=["'][^"']*\bfigure-question\b[^"']*["'][^>]*>[\s\S]*?\S[\s\S]*?<\/p>/i.test(figure[2])) {
      errors.push(`complex figure "${reviewId}" needs a visible question or how-to-read prompt`);
    }
    const figureEnd = (figure.index ?? 0) + figure[0].length;
    const adjacent = html.slice(figureEnd).match(/^\s*<ol\b([^>]*)>[\s\S]*?<\/ol>/i);
    const escaped = reviewId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!adjacent || !new RegExp(`data-figure-walkthrough-for=["']${escaped}["']`, 'i').test(adjacent[1])) {
      errors.push(`complex figure "${reviewId}" needs an adjacent structured walkthrough tied with data-figure-walkthrough-for`);
    }
  }

  const svgBlocks = [...html.matchAll(/<svg\b[\s\S]*?<\/svg>/gi)].map((match) => match[0]);
  for (const [index, svg] of svgBlocks.entries()) {
    const informational = /\brole=["']img["']/i.test(svg) || /\baria-labelledby=["'][^"']+["']/i.test(svg);
    if (informational) {
      if (!/<title\b[^>]*>[\s\S]*?\S[\s\S]*?<\/title>/i.test(svg)) errors.push(`informational svg ${index + 1} needs a non-empty <title>`);
      if (!/<desc\b[^>]*>[\s\S]*?\S[\s\S]*?<\/desc>/i.test(svg)) errors.push(`informational svg ${index + 1} needs a non-empty <desc>`);
      if (!/\bviewBox=["'][^"']+["']/i.test(svg)) errors.push(`informational svg ${index + 1} needs a viewBox`);
    }
  }

  const tables = [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)].map((match) => match[0]);
  for (const [index, table] of tables.entries()) {
    if (!/<caption\b[^>]*>[\s\S]*?\S[\s\S]*?<\/caption>/i.test(table)) errors.push(`table ${index + 1} needs a non-empty <caption>`);
    const headers = [...table.matchAll(/<th\b([^>]*)>/gi)];
    for (const header of headers) {
      if (!/\bscope=["'](?:col|row|colgroup|rowgroup)["']/i.test(header[1])) errors.push(`table ${index + 1} headers need valid scope attributes`);
    }
  }

  const hasMotion = has(/data-motion(?:-sections)?=|diagram-reveal|artifact-motion|animation-timeline|IntersectionObserver/i);
  if (hasMotion && !has(/prefers-reduced-motion\s*:\s*reduce/i)) errors.push('motion must include prefers-reduced-motion: reduce handling');
  if (!has(/@media\s+print/i)) errors.push('missing print stylesheet');

  if (errors.length > 0) {
    failedFiles += 1;
    console.error(`✗ ${file}`);
    for (const error of errors) console.error(`  error: ${error}`);
  } else {
    console.log(`✓ ${file}`);
  }
}

if (failedFiles > 0) {
  console.error(`\n${failedFiles} file(s) failed HTML report validation.`);
  process.exit(1);
}

console.log(`\nValidated ${files.length} HTML report file(s).`);

function validateUniqueIds(values, label, format, errors) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) errors.push(`duplicate ${label}="${value}"`);
    seen.add(value);
    if (format && !format.test(value)) errors.push(`${label} "${value}" should use lowercase kebab/dot notation`);
  }
}
