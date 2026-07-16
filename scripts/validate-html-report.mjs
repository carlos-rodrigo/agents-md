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
  const stripHtml = (value) => value
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  const sectionByReviewId = (id) => html.match(
    new RegExp(`<section\\b(?=[^>]*data-review-id=["']${id}["'])[^>]*>[\\s\\S]*?<\\/section>`, 'i'),
  )?.[0] ?? '';
  const rendererDiagramContract = (svg) => ({
    provenance: /<!--\s*svg-source:excalidraw\s*-->/i.test(svg),
    accessible: /<svg\b[^>]*role=["']img["'][^>]*aria-labelledby=["'][^"']+["']/i.test(svg)
      && /<title\b[^>]*>[\s\S]*?<\/title>/i.test(svg)
      && /<desc\b[^>]*>[\s\S]*?<\/desc>/i.test(svg),
    rootReviewId: /<svg\b[^>]*data-review-id=["'][a-z0-9]+(?:[.-][a-z0-9]+)*["']/i.test(svg),
    nodeReveal: /<g\b(?=[^>]*class=["'][^"']*\bdiagram-node\b[^"']*\bdiagram-reveal\b[^"']*["'])(?=[^>]*data-review-id=["'][^"']+["'])[^>]*>/i.test(svg),
    edgeReveal: /<g\b(?=[^>]*class=["'][^"']*\bdiagram-edge\b[^"']*\bdiagram-reveal\b[^"']*["'])(?=[^>]*data-review-id=["'][^"']+["'])[^>]*>/i.test(svg),
    labelledEdge: /<g\b(?=[^>]*class=["'][^"']*\bdiagram-edge-label\b[^"']*\bdiagram-reveal\b[^"']*["'])(?=[^>]*data-review-id=["'][^"']+["'])[^>]*>[\s\S]*?<text\b[^>]*>[\s\S]*?\S[\s\S]*?<\/text>[\s\S]*?<\/g>/i.test(svg),
  });

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

  const scenarioAutoFitContainers = [...html.matchAll(/<[^>]*\bclass=["'][^"']*\bexample-pair\b[^"']*["'][^>]*>/gi)];
  for (const match of scenarioAutoFitContainers) {
    if (!/data-layout-exception=["']visual-diff["']/i.test(match[0])) {
      errors.push('sequential scenarios must use a stacked layout; reserve side-by-side layout for an explicit data-layout-exception="visual-diff"');
    }
  }

  const visualDiffs = [...html.matchAll(/<[^>]*data-layout-exception=["']visual-diff["'][^>]*>/gi)];
  for (const match of visualDiffs) {
    if (!/data-visual-diff-states=["']2["']/i.test(match[0])) {
      errors.push('visual-diff layout exceptions must declare data-visual-diff-states="2" for exactly 2 compact equivalent states');
    }
  }

  const detailsBlocks = [...html.matchAll(/<details\b([^>]*)>([\s\S]*?)<\/details>/gi)];
  for (const block of detailsBlocks) {
    const summary = block[2].match(/^\s*<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ?? '';
    if (stripHtml(summary).replace(/\s+/g, ' ').trim().length < 4) {
      errors.push('every <details> disclosure needs a meaningful non-empty <summary> as its first child');
    }
  }
  const hasClosedDetails = detailsBlocks.some((block) => !/\bopen(?:\s|=|$)/i.test(block[1]));
  if (hasClosedDetails && !has(/@media\s+print[\s\S]*?details:not\(\[open\]\)\s*>\s*:not\(summary\)\s*\{[^}]*display\s*:\s*block/i)) {
    errors.push('closed <details> content must print expanded/readable with a print details:not([open]) rule');
  }

  if (has(/<(?:article|div|figure|section)\b[^>]*\brole=["']img["'][^>]*>/i)) {
    errors.push('rich HTML must not use role="img" wrappers; use semantic <figure>/<figcaption> and preserve child semantics');
  }

  const complexFigures = [...html.matchAll(/<figure\b([^>]*\bdata-complex-figure\b[^>]*)>([\s\S]*?)<\/figure>/gi)];
  for (const figure of complexFigures) {
    const reviewId = figure[1].match(/data-review-id=["']([^"']+)["']/i)?.[1];
    if (!reviewId) {
      errors.push('complex figures need a stable data-review-id for their adjacent walkthrough');
      continue;
    }
    if (!/<p\b[^>]*class=["'][^"']*\bfigure-question\b[^"']*["'][^>]*>[\s\S]*?\S[\s\S]*?<\/p>/i.test(figure[2])) {
      errors.push(`complex figure "${reviewId}" needs its own visible question/how-to-read prompt`);
    }
    if (!/<figcaption\b[^>]*>[\s\S]*?\S[\s\S]*?<\/figcaption>/i.test(figure[2])) {
      errors.push(`complex figure "${reviewId}" needs its own <figcaption>; an unrelated page-level caption does not count`);
    }
    const figureEnd = (figure.index ?? 0) + figure[0].length;
    const nextContent = html.slice(figureEnd);
    const adjacentWalkthrough = nextContent.match(/^\s*<ol\b([^>]*)>[\s\S]*?<\/ol>/i);
    if (!adjacentWalkthrough || !new RegExp(`data-figure-walkthrough-for=["']${reviewId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(adjacentWalkthrough[1])) {
      errors.push(`complex figure "${reviewId}" needs an adjacent structured walkthrough tied with data-figure-walkthrough-for`);
    }
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
      ['domain-interactions', 'domain entity interaction map'],
      ['domain-interactions.interaction-001', 'first domain interaction'],
      ['ui-options.existing-ui-evidence', 'existing UI continuity evidence'],
      ['ui-options.mockup-decision', 'mockup decision gate'],
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

    const semanticSections = [sectionByReviewId('user-flows'), sectionByReviewId('domain-interactions')].join('\n');
    const canonicalSlotPattern = /data-excalidraw-slot=["']semantic-domain-diagram["']/i;
    if (allowPlaceholders) {
      if (!canonicalSlotPattern.test(semanticSections)) {
        errors.push('placeholder PRD template needs the canonical semantic Excalidraw slot data-excalidraw-slot="semantic-domain-diagram"');
      }
    } else {
      const semanticSvgs = [...semanticSections.matchAll(/<svg\b[\s\S]*?<\/svg>/gi)].map((match) => match[0]);
      const contracts = semanticSvgs.map(rendererDiagramContract);
      const isAuthentic = (contract) => Object.values(contract).every(Boolean);
      if (!contracts.some(isAuthentic)) {
        const allSvgs = [...html.matchAll(/<svg\b[\s\S]*?<\/svg>/gi)].map((match) => match[0]);
        const authenticOutsideSemanticSections = allSvgs.some((svg) => isAuthentic(rendererDiagramContract(svg)));
        if (authenticOutsideSemanticSections && semanticSvgs.length === 0) {
          errors.push('finished PRD authentic semantic Excalidraw diagram must be inside the user-flows or domain-interactions section; unrelated page diagrams and wireframes do not count');
        } else {
          errors.push('finished PRD needs an authentic semantic Excalidraw diagram: render a meaningful user-flow or domain-interaction scene and inline its SVG with renderer provenance, stable review IDs, labelled edges, and reveal groups');
        }
        if (contracts.some((contract) => contract.provenance && !contract.accessible)) {
          errors.push('PRD semantic Excalidraw diagrams need an accessible title and description using role="img", aria-labelledby, <title>, and <desc>');
        }
      }
    }

    const uiOptionsSection = sectionByReviewId('ui-options');
    if (!/class=["'][^"']*\bui-option-list\b[^"']*["']/i.test(uiOptionsSection)
      || /class=["'][^"']*\b(?:card-grid|example-pair)\b[^"']*["']/i.test(uiOptionsSection)) {
      errors.push('UI options must use full-width stacked rows; responsive auto-fit option galleries are not allowed');
    }

    const uiOptionInputs = [...html.matchAll(/<input\b[^>]*data-ui-option-ref=["']([^"']+)["'][^>]*>/gi)];
    for (const match of uiOptionInputs) {
      const input = match[0];
      const target = match[1];
      if (!/type=["']radio["']/i.test(input)) {
        errors.push(`UI option reference "${target}" must be attached to a radio input`);
      }
      if (!seenReviewIds.has(target)) {
        errors.push(`UI option selector references missing data-review-id "${target}"`);
      }
      if (!/\bvalue=["'][^"']+["']/i.test(input)) {
        errors.push(`UI option selector for "${target}" needs a stable value`);
      }
    }
  }

  const isDesignReport = /^(design|design-template)\.html$/i.test(basename(file));
  if (isDesignReport) {
    const requiredDesignReviewIds = [
      ['prd-story-inventory', 'PRD story/BDD inventory'],
      ['proposed-architecture', 'architecture proposal'],
      ['proposed-architecture.monorepo', 'monorepo/package architecture proposal'],
      ['technology-stack', 'technology stack proposal'],
      ['architecture-overview', 'high-level architecture overview'],
      ['architecture-overview.figure', 'high-level architecture diagram'],
      ['architecture-overview.svg', 'reviewable high-level architecture SVG'],
      ['architecture-overview.edge-label.route-to-endpoint', 'foreground architecture edge label'],
      ['architecture-delta', 'new/changed component delta'],
      ['slice-plan', 'PRD-derived slice plan'],
      ['data-contracts', 'conceptual data contracts'],
      ['data-contracts.list', 'single-column conceptual data contract list'],
      ['slice-designs.slice-001', 'first per-slice outside-in design'],
      ['slice-designs.slice-001.diagram', 'first per-slice architecture mini diagram'],
      ['slice-designs.slice-001.svg', 'first per-slice reviewable SVG diagram'],
      ['slice-designs.slice-001.node-endpoint', 'first per-slice endpoint node'],
      ['slice-designs.slice-001.node-service', 'first per-slice service node'],
      ['slice-designs.slice-001.node-domain', 'first per-slice domain node'],
      ['slice-designs.slice-001.node-repository', 'first per-slice repository/DB node'],
      ['slice-designs.slice-001.edge-label-api', 'first per-slice foreground edge label'],
      ['domain-model', 'domain model section'],
      ['domain-interactions', 'domain entity interaction section'],
      ['domain-interactions.figure', 'domain entity interaction figure'],
      ['domain-interactions.svg', 'domain entity interaction diagram slot'],
      ['domain-interactions.interaction-001', 'first domain entity interaction'],
      ['slice-designs.slice-001.delivery-surface', 'first per-slice route/endpoint details'],
      ['slice-designs.slice-001.service-domain', 'first per-slice service/domain details'],
      ['slice-designs.slice-001.persistence-model', 'first per-slice repository/DB details'],
      ['story-coverage', 'story/spec coverage matrix'],
      ['tasks-and-feedback', 'task feedback hooks'],
    ];
    for (const [id, label] of requiredDesignReviewIds) {
      if (!seenReviewIds.has(id)) {
        errors.push(`design report missing ${label} data-review-id "${id}"`);
      }
    }
    if (!has(/<style\b[^>]*data-tailwind-build=["']design\.tailwind\.css["']/i)) {
      errors.push('design report must inline CSS compiled from design.tailwind.css');
    }
    if (!has(/class=["'][^"']*diagram-edge-label[^"']*["']/i)) {
      errors.push('design report diagrams need foreground diagram-edge-label groups');
    }
    if (!has(/class=["'][^"']*diagram-label-bg[^"']*["']/i)) {
      errors.push('design report diagrams need foreground label background pills');
    }
    if (!has(/class=["'][^"']*diagram-node[^"']*["']/i)) {
      errors.push('design report diagrams need reusable diagram-node primitives');
    }

    const domainInteractionsSection = sectionByReviewId('domain-interactions');
    const designDiagramSlot = /data-excalidraw-slot=["']design-domain-diagram["']/i;
    if (allowPlaceholders) {
      if (!designDiagramSlot.test(domainInteractionsSection)) {
        errors.push('placeholder design template needs data-excalidraw-slot="design-domain-diagram" for its renderer-backed domain map');
      }
    } else {
      const domainSvgs = [...domainInteractionsSection.matchAll(/<svg\b[\s\S]*?<\/svg>/gi)].map((match) => match[0]);
      const hasAuthenticDomainDiagram = domainSvgs.some((svg) => Object.values(rendererDiagramContract(svg)).every(Boolean));
      if (!hasAuthenticDomainDiagram) {
        errors.push('finished design needs a renderer-backed domain building-block diagram with provenance, accessible text, stable review IDs, labelled verb edges, and reveal groups');
      }
    }

    const dataContractsSection = html.match(/<section\b[^>]*id=["']data-contracts["'][\s\S]*?<\/section>/i)?.[0] ?? '';
    if (dataContractsSection) {
      if (!/class=["'][^"']*contract-list[^"']*["']/i.test(dataContractsSection)) {
        errors.push('conceptual data contracts must use the single-column contract-list layout');
      }
      if (/class=["'][^"']*card-grid[^"']*["']/i.test(dataContractsSection)) {
        errors.push('conceptual data contracts must not use card-grid; code-like blocks should be stacked in a list');
      }
      const contractArticles = [...dataContractsSection.matchAll(/<article\b[\s\S]*?<\/article>/gi)].map((match) => match[0]);
      for (const [index, article] of contractArticles.entries()) {
        if (!/<h3\b[\s\S]*?<\/h3>\s*<pre\b/i.test(article)) {
          errors.push(`conceptual data contract ${index + 1} should use two rows: entity name in <h3>, then one full-width code block`);
        }
        if (!/<pre\b[^>]*class=["'][^"']*schema-code[^"']*["'][^>]*>/i.test(article)) {
          errors.push(`conceptual data contract ${index + 1} should use the colored schema-code block style`);
        }
        if (!/class=["'][^"']*code-key[^"']*["']/i.test(article)) {
          errors.push(`conceptual data contract ${index + 1} should color property names with code-key spans`);
        }
      }
      const contractCodeBlocks = [...dataContractsSection.matchAll(/<pre\b[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi)].map((match) => match[1]);
      for (const [blockIndex, code] of contractCodeBlocks.entries()) {
        const plainCode = stripHtml(code);
        for (const rawLine of plainCode.split(/\r?\n/)) {
          const line = rawLine.trim();
          if (!line || /^[{}\[\]]$/.test(line)) continue;
          const commaCount = (line.match(/,/g) || []).length;
          if (commaCount > 1 || (commaCount === 1 && !/,\s*$/.test(line))) {
            errors.push(`conceptual data contract ${blockIndex + 1} groups multiple properties on one line: "${line.slice(0, 80)}"`);
          }
        }
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
  if (isPrdReport && tableCount > 1) {
    warnings.push(`PRD report has ${tableCount} tables; prefer concise bullets/cards and reserve tables for rare traceability matrices`);
  }
  if (isDesignReport && tableCount > 2) {
    warnings.push(`design report has ${tableCount} tables; prefer cards/lists and reserve tables for true traceability matrices`);
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
