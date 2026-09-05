#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { validateDocumentSpec } from '../../html-report-designer/scripts/canonical-report.mjs';

// Read-only structural checks. Product meaning and approval require human review.
try {
  const [sourcePath, sidecarPath, extra] = process.argv.slice(2);
  if (!sourcePath || extra) throw new Error('usage: audit-prd-traceability.mjs <prd.document.json> [review.md]');
  const spec = validateDocumentSpec(JSON.parse(readFileSync(sourcePath, 'utf8')));
  if (spec.document.kind !== 'prd') throw new Error('Expected a PRD DocumentSpec');
  const blocks = spec.sections.flatMap((section) => section.blocks);
  const bddIds = new Set();
  const acceptanceIds = new Set();
  const anchors = new Set(spec.sections.map((section) => section.id));
  for (const block of blocks) {
    if (block.id) anchors.add(block.id);
    if (block.type === 'scenario') bddIds.add(block.id);
    if (block.type === 'slice') {
      bddIds.add(block.id);
      anchors.add(block.story.id);
      for (const scenario of block.scenarios) bddIds.add(scenario.id);
      for (const criterion of block.acceptance) acceptanceIds.add(criterion.id);
      for (const item of [...block.scenarios, ...block.acceptance, ...block.steps]) anchors.add(item.id);
    }
    if (block.type === 'steps') for (const item of block.items) anchors.add(item.id);
  }
  for (const requirement of blocks.filter((block) => block.type === 'requirement')) {
    for (const reference of requirement.bddRefs) {
      if (!bddIds.has(reference)) throw new Error(`${requirement.id}: unknown BDD reference ${reference}`);
    }
    const proofIds = requirement.proof.match(/[a-z0-9]+(?:[.-][a-z0-9]+)+/gi) ?? [];
    if (!proofIds.some((id) => acceptanceIds.has(id))) throw new Error(`${requirement.id}: proof must cite an existing acceptance ID`);
    for (const id of proofIds.filter((id) => id.startsWith('ac-'))) {
      if (!acceptanceIds.has(id)) throw new Error(`${requirement.id}: unknown acceptance reference ${id}`);
    }
  }
  if (sidecarPath) auditReview(readFileSync(sidecarPath, 'utf8'), blocks, anchors);
  console.log('PASS: PRD structure and traceability references checked. Semantic coverage, decision reconciliation, and approval still require review. No files changed.');
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
}

function auditReview(markdown, blocks, anchors) {
  const decisions = new Map(blocks.filter((block) => block.type === 'decision').map((block) => [block.id, block]));
  const seen = new Set();
  // Pi escapes Markdown punctuation and HTML-sensitive characters in comment text.
  const decoded = markdown.replace(/\\([\\`*_#[\]|])/g, '$1').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  for (const record of decoded.split(/^## /m)) {
    const anchor = record.match(/^- (?:Review ID|Anchor): `([^`]+)`\s*$/m)?.[1];
    if (anchor && !anchors.has(anchor)) throw new Error(`Unknown review anchor ${anchor}`);
    const isDecision = /^- Review ID:/m.test(record) || /Feedback type: Decision|Decision (?:selected|confirmed):/i.test(record);
    if (!isDecision) continue;
    if (!anchor) throw new Error('Unsupported decision record: missing review anchor');
    if (seen.has(anchor)) throw new Error(`Duplicate decision record for ${anchor}; select the current sidecar before review`);
    seen.add(anchor);
    const decision = decisions.get(anchor);
    if (!decision) throw new Error(`Unknown decision anchor ${anchor}`);
    const fingerprint = record.match(/Source fingerprint: `?([a-f0-9]{64})`?(?=\s|$)/)?.[1];
    const expected = createHash('sha256').update(JSON.stringify(decision)).digest('hex');
    if (fingerprint !== expected) throw new Error(`${anchor}: stale or missing source fingerprint; review the matching source version`);
    const optionId = record.match(/Option ID: ([^|\n]+)/)?.[1].trim();
    const selection = record.match(/(?:^- Decision: |Decision (?:selected|confirmed): )([^|\n]+)/m)?.[1].trim();
    const unrecorded = /^- Status: Not recorded\s*$/m.test(record);
    if (unrecorded && selection === 'No selection') continue;
    if (!selection) throw new Error(`${anchor}: missing decision selection`);
    let selectedId = optionId;
    if (optionId) {
      if (optionId !== 'other' && !decision.options.some((option) => option.id === optionId)) throw new Error(`${anchor}: unknown option ${optionId}`);
    } else {
      const matches = decision.options.filter((option) => option.label === selection);
      if (matches.length !== 1) throw new Error(`${anchor}: selection requires manual review; standalone export lacks an unambiguous option ID`);
      selectedId = matches[0].id;
    }
    if (selectedId !== decision.selectedOptionId) console.log(`REVIEW: ${anchor} selection differs from canonical source; propagate only explicitly approved input.`);
  }
}
