import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPORT_VERSION = 'canonical-report-v1';
export const REPORT_SCHEMA_ID = 'https://carlosrodrigo.dev/schemas/canonical-report-v1.schema.json';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = resolve(skillRoot, 'resources/report-template.html');
const diagramRendererPath = resolve(skillRoot, '../system-diagram/scripts/render-system-diagram.mjs');
const sequenceDiagramRendererPath = resolve(skillRoot, '../system-diagram/scripts/render-sequence-diagram.mjs');
const exactDiagramChecks = new Set();
const idPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const statuses = new Set(['Draft', 'Review', 'Approved', 'Blocked']);
const kinds = new Set(['prd', 'design', 'report', 'diagram', 'research', 'decision']);
const decisionStatuses = new Set(['open', 'proposed', 'accepted']);
const blockTypes = new Set(['paragraph', 'list', 'facts', 'steps', 'callout', 'scenario', 'slice', 'approval', 'architecture-approval', 'requirement', 'architecture', 'decision', 'diagram', 'code', 'quote']);
const requiredRoles = {
  prd: ['product', 'problem', 'behavior', 'diagram', 'slices', 'requirements', 'scope'],
  design: ['authority', 'pressure', 'seam', 'shape', 'path', 'slices', 'traceability', 'diagram', 'decisions', 'proof', 'boundary'],
  diagram: ['diagram'],
};
const specialBlockRoles = { approval: 'product', 'architecture-approval': 'authority', diagram: 'diagram', slice: 'slices', requirement: 'requirements', architecture: 'traceability', decision: 'decisions' };

export function templateDigest(template = readFileSync(templatePath, 'utf8')) {
  return createHash('sha256').update(template).digest('hex');
}

export function validateDocumentSpec(input) {
  const errors = [];
  if (!isObject(input)) throw new Error('DocumentSpec must be an object');
  requireOnly(input, ['schemaVersion', 'document', 'sections'], 'DocumentSpec', errors);
  if (input.schemaVersion !== REPORT_VERSION) errors.push(`schemaVersion must equal "${REPORT_VERSION}"`);
  const document = input.document;
  if (!isObject(document)) errors.push('document must be an object');
  if (!Array.isArray(input.sections) || input.sections.length === 0) errors.push('sections must be a non-empty array');
  if (errors.length) throwInvalid(errors);

  requireOnly(document, ['id', 'kind', 'lang', 'status', 'title', 'summary', 'reviewFocus', 'updated', 'sources', 'approval', 'feature', 'docsHome', 'featureHome', 'relatedArtifacts'], 'document', errors);
  requireId(document.id, 'document.id', errors);
  requireEnum(document.kind, kinds, 'document.kind', errors);
  requireEnum(document.status, statuses, 'document.status', errors);
  requireText(document.title, 'document.title', errors);
  requireText(document.summary, 'document.summary', errors);
  if (document.reviewFocus !== undefined) requireText(document.reviewFocus, 'document.reviewFocus', errors);
  if (!isIsoDate(document.updated)) errors.push('document.updated must be a real ISO date (YYYY-MM-DD)');
  if (document.lang !== undefined && !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(document.lang)) errors.push('document.lang must be a BCP 47 language tag');
  requireTextArray(document.sources, 'document.sources', errors);
  if (document.approval !== undefined) validateApproval(document.approval, 'document.approval', errors);
  if (document.status === 'Approved' && !isObject(document.approval)) errors.push('Approved documents require document.approval with explicit human approver and date');
  if (document.status !== 'Approved' && document.approval !== undefined) errors.push('Only Approved documents may contain document.approval metadata');
  if (document.feature !== undefined) requireText(document.feature, 'document.feature', errors);
  if (document.docsHome !== undefined) { requireText(document.docsHome, 'document.docsHome', errors); requireSafeHref(document.docsHome, 'document.docsHome', errors); }
  if (document.featureHome !== undefined) { requireText(document.featureHome, 'document.featureHome', errors); requireSafeHref(document.featureHome, 'document.featureHome', errors); }
  if (document.relatedArtifacts !== undefined) validateLinks(document.relatedArtifacts, 'document.relatedArtifacts', errors);

  const ids = new Set([
    'summary', 'summary.breadcrumbs', 'chrome.side-nav', 'chrome.index', 'review-decisions.export', 'provenance',
    ...(document.reviewFocus ? ['review.focus'] : []),
    ...(document.approval ? ['approval'] : []),
  ]);
  const roles = [];
  let diagramCount = 0;
  let sliceCount = 0;
  let decisionCount = 0;
  let requirementCount = 0;
  let architectureApprovalCount = 0;
  const decisions = [];
  const architectureTraces = [];
  const roleBlockCounts = new Map();
  const enforcesSpecialPlacement = ['prd', 'design', 'diagram'].includes(document.kind);

  for (const [sectionIndex, section] of input.sections.entries()) {
    const label = `sections[${sectionIndex}]`;
    if (!isObject(section)) { errors.push(`${label} must be an object`); continue; }
    requireOnly(section, ['id', 'role', 'kicker', 'title', 'summary', 'blocks'], label, errors);
    requireUniqueId(section.id, `${label}.id`, ids, errors);
    requireId(section.role, `${label}.role`, errors);
    roles.push(section.role);
    if (section.kicker !== undefined) requireText(section.kicker, `${label}.kicker`, errors);
    requireText(section.title, `${label}.title`, errors);
    if (section.summary !== undefined) requireText(section.summary, `${label}.summary`, errors);
    if (!Array.isArray(section.blocks) || section.blocks.length === 0) { errors.push(`${label}.blocks must be a non-empty array`); continue; }
    for (const [blockIndex, block] of section.blocks.entries()) {
      const blockLabel = `${label}.blocks[${blockIndex}]`;
      if (!isObject(block)) { errors.push(`${blockLabel} must be an object`); continue; }
      if (!blockTypes.has(block.type)) { errors.push(`${blockLabel}.type is unsupported`); continue; }
      if (block.id !== undefined) requireUniqueId(block.id, `${blockLabel}.id`, ids, errors);
      roleBlockCounts.set(`${section.role}:${block.type}`, (roleBlockCounts.get(`${section.role}:${block.type}`) ?? 0) + 1);
      const owningRole = specialBlockRoles[block.type];
      if (enforcesSpecialPlacement && owningRole && section.role !== owningRole) errors.push(`${blockLabel} ${block.type} blocks must be inside the "${owningRole}" section role`);
      switch (block.type) {
        case 'approval': validateApprovalBrief(block, blockLabel, errors); break;
        case 'architecture-approval': architectureApprovalCount += 1; validateArchitectureApprovalBrief(block, blockLabel, errors); break;
        case 'paragraph': validateParagraph(block, blockLabel, errors); break;
        case 'list': validateList(block, blockLabel, errors); break;
        case 'facts': validateFacts(block, blockLabel, errors); break;
        case 'steps': validateSteps(block, blockLabel, ids, errors); break;
        case 'callout': validateCallout(block, blockLabel, errors); break;
        case 'scenario': validateScenario(block, blockLabel, errors); break;
        case 'slice': sliceCount += 1; validateSlice(block, blockLabel, ids, document.kind, errors); break;
        case 'requirement': requirementCount += 1; validateRequirement(block, blockLabel, ids, errors); break;
        case 'architecture': validateArchitectureTrace(block, blockLabel, ids, errors); architectureTraces.push({ block, label: blockLabel }); break;
        case 'decision': decisionCount += 1; decisions.push(block); validateDecision(block, blockLabel, document.kind, errors); break;
        case 'diagram': diagramCount += 1; validateDiagram(block, blockLabel, errors); break;
        case 'code': validateCode(block, blockLabel, errors); break;
        case 'quote': validateQuote(block, blockLabel, errors); break;
      }
    }
  }

  const traceableIds = new Set();
  const sliceIds = new Set();
  for (const section of input.sections) {
    for (const block of section.blocks ?? []) {
      if (block.id) traceableIds.add(block.id);
      if (block.type === 'slice') {
        sliceIds.add(block.id);
        if (block.story?.id) traceableIds.add(block.story.id);
        for (const scenario of block.scenarios ?? []) if (scenario.id) traceableIds.add(scenario.id);
        for (const step of block.steps ?? []) if (step.id) traceableIds.add(step.id);
        for (const acceptance of block.acceptance ?? []) if (acceptance.id) traceableIds.add(acceptance.id);
      }
    }
  }
  for (const { block, label } of architectureTraces) {
    for (const reference of block.requirementRefs ?? []) {
      if (!traceableIds.has(reference)) errors.push(`${label}.requirementRefs contains nonexistent requirement or contract reference "${reference}"`);
    }
    for (const reference of block.sliceRefs ?? []) {
      if (!sliceIds.has(reference)) errors.push(`${label}.sliceRefs contains nonexistent architecture slice reference "${reference}"`);
    }
  }
  if (new Set(roles).size !== roles.length) errors.push('section.role values must be unique');
  const profileRoles = requiredRoles[document.kind] ?? [];
  for (const role of profileRoles) {
    if (!roles.includes(role)) errors.push(`${document.kind} documents require a "${role}" section role`);
  }
  const orderedRoles = document.kind === 'prd' ? [...profileRoles, 'decisions'] : profileRoles;
  const presentOrderedRoles = orderedRoles.filter((role) => roles.includes(role));
  const rolePositions = presentOrderedRoles.map((role) => roles.indexOf(role));
  if (rolePositions.some((position, index) => index > 0 && position < rolePositions[index - 1])) {
    errors.push(`${document.kind} section roles must follow this order: ${orderedRoles.join(' → ')}`);
  }
  for (const [role, blockType] of Object.entries({ diagram: 'diagram', slices: 'slice', requirements: 'requirement', decisions: 'decision' })) {
    if (roles.includes(role) && (roleBlockCounts.get(`${role}:${blockType}`) ?? 0) === 0) errors.push(`the "${role}" section role requires at least one ${blockType} block`);
  }
  if (['prd', 'design', 'diagram'].includes(document.kind) && diagramCount !== 1) errors.push(`${document.kind} documents require exactly one System Diagram block`);
  if (document.kind === 'prd' && (roleBlockCounts.get('product:approval') ?? 0) !== 1) errors.push('prd documents require exactly one approval brief block in the product section');
  if (document.kind === 'design' && architectureApprovalCount !== 1) errors.push('design documents require exactly one architecture approval brief block in the authority section');
  if (document.kind === 'prd' && sliceCount === 0) errors.push('prd documents require at least one complete slice block');
  if (document.kind === 'prd' && requirementCount === 0) errors.push('prd documents require at least one structured requirement walkthrough block');
  if (document.kind === 'design' && decisionCount === 0) errors.push('design documents require at least one architecture decision block');
  if (document.kind === 'design' && sliceCount === 0) errors.push('design documents require at least one technical architecture slice block');
  if (document.kind === 'design') {
    const shapeBlocks = input.sections.find((section) => section.role === 'shape')?.blocks ?? [];
    if (!shapeBlocks.some((block) => block.type === 'code')) errors.push('design documents require a shape code block defining the proposed end-state contract or algorithm');
  }
  if (document.status === 'Approved' && decisions.some((decision) => decision.status !== 'accepted')) errors.push('Approved documents cannot contain open or proposed decisions');
  if (errors.length) throwInvalid(errors);
  return JSON.parse(JSON.stringify(input));
}

export function renderCanonicalReport(input, { specPath } = {}) {
  const spec = validateDocumentSpec(input);
  const baseDir = specPath ? dirname(resolve(specPath)) : process.cwd();
  const template = readFileSync(templatePath, 'utf8');
  const sections = spec.sections.map((section) => renderSection(section, baseDir)).join('\n');
  const replacements = {
    REPORT_LANG: escapeAttribute(spec.document.lang ?? 'en'),
    REPORT_KIND: escapeAttribute(spec.document.kind),
    REPORT_DESCRIPTION: escapeAttribute(spec.document.summary),
    REPORT_TITLE: escapeHtml(spec.document.title),
    REPORT_NAV_TITLE: escapeHtml(kindLabel(spec.document.kind)),
    REPORT_TOC: renderToc(spec.sections),
    REPORT_ARTIFACT_LINKS: renderArtifactLinks(spec.document.relatedArtifacts ?? []),
    REPORT_BREADCRUMBS: renderBreadcrumbs(spec.document),
    STATUS_CLASS: escapeAttribute(spec.document.status.toLowerCase()),
    REPORT_STATUS: escapeHtml(spec.document.status),
    REPORT_KIND_LABEL: escapeHtml(kindLabel(spec.document.kind)),
    REPORT_UPDATED: escapeHtml(spec.document.updated),
    REPORT_SUMMARY: escapeHtml(spec.document.summary),
    REPORT_HEADER_SUPPORT: renderHeaderSupport(spec.document),
    COMPOSED_REPORT_CONTENT: sections,
    REPORT_PROVENANCE: renderProvenance(spec.document),
    EMBEDDED_DOCUMENT_SPEC: JSON.stringify(spec, null, 2).replace(/</g, '\\u003c').replace(/<\/script/gi, '<\\/script'),
    REPORT_TEMPLATE_DIGEST: escapeAttribute(templateDigest(template)),
  };
  const templateSlots = [...template.matchAll(/\{\{([A-Z_]+)\}\}/g)];
  const unresolved = templateSlots.filter(([, name]) => !Object.hasOwn(replacements, name)).map(([slot]) => slot);
  if (unresolved.length > 0) throw new Error(`Canonical template has unresolved slots: ${[...new Set(unresolved)].join(', ')}`);
  const html = template.replace(/\{\{([A-Z_]+)\}\}/g, (slot, name) => replacements[name] ?? slot);
  return `${html.trim().split('\n').map((line) => line.trimEnd()).join('\n')}\n`;
}

function renderToc(sections) {
  return `<ol>\n${sections.map((section) => `            <li><a href="#${escapeAttribute(section.id)}">${escapeHtml(section.title)}</a></li>`).join('\n')}\n          </ol>`;
}

function renderArtifactLinks(links) {
  if (links.length === 0) return '';
  return `<div class="nav-group"><h2>Related artifacts</h2><ul>${links.map((link) => `<li><a href="${escapeAttribute(link.href)}">${escapeHtml(link.label)}</a></li>`).join('')}</ul></div>`;
}

function renderBreadcrumbs(document) {
  const docsHome = document.docsHome ?? '../../';
  const featureHome = document.featureHome ?? './';
  const feature = document.feature ?? document.id;
  return `<ol><li><a href="${escapeAttribute(docsHome)}">Docs</a></li><li><a href="${escapeAttribute(featureHome)}">${escapeHtml(feature)}</a></li><li aria-current="page">${escapeHtml(kindLabel(document.kind))}</li></ol>`;
}

function renderHeaderSupport(document) {
  const parts = [];
  if (document.reviewFocus) parts.push(`<aside class="callout warning" data-review-id="review.focus"><strong>Review first</strong><p>${escapeHtml(document.reviewFocus)}</p></aside>`);
  if (document.approval) parts.push(`<aside class="callout success" data-review-id="approval"><strong>Explicit human approval</strong><p>Approved by ${escapeHtml(document.approval.approvedBy)} on ${escapeHtml(document.approval.approvedAt)}.</p></aside>`);
  return parts.join('\n');
}

function renderProvenance(document) {
  return `<p><strong>Sources reviewed:</strong> ${document.sources.map(escapeHtml).join(' · ')}</p><p>Generated from validated <code>${REPORT_VERSION}</code> structured content through the sole canonical report template. Preserve stable review IDs and reconcile exported decisions into canonical source only after explicit human approval.</p>`;
}

function renderSection(section, baseDir) {
  return `<section class="section-card reveal" id="${escapeAttribute(section.id)}" aria-labelledby="${escapeAttribute(section.id)}-title" data-review-id="${escapeAttribute(section.id)}">\n${section.kicker ? `          <span class="section-kicker">${escapeHtml(section.kicker)}</span>\n` : ''}          <h2 id="${escapeAttribute(section.id)}-title">${escapeHtml(section.title)}</h2>\n${section.summary ? `          <p class="section-summary">${escapeHtml(section.summary)}</p>\n` : ''}${section.blocks.map((block) => renderBlock(block, baseDir)).join('\n')}\n        </section>`;
}

function renderBlock(block, baseDir) {
  const reviewIdAttribute = block.id ? ` data-review-id="${escapeAttribute(block.id)}"` : '';
  switch (block.type) {
    case 'approval': return renderApprovalBrief(block, reviewIdAttribute);
    case 'architecture-approval': return renderArchitectureApprovalBrief(block, reviewIdAttribute);
    case 'paragraph': return `          <p class="document-block"${reviewIdAttribute}>${escapeHtml(block.text)}</p>`;
    case 'list': {
      const tag = block.style === 'numbered' ? 'ol' : 'ul';
      return `          <${tag} class="canonical-list canonical-list--${escapeAttribute(block.style ?? 'bullets')}"${reviewIdAttribute}>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
    }
    case 'facts': return `          <dl class="facts"${reviewIdAttribute}>${block.items.map(([term, detail]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(detail)}</dd></div>`).join('')}</dl>`;
    case 'steps': return `          <ol class="step-list"${reviewIdAttribute}>${block.items.map((item) => `<li data-review-id="${escapeAttribute(item.id)}"><strong>${escapeHtml(item.title)}</strong><br />${escapeHtml(item.text)}</li>`).join('')}</ol>`;
    case 'callout': return `          <aside class="callout ${escapeAttribute(block.tone ?? '')}"${reviewIdAttribute}><strong>${escapeHtml(block.title)}</strong><p>${escapeHtml(block.text)}</p></aside>`;
    case 'scenario': return renderScenario(block, reviewIdAttribute);
    case 'slice': return renderSlice(block);
    case 'requirement': return renderRequirement(block, reviewIdAttribute);
    case 'architecture': return renderArchitectureTrace(block, reviewIdAttribute);
    case 'decision': return renderDecision(block);
    case 'diagram': return renderDiagram(block, baseDir);
    case 'code': return `          <figure class="copyable-code"${reviewIdAttribute}><figcaption>${escapeHtml(block.label)}</figcaption><pre><code>${escapeHtml(block.content)}</code></pre></figure>`;
    case 'quote': return `          <blockquote${reviewIdAttribute}><p>${escapeHtml(block.text)}</p>${block.cite ? `<cite>${escapeHtml(block.cite)}</cite>` : ''}</blockquote>`;
    default: throw new Error(`Unsupported block ${block.type}`);
  }
}

function renderApprovalBrief(brief, reviewIdAttribute = '') {
  return `          <section class="approval-brief"${reviewIdAttribute} aria-label="Approval brief"><h3>Approval brief</h3><dl class="facts"><div><dt>Product</dt><dd>${escapeHtml(brief.product)}</dd></div><div><dt>Why</dt><dd>${escapeHtml(brief.why)}</dd></div><div><dt>How it works</dt><dd>${escapeHtml(brief.how)}</dd></div><div><dt>Approve</dt><dd>${escapeHtml(brief.approve)}</dd></div><div><dt>Not building</dt><dd>${escapeHtml(brief.notBuilding)}</dd></div></dl></section>`;
}

function renderArchitectureApprovalBrief(brief, reviewIdAttribute = '') {
  return `          <section class="architecture-approval-brief"${reviewIdAttribute} aria-label="Architecture approval brief"><h3>Architecture approval brief</h3><dl class="facts"><div><dt>Decision</dt><dd>${escapeHtml(brief.decision)}</dd></div><div><dt>Recommendation</dt><dd>${escapeHtml(brief.recommendation)}</dd></div><div><dt>Goal/outcome</dt><dd>${escapeHtml(brief.goal)}</dd></div><div><dt>Proposed shape</dt><dd>${escapeHtml(brief.shape)}</dd></div><div><dt>Why this shape</dt><dd>${escapeHtml(brief.why)}</dd></div><div><dt>Approve</dt><dd>${escapeHtml(brief.approve)}</dd></div><div><dt>Not building</dt><dd>${escapeHtml(brief.notBuilding)}</dd></div><div><dt>Risks/blockers</dt><dd>${escapeHtml(brief.risks)}</dd></div><div><dt>Readiness</dt><dd>${escapeHtml(brief.readiness)}</dd></div></dl></section>`;
}

function renderRequirement(requirement, reviewIdAttribute = '') {
  const list = (items) => items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p>None recorded</p>';
  const state = `${requirement.status}${requirement.collision === 'conflict' ? ' · conflict' : ''}`;
  return `          <article class="requirement-panel ${requirement.status === 'blocked' ? 'requirement-panel--blocked' : ''}"${reviewIdAttribute}>
            <h3>${escapeHtml(requirement.id)} · ${escapeHtml(requirement.title)}</h3>
            <p class="requirement-summary"><strong>${escapeHtml(state)}</strong> · ${escapeHtml(requirement.proof)}</p>
            <details><summary>Traceability</summary><dl class="facts"><div><dt>Authority</dt><dd>${escapeHtml(requirement.sourceType)} — ${escapeHtml(requirement.source)}</dd></div><div><dt>BDD coverage</dt><dd>${list(requirement.bddRefs)}</dd></div><div><dt>Product path</dt><dd>${escapeHtml(requirement.path)}</dd></div><div><dt>Dependencies</dt><dd>${list(requirement.dependencies)}</dd></div><div><dt>Interactions</dt><dd>${list(requirement.interactions)}</dd></div><div><dt>Collision check</dt><dd>${escapeHtml(requirement.collision)} — ${escapeHtml(requirement.resolution)}</dd></div></dl></details>
          </article>`;
}

function renderArchitectureTrace(trace, reviewIdAttribute = '') {
  const list = (items) => items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p>None recorded</p>';
  return `          <article class="architecture-trace ${trace.fit !== 'fits' ? 'architecture-trace--unresolved' : ''}"${reviewIdAttribute}>
            <h3>${escapeHtml(trace.id)} · ${escapeHtml(trace.title)}</h3>
            <dl class="facts"><div><dt>Authority</dt><dd>${escapeHtml(trace.sourceType)} — ${escapeHtml(trace.source)}</dd></div><div><dt>Requirements</dt><dd>${list(trace.requirementRefs)}</dd></div><div><dt>Architecture slices</dt><dd>${list(trace.sliceRefs)}</dd></div><div><dt>Entry/trigger</dt><dd>${escapeHtml(trace.entryPoint)}</dd></div><div><dt>Participating elements</dt><dd>${list(trace.participatingElements)}</dd></div><div><dt>Contract/state consequence</dt><dd>${escapeHtml(trace.contractState)}</dd></div><div><dt>Persistence/external effect</dt><dd>${escapeHtml(trace.effect)}</dd></div><div><dt>Failure/recovery</dt><dd>${escapeHtml(trace.failureRecovery)}</dd></div><div><dt>Fit</dt><dd>${escapeHtml(trace.fit)}${trace.escalation ? ` — ${escapeHtml(trace.escalation)}` : ''}</dd></div><div><dt>Proof</dt><dd>${escapeHtml(trace.proof)}</dd></div></dl>
          </article>`;
}

function renderScenario(scenario, reviewIdAttribute = '') {
  return `          <article class="scenario-panel"${reviewIdAttribute}>
            <h3>Scenario: ${escapeHtml(scenario.title)}</h3>
            <p class="scenario-line"><strong>Given</strong><span>${escapeHtml(scenario.given)}</span></p>
            <p class="scenario-line"><strong>When</strong><span>${escapeHtml(scenario.when)}</span></p>
            <p class="scenario-line"><strong>Then</strong><span>${escapeHtml(scenario.then)}</span></p>
          </article>`;
}

function renderSlice(slice) {
  const storyText = `${slice.story.id} · Feature: ${slice.story.actor} can ${slice.story.capability}; outcome: ${slice.story.outcome}.`;
  const scenarioMarkup = slice.scenarios
    .map((scenario) => renderScenario(scenario, ` data-review-id="${escapeAttribute(scenario.id)}"`))
    .join('\n');
  const workflowLabel = slice.mode === 'visual' ? 'Product-visible workflow' : 'System workflow';
  const workflowSequence = slice.steps.map((step) => `<span>${escapeHtml(step.title)}</span>`).join('<span class="workflow-arrow" aria-hidden="true">→</span>');
  const workflowAccessibleName = `${workflowLabel}: ${slice.steps.map((step) => step.title).join(' then ')}`;
  const storyboardMarkup = slice.steps.map((step, index) => `            <li class="storyboard-step" data-review-id="${escapeAttribute(step.id)}">
              <div class="workflow-step-heading"><span class="workflow-step-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><h4>${escapeHtml(step.title)}</h4></div>
              <dl><div class="workflow-detail workflow-detail--input"><dt>Input</dt><dd>${escapeHtml(step.context)}</dd></div><div class="workflow-detail workflow-detail--action"><dt>Action</dt><dd>${escapeHtml(step.action)}</dd></div><div class="workflow-detail workflow-detail--handoff"><dt>Handoff</dt><dd>${escapeHtml(step.response)}</dd></div><div class="workflow-detail workflow-detail--result"><dt>Result</dt><dd>${escapeHtml(step.outcome)}</dd></div></dl>
            </li>`).join('\n');
  const acceptanceMarkup = slice.acceptance.map((item) => `            <li data-review-id="${escapeAttribute(item.id)}"><span class="id-chip">${escapeHtml(item.id.toUpperCase())}</span><span>${escapeHtml(item.text)}</span></li>`).join('\n');

  return `          <article class="slice-card" data-review-id="${escapeAttribute(slice.id)}">
            <header><h3><span class="id-chip">${escapeHtml(slice.id)}</span>${escapeHtml(slice.title)}</h3><p>${escapeHtml(slice.outcome)}</p><p><strong>Boundary:</strong> ${escapeHtml(slice.boundary)}</p></header>
            <p class="slice-story" data-review-id="${escapeAttribute(slice.story.id)}">${escapeHtml(storyText)}</p>
${slice.entryPoint ? `<dl class="facts slice-technical-facts"><div><dt>Entry point</dt><dd>${escapeHtml(slice.entryPoint)}</dd></div><div><dt>Participating elements</dt><dd>${escapeHtml(slice.participatingElements.join(' · '))}</dd></div><div><dt>Contract/state delta</dt><dd>${escapeHtml(slice.contractDelta.join(' · '))}</dd></div><div><dt>Failure and recovery</dt><dd>${escapeHtml(slice.failureRecovery.join(' · '))}</dd></div></dl>` : ''}
${scenarioMarkup}
            <div class="workflow-block">
              <div class="workflow-overview">
                <span class="workflow-label">${workflowLabel}</span>
                <p class="workflow-sequence" aria-hidden="true">${workflowSequence}</p>
              </div>
              <ol class="storyboard" aria-label="${escapeAttribute(workflowAccessibleName)}" style="--workflow-step-count: ${slice.steps.length}">
${storyboardMarkup}
              </ol>
            </div>
            <ul class="acceptance-list" aria-label="Acceptance criteria">
${acceptanceMarkup}
            </ul>
            ${slice.proof ? `<aside class="callout tip"><strong>Proof and dependencies</strong><p>${escapeHtml(slice.proof.join(' · '))}${slice.dependsOn?.length ? ` Depends on: ${escapeHtml(slice.dependsOn.join(' · '))}.` : ''}</p></aside>` : ''}
            <aside class="callout success" data-review-id="${escapeAttribute(`${slice.id}.after`)}"><strong>After this slice</strong><p>${escapeHtml(slice.after)}</p></aside>
          </article>`;
}

function renderDecision(decision) {
  const isAccepted = decision.status === 'accepted';
  const selectedOptionId = decision.selectedOptionId ?? '';
  const disabledAttribute = isAccepted ? ' disabled' : '';
  const recordedAttribute = isAccepted ? ' checked disabled' : ' disabled';
  const fallbackStatus = isAccepted
    ? `Accepted by ${escapeHtml(decision.approvedBy)} on ${escapeHtml(decision.approvedAt)}.`
    : 'Review input is not recorded. JavaScript must validate completeness before browser recording is available.';
  const optionMarkup = decision.options.map((option) => `              <label class="decision-option"><input type="radio" name="${escapeAttribute(decision.id)}-option" value="${escapeAttribute(option.id)}"${selectedOptionId === option.id ? ' checked' : ''}${disabledAttribute} /><span>${escapeHtml(option.label)}</span></label>`).join('\n');
  const isCustomSelected = selectedOptionId === 'other';
  const decisionSourceFingerprint = createHash('sha256').update(JSON.stringify(decision)).digest('hex');
  const authorityAttributes = `${decision.approvedBy ? ` data-approved-by="${escapeAttribute(decision.approvedBy)}"` : ''}${decision.approvedAt ? ` data-approved-at="${escapeAttribute(decision.approvedAt)}"` : ''}`;
  const customAnswerMarkup = !isAccepted || isCustomSelected
    ? `            <label class="decision-custom"><span>Custom answer</span><input type="text" data-decision-custom value="${escapeAttribute(decision.customAnswer ?? '')}"${disabledAttribute} /></label>\n`
    : '';

  return `          <fieldset class="decision-recorder" data-review-id="${escapeAttribute(decision.id)}" data-review-decision="recorded-decision" data-decision-status="${escapeAttribute(decision.status)}" data-decision-source-fingerprint="${decisionSourceFingerprint}"${authorityAttributes}>
            <legend>${escapeHtml(decision.question)}</legend>
            <div class="decision-meta"><span class="status-chip">${escapeHtml(decision.status)}</span><span>Owner: ${escapeHtml(decision.owner)}</span><span>${decision.blocking ? 'Blocking' : 'Non-blocking'}</span></div>
            ${decision.decisionDrivers ? `<p class="decision-meta"><strong>Drivers:</strong> ${escapeHtml(decision.decisionDrivers.join(' · '))}</p>` : ''}
            <div class="decision-options">
${optionMarkup}
              <label class="decision-option"><input type="radio" name="${escapeAttribute(decision.id)}-option" value="other"${isCustomSelected ? ' checked' : ''}${disabledAttribute} /><span>Other / custom answer</span></label>
            </div>
${customAnswerMarkup}            <label class="decision-field"><span>Rationale</span><textarea rows="3" data-decision-rationale${disabledAttribute}>${escapeHtml(decision.rationale ?? '')}</textarea></label>
            <label class="decision-field"><span>Decision owner</span><input type="text" data-decision-owner value="${escapeAttribute(decision.owner)}"${disabledAttribute} /></label>
            <label class="decision-record-check"><input type="checkbox" data-decision-recorded${recordedAttribute} /><span>Decision recorded</span></label>
            ${decision.consequences ? `<p class="decision-meta"><strong>Consequences:</strong> ${escapeHtml(decision.consequences.join(' · '))}</p>` : ''}
            ${decision.revisitTrigger ? `<p class="decision-meta"><strong>Revisit when:</strong> ${escapeHtml(decision.revisitTrigger)}</p>` : ''}
            <p class="decision-status" role="status" aria-live="polite">${fallbackStatus}</p>
          </fieldset>`;
}

function renderDiagram(block, baseDir) {
  const svgPath = resolve(baseDir, block.svgPath);
  const sourcePath = resolve(baseDir, block.sourcePath);
  const svgDocument = readFileSync(svgPath, 'utf8');
  const svg = svgDocument.trim();
  const sourceText = readFileSync(sourcePath, 'utf8');
  const sourceDigest = createHash('sha256').update(sourceText).digest('hex');
  if (!/<!--\s*svg-source:system-diagram\s*-->/.test(svg)) throw new Error(`Diagram ${block.id} must be generated by the bundled System Diagram renderer: ${svgPath}`);
  if (!svg.includes(`<!-- svg-spec-sha256:${sourceDigest} -->`)) throw new Error(`Diagram ${block.id} SVG is stale or does not match its retained System Diagram JSON source`);
  if (Buffer.byteLength(sourceText, 'utf8') > 64 * 1024) throw new Error(`Diagram ${block.id} source exceeds 65536 bytes before parsing`);
  const source = JSON.parse(sourceText);
  const isV1 = source.schemaVersion === 'system-diagram-v1' && Array.isArray(source.nodes) && Array.isArray(source.edges);
  const isSequenceV2 = source.schemaVersion === 'system-diagram-v2' && source.diagramType === 'sequence';
  if (!isV1 && !isSequenceV2) throw new Error(`Diagram ${block.id} source is not an allowlisted System Diagram document: ${sourcePath}`);
  if (!/<svg\b[^>]*role=["']img["']/i.test(svg) || !/<title\b/i.test(svg) || !/<desc\b/i.test(svg)) throw new Error(`Diagram ${block.id} SVG needs accessible System Diagram metadata`);
  if (!/data-diagram-style=["']infrastructure-v1["']/i.test(svg)) throw new Error(`Diagram ${block.id} SVG must use the infrastructure-v1 visual system`);
  if (isSequenceV2 && (!/data-diagram-schema=["']system-diagram-v2["']/i.test(svg) || !/data-diagram-type=["']sequence["']/i.test(svg) || !/data-layout-version=["']sequence-v1["']/i.test(svg))) throw new Error(`Diagram ${block.id} sequence SVG markers do not match its source contract`);
  if (/<(?:script|foreignObject)\b|\son[a-z]+\s*=/i.test(svg)) throw new Error(`Diagram ${block.id} SVG contains executable or foreign content`);
  const assetUrls = [
    ...svg.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi),
    ...svg.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi),
  ].map((match) => match[1]);
  const external = assetUrls.find((url) => !url.startsWith('data:') && !url.startsWith('#'));
  if (external || /@import\s+/i.test(svg)) throw new Error(`Diagram ${block.id} SVG contains a non-embedded asset: ${external ?? '@import'}`);
  verifyExactSystemDiagramOutput(sourcePath, svgPath, block.id, sourceDigest, svgDocument, isSequenceV2 ? sequenceDiagramRendererPath : diagramRendererPath);
  const outputDigest = createHash('sha256').update(svg).digest('hex');
  return `          <figure class="figure-card diagram-figure" data-complex-figure data-diagram-output-sha256="${outputDigest}" data-review-id="${escapeAttribute(block.id)}"><p class="figure-question"><strong>Question:</strong> ${escapeHtml(block.question)}</p>${svg}<figcaption>${escapeHtml(block.caption)}</figcaption></figure><ol class="diagram-walkthrough" data-figure-walkthrough-for="${escapeAttribute(block.id)}">${block.walkthrough.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
}

function validateApproval(value, label, errors) {
  if (!isObject(value)) { errors.push(`${label} must be an object`); return; }
  requireOnly(value, ['approvedBy', 'approvedAt'], label, errors);
  requireText(value.approvedBy, `${label}.approvedBy`, errors);
  if (!isIsoDate(value.approvedAt)) errors.push(`${label}.approvedAt must be a real ISO date`);
}

function validateLinks(value, label, errors) {
  if (!Array.isArray(value)) { errors.push(`${label} must be an array`); return; }
  value.forEach((link, index) => {
    if (!isObject(link)) { errors.push(`${label}[${index}] must be an object`); return; }
    requireOnly(link, ['label', 'href'], `${label}[${index}]`, errors);
    requireText(link.label, `${label}[${index}].label`, errors);
    requireText(link.href, `${label}[${index}].href`, errors);
    requireSafeHref(link.href, `${label}[${index}].href`, errors);
  });
}

function validateApprovalBrief(block, label, errors) {
  requireOnly(block, ['type', 'id', 'product', 'why', 'how', 'approve', 'notBuilding'], label, errors);
  for (const key of ['id', 'product', 'why', 'how', 'approve', 'notBuilding']) requireText(block[key], `${label}.${key}`, errors);
}
function validateArchitectureApprovalBrief(block, label, errors) {
  requireOnly(block, ['type', 'id', 'decision', 'recommendation', 'goal', 'shape', 'why', 'approve', 'notBuilding', 'risks', 'readiness'], label, errors);
  for (const key of ['id', 'decision', 'recommendation', 'goal', 'shape', 'why', 'approve', 'notBuilding', 'risks', 'readiness']) requireText(block[key], `${label}.${key}`, errors);
}
function validateParagraph(block, label, errors) { requireOnly(block, ['type', 'id', 'text'], label, errors); requireText(block.text, `${label}.text`, errors); }
function validateList(block, label, errors) { requireOnly(block, ['type', 'id', 'style', 'items'], label, errors); if (block.style !== undefined) requireEnum(block.style, new Set(['bullets', 'checks', 'numbered']), `${label}.style`, errors); requireTextArray(block.items, `${label}.items`, errors); }
function validateFacts(block, label, errors) { requireOnly(block, ['type', 'id', 'items'], label, errors); requirePairs(block.items, `${label}.items`, errors); }
function validateSteps(block, label, ids, errors) {
  requireOnly(block, ['type', 'id', 'items'], label, errors);
  if (!Array.isArray(block.items) || block.items.length === 0) { errors.push(`${label}.items must be a non-empty array`); return; }
  block.items.forEach((item, index) => {
    const itemLabel = `${label}.items[${index}]`;
    if (!isObject(item)) { errors.push(`${itemLabel} must be an object`); return; }
    requireOnly(item, ['id', 'title', 'text'], itemLabel, errors);
    requireUniqueId(item.id, `${itemLabel}.id`, ids, errors);
    requireText(item.title, `${itemLabel}.title`, errors);
    requireText(item.text, `${itemLabel}.text`, errors);
  });
}
function validateCallout(block, label, errors) { requireOnly(block, ['type', 'id', 'tone', 'title', 'text'], label, errors); if (block.tone !== undefined) requireEnum(block.tone, new Set(['warning', 'danger', 'success', 'risk', 'tip']), `${label}.tone`, errors); requireText(block.title, `${label}.title`, errors); requireText(block.text, `${label}.text`, errors); }
function validateScenario(block, label, errors) { requireOnly(block, ['type', 'id', 'title', 'given', 'when', 'then'], label, errors); for (const key of ['id', 'title', 'given', 'when', 'then']) requireText(block[key], `${label}.${key}`, errors); }
function validateSlice(block, label, ids, documentKind, errors) {
  const designSlice = documentKind === 'design';
  const allowed = ['type', 'id', 'title', 'outcome', 'boundary', 'story', 'scenarios', 'mode', 'steps', 'acceptance', 'after'];
  if (designSlice) allowed.push('acceptanceAnchors', 'entryPoint', 'participatingElements', 'contractDelta', 'stateAndInvariants', 'failureRecovery', 'proof', 'dependsOn', 'escalateIf');
  requireOnly(block, allowed, label, errors);
  for (const key of ['id', 'title', 'outcome', 'boundary', 'after']) requireText(block[key], `${label}.${key}`, errors);
  requireEnum(block.mode, new Set(['visual', 'non-visual']), `${label}.mode`, errors);
  if (designSlice) {
    for (const key of ['acceptanceAnchors', 'participatingElements', 'contractDelta', 'stateAndInvariants', 'failureRecovery', 'proof']) requireTextArray(block[key], `${label}.${key}`, errors);
    if (!Array.isArray(block.dependsOn)) errors.push(`${label}.dependsOn must be an array`); else block.dependsOn.forEach((item, index) => requireText(item, `${label}.dependsOn[${index}]`, errors));
    requireText(block.escalateIf, `${label}.escalateIf`, errors);
    requireText(block.entryPoint, `${label}.entryPoint`, errors);
  }
  if (!isObject(block.story)) {
    errors.push(`${label}.story must be an object`);
  } else {
    requireOnly(block.story, ['id', 'actor', 'capability', 'outcome'], `${label}.story`, errors);
    requireUniqueId(block.story.id, `${label}.story.id`, ids, errors);
    for (const key of ['actor', 'capability', 'outcome']) requireText(block.story[key], `${label}.story.${key}`, errors);
  }
  if (!Array.isArray(block.scenarios) || block.scenarios.length === 0) {
    errors.push(`${label}.scenarios must contain a main scenario`);
  } else {
    block.scenarios.forEach((scenario, index) => {
      const scenarioLabel = `${label}.scenarios[${index}]`;
      if (!isObject(scenario)) { errors.push(`${scenarioLabel} must be an object`); return; }
      requireOnly(scenario, ['id', 'title', 'given', 'when', 'then'], scenarioLabel, errors);
      requireUniqueId(scenario.id, `${scenarioLabel}.id`, ids, errors);
      for (const key of ['title', 'given', 'when', 'then']) requireText(scenario[key], `${scenarioLabel}.${key}`, errors);
    });
  }
  if (!Array.isArray(block.steps) || block.steps.length === 0) {
    errors.push(`${label}.steps must explain the observable sequence`);
  } else {
    block.steps.forEach((step, index) => {
      const stepLabel = `${label}.steps[${index}]`;
      if (!isObject(step)) { errors.push(`${stepLabel} must be an object`); return; }
      requireOnly(step, ['id', 'title', 'context', 'action', 'response', 'outcome'], stepLabel, errors);
      requireUniqueId(step.id, `${stepLabel}.id`, ids, errors);
      for (const key of ['title', 'context', 'action', 'response', 'outcome']) requireText(step[key], `${stepLabel}.${key}`, errors);
    });
  }
  if (!Array.isArray(block.acceptance) || block.acceptance.length === 0) {
    errors.push(`${label}.acceptance must be non-empty`);
  } else {
    block.acceptance.forEach((item, index) => {
      const itemLabel = `${label}.acceptance[${index}]`;
      if (!isObject(item)) { errors.push(`${itemLabel} must be an object`); return; }
      requireOnly(item, ['id', 'text'], itemLabel, errors);
      if (!/^ac-[0-9]{3,}$/.test(item.id ?? '')) errors.push(`${itemLabel}.id must use lowercase ac-### semantics`);
      requireUniqueId(item.id, `${itemLabel}.id`, ids, errors);
      requireText(item.text, `${itemLabel}.text`, errors);
    });
  }
  requireUniqueId(`${block.id}.after`, `${label}.after review ID`, ids, errors);
}
function validateRequirement(block, label, ids, errors) {
  requireOnly(block, ['type', 'id', 'title', 'sourceType', 'source', 'bddRefs', 'path', 'dependencies', 'interactions', 'collision', 'resolution', 'proof', 'status', 'owner'], label, errors);
  requireId(block.id, `${label}.id`, errors);
  if (!/^req-[0-9]{3,}$/.test(block.id ?? '')) errors.push(`${label}.id must use lowercase req-### semantics`);
  requireText(block.title, `${label}.title`, errors);
  requireEnum(block.sourceType, new Set(['Sourced fact', 'Approved product truth', 'Proposed recommendation', 'Assumption', 'Open question']), `${label}.sourceType`, errors);
  requireText(block.source, `${label}.source`, errors);
  requireTextArray(block.bddRefs, `${label}.bddRefs`, errors);
  requireText(block.path, `${label}.path`, errors);
  requireTextArray(block.dependencies, `${label}.dependencies`, errors);
  requireTextArray(block.interactions, `${label}.interactions`, errors);
  requireEnum(block.collision, new Set(['none', 'conflict']), `${label}.collision`, errors);
  requireText(block.resolution, `${label}.resolution`, errors);
  requireText(block.proof, `${label}.proof`, errors);
  requireEnum(block.status, new Set(['covered', 'unresolved', 'blocked']), `${label}.status`, errors);
  if (block.collision === 'conflict') {
    if (block.status === 'covered') errors.push(`${label} cannot mark a conflicting requirement as covered`);
    requireText(block.owner, `${label}.owner`, errors);
  } else if (block.owner !== undefined) {
    requireText(block.owner, `${label}.owner`, errors);
  }
}
function validateArchitectureTrace(block, label, ids, errors) {
  requireOnly(block, ['type', 'id', 'title', 'sourceType', 'source', 'requirementRefs', 'sliceRefs', 'entryPoint', 'participatingElements', 'contractState', 'effect', 'failureRecovery', 'proof', 'fit', 'escalation'], label, errors);
  requireId(block.id, `${label}.id`, errors);
  if (!/^arch-[0-9]{3,}$/.test(block.id ?? '')) errors.push(`${label}.id must use lowercase arch-### semantics`);
  requireText(block.title, `${label}.title`, errors);
  requireEnum(block.sourceType, new Set(['Approved product truth', 'Sourced fact', 'Proposed recommendation', 'Assumption', 'Open question']), `${label}.sourceType`, errors);
  requireText(block.source, `${label}.source`, errors);
  requireTextArray(block.requirementRefs, `${label}.requirementRefs`, errors);
  requireTextArray(block.sliceRefs, `${label}.sliceRefs`, errors);
  requireText(block.entryPoint, `${label}.entryPoint`, errors);
  requireTextArray(block.participatingElements, `${label}.participatingElements`, errors);
  requireText(block.contractState, `${label}.contractState`, errors);
  requireText(block.effect, `${label}.effect`, errors);
  requireText(block.failureRecovery, `${label}.failureRecovery`, errors);
  requireText(block.proof, `${label}.proof`, errors);
  requireEnum(block.fit, new Set(['fits', 'unresolved', 'blocked']), `${label}.fit`, errors);
  if (block.fit !== 'fits') requireText(block.escalation, `${label}.escalation`, errors);
}
function validateDecision(block, label, documentKind, errors) {
  const designDecision = documentKind === 'design';
  requireOnly(block, ['type', 'id', 'question', 'status', 'options', 'selectedOptionId', 'customAnswer', 'rationale', 'owner', 'blocking', 'approvedBy', 'approvedAt', 'decisionDrivers', 'consequences', 'revisitTrigger'], label, errors);
  if (designDecision) {
    requireTextArray(block.decisionDrivers, `${label}.decisionDrivers`, errors);
    requireTextArray(block.consequences, `${label}.consequences`, errors);
    requireText(block.revisitTrigger, `${label}.revisitTrigger`, errors);
  }
  requireId(block.id, `${label}.id`, errors);
  requireText(block.question, `${label}.question`, errors);
  requireEnum(block.status, decisionStatuses, `${label}.status`, errors);
  requireText(block.owner, `${label}.owner`, errors);
  if (typeof block.blocking !== 'boolean') errors.push(`${label}.blocking must be boolean`);

  const optionIds = new Set();
  if (!Array.isArray(block.options) || block.options.length < 2) {
    errors.push(`${label}.options must contain at least two real options`);
  } else {
    block.options.forEach((option, index) => {
      const optionLabel = `${label}.options[${index}]`;
      if (!isObject(option)) { errors.push(`${optionLabel} must be an object`); return; }
      const optionAllowed = ['id', 'label'];
      if (designDecision) optionAllowed.push('summary', 'benefits', 'costs', 'rejectionReason');
      requireOnly(option, optionAllowed, optionLabel, errors);
      requireId(option.id, `${optionLabel}.id`, errors);
      if (option.id === 'other') errors.push(`${optionLabel}.id "other" is reserved for the renderer's custom answer`);
      if (optionIds.has(option.id)) errors.push(`${optionLabel}.id must be unique`);
      optionIds.add(option.id);
      requireText(option.label, `${optionLabel}.label`, errors);
      if (designDecision) {
        requireText(option.summary, `${optionLabel}.summary`, errors);
        requireTextArray(option.benefits, `${optionLabel}.benefits`, errors);
        requireTextArray(option.costs, `${optionLabel}.costs`, errors);
        if (option.id !== block.selectedOptionId) requireText(option.rejectionReason, `${optionLabel}.rejectionReason`, errors);
      }
    });
    if (block.selectedOptionId && block.selectedOptionId !== 'other' && !optionIds.has(block.selectedOptionId)) errors.push(`${label}.selectedOptionId must reference an option or "other"`);
  }

  const authorityFields = ['selectedOptionId', 'customAnswer', 'rationale', 'approvedBy', 'approvedAt'];
  if (block.status === 'open' && authorityFields.some((key) => block[key] !== undefined)) {
    errors.push(`${label} open decisions cannot contain canonical selection, rationale, or approval metadata`);
  }
  if (block.status === 'proposed') {
    requireText(block.selectedOptionId, `${label}.selectedOptionId`, errors);
    requireText(block.rationale, `${label}.rationale`, errors);
    if (block.approvedBy !== undefined || block.approvedAt !== undefined) errors.push(`${label} proposed decisions cannot contain approval metadata`);
  }
  if (block.status === 'accepted') {
    for (const key of ['selectedOptionId', 'rationale', 'approvedBy', 'approvedAt']) requireText(block[key], `${label}.${key}`, errors);
    if (!isIsoDate(block.approvedAt)) errors.push(`${label}.approvedAt must be a real ISO date`);
  }
  if (block.selectedOptionId === 'other') requireText(block.customAnswer, `${label}.customAnswer`, errors);
}
function validateDiagram(block, label, errors) { requireOnly(block, ['type', 'id', 'question', 'caption', 'svgPath', 'sourcePath', 'walkthrough'], label, errors); for (const key of ['id', 'question', 'caption', 'svgPath', 'sourcePath']) requireText(block[key], `${label}.${key}`, errors); requireTextArray(block.walkthrough, `${label}.walkthrough`, errors); }
function validateCode(block, label, errors) { requireOnly(block, ['type', 'id', 'label', 'content'], label, errors); requireText(block.label, `${label}.label`, errors); requireText(block.content, `${label}.content`, errors); }
function validateQuote(block, label, errors) { requireOnly(block, ['type', 'id', 'text', 'cite'], label, errors); requireText(block.text, `${label}.text`, errors); if (block.cite !== undefined) requireText(block.cite, `${label}.cite`, errors); }

function requireOnly(value, allowed, label, errors) { if (!isObject(value)) return; for (const key of Object.keys(value)) if (!allowed.includes(key)) errors.push(`${label}.${key} is unsupported`); }
function requireText(value, label, errors) { if (typeof value !== 'string' || !value.trim()) errors.push(`${label} must be non-empty text`); }
function requireTextArray(value, label, errors) { if (!Array.isArray(value) || value.length === 0) errors.push(`${label} must be a non-empty array`); else value.forEach((item, index) => requireText(item, `${label}[${index}]`, errors)); }
function requirePairs(value, label, errors) { if (!Array.isArray(value) || value.length === 0) errors.push(`${label} must be a non-empty array`); else value.forEach((pair, index) => { if (!Array.isArray(pair) || pair.length !== 2) errors.push(`${label}[${index}] must be a [term, detail] pair`); else { requireText(pair[0], `${label}[${index}][0]`, errors); requireText(pair[1], `${label}[${index}][1]`, errors); } }); }
function requireEnum(value, allowed, label, errors) { if (!allowed.has(value)) errors.push(`${label} must be one of: ${[...allowed].join(', ')}`); }
function requireSafeHref(value, label, errors) {
  if (typeof value !== 'string') return;
  const normalized = value.replace(/[\u0000-\u0020\u007f]+/g, '');
  if (/^(?:javascript|data|vbscript):/i.test(normalized)) errors.push(`${label} uses an unsafe URL scheme`);
}
function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (month < 1 || month > 12) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
}
function requireId(value, label, errors) { if (typeof value !== 'string' || !idPattern.test(value)) errors.push(`${label} must use lowercase kebab/dot notation`); }
function requireUniqueId(value, label, ids, errors) { requireId(value, label, errors); if (typeof value !== 'string') return; if (ids.has(value)) errors.push(`${label} duplicates review ID "${value}"`); ids.add(value); }
function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function throwInvalid(errors) { throw new Error(`Invalid DocumentSpec:\n- ${errors.join('\n- ')}`); }
function verifyExactSystemDiagramOutput(sourcePath, svgPath, diagramId, sourceDigest, svg, rendererPath) {
  const cacheKey = `${rendererPath}\0${sourcePath}\0${svgPath}\0${sourceDigest}\0${createHash('sha256').update(svg).digest('hex')}`;
  if (exactDiagramChecks.has(cacheKey)) return;
  if (!existsSync(rendererPath)) throw new Error(`Diagram ${diagramId} requires the bundled System Diagram renderer: ${rendererPath}`);
  const result = spawnSync(process.execPath, [rendererPath, '--check', sourcePath, svgPath], { encoding: 'utf8', timeout: 30_000, maxBuffer: 10 * 1024 * 1024 });
  if (result.error) throw new Error(`Diagram ${diagramId} exact output check failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Diagram ${diagramId} is not exact bundled System Diagram output: ${(result.stderr || result.stdout).trim()}`);
  exactDiagramChecks.add(cacheKey);
}

function kindLabel(kind) { return ({ prd: 'Product requirements', design: 'Feature design', report: 'Report', diagram: 'System diagram', research: 'Research brief', decision: 'Decision packet' })[kind] ?? kind; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]); }
function escapeAttribute(value) { return escapeHtml(value).replace(/\n/g, '&#10;'); }
