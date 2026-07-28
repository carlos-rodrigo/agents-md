#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { renderCanonicalReport, validateDocumentSpec } from './canonical-report.mjs';

const root = resolve(import.meta.dirname, '..');
const resources = join(root, 'skills/html-report-designer/resources');
const temp = mkdtempSync(join(tmpdir(), 'canonical-report-test-'));

try {
  for (const [name, markers] of [
    ['report-example.document.json', ['data-document-kind="report"', 'The renderer owns presentation', 'class="scenario-panel"', 'class="copyable-code"', '<blockquote']],
    ['specs/prd-example.document.json', ['data-document-kind="prd"', 'class="slice-card"', 'decision.retention', 'svg-source:excalidraw']],
    ['specs/design-example.document.json', ['data-document-kind="design"', 'decision.rendering-boundary', 'svg-source:excalidraw']],
  ]) {
    const specPath = join(resources, name);
    const spec = JSON.parse(readFileSync(specPath, 'utf8'));
    const first = renderCanonicalReport(spec, { specPath });
    const second = renderCanonicalReport(spec, { specPath });
    assert(first === second, `${name} must render byte-identically`);
    for (const marker of ['canonical-report-v1', 'data-tailwind-build="report.tailwind.css"', 'data-document-spec="canonical-report-v1"', ...markers]) {
      assert(first.includes(marker), `${name} output missing ${marker}`);
    }
    assert(!first.includes('{{'), `${name} output must not retain template placeholders`);
    const htmlPath = join(temp, name.replaceAll('/', '-').replace('.document.json', '.html'));
    writeFileSync(htmlPath, first);
    assertSuccess(run('scripts/validate-html-report.mjs', [htmlPath]), `${name} validates`);
  }

  const prd = JSON.parse(readFileSync(join(resources, 'specs/prd-example.document.json'), 'utf8'));
  const design = JSON.parse(readFileSync(join(resources, 'specs/design-example.document.json'), 'utf8'));

  const profileFailures = [
    ['missing PRD role', prd, (candidate) => { candidate.sections = candidate.sections.filter((section) => section.role !== 'diagram'); }, 'prd documents require a "diagram" section role'],
    ['reordered PRD roles', prd, (candidate) => { [candidate.sections[0], candidate.sections[1]] = [candidate.sections[1], candidate.sections[0]]; }, 'prd section roles must follow this order'],
    ['duplicate PRD role', prd, (candidate) => { candidate.sections[1].role = candidate.sections[0].role; }, 'section.role values must be unique'],
    ['zero PRD diagrams', prd, (candidate) => { candidate.sections.find((section) => section.role === 'diagram').blocks = [{ type: 'paragraph', id: 'diagram-placeholder', text: 'Missing diagram' }]; }, 'require exactly one Excalidraw diagram block'],
    ['two PRD diagrams', prd, (candidate) => { const block = clone(candidate.sections.find((section) => section.role === 'diagram').blocks[0]); block.id = 'second-diagram'; candidate.sections.find((section) => section.role === 'diagram').blocks.push(block); }, 'require exactly one Excalidraw diagram block'],
    ['missing PRD slice', prd, (candidate) => { candidate.sections.find((section) => section.role === 'slices').blocks = [{ type: 'paragraph', id: 'slice-placeholder', text: 'Missing slice' }]; }, 'require at least one complete slice block'],
    ['cross-placed PRD diagram', prd, (candidate) => { const diagram = candidate.sections.find((section) => section.role === 'diagram'); const scope = candidate.sections.find((section) => section.role === 'scope'); [diagram.blocks, scope.blocks] = [scope.blocks, diagram.blocks]; }, 'diagram blocks must be inside the "diagram" section role'],
    ['cross-placed PRD slice', prd, (candidate) => { const slices = candidate.sections.find((section) => section.role === 'slices'); const scope = candidate.sections.find((section) => section.role === 'scope'); [slices.blocks, scope.blocks] = [scope.blocks, slices.blocks]; }, 'slice blocks must be inside the "slices" section role'],
    ['PRD decisions before product', prd, (candidate) => { const index = candidate.sections.findIndex((section) => section.role === 'decisions'); candidate.sections.unshift(candidate.sections.splice(index, 1)[0]); }, 'prd section roles must follow this order: product → problem → behavior → diagram → slices → scope → decisions'],
    ['missing design role', design, (candidate) => { candidate.sections = candidate.sections.filter((section) => section.role !== 'boundary'); }, 'design documents require a "boundary" section role'],
    ['reordered design roles', design, (candidate) => { [candidate.sections[2], candidate.sections[3]] = [candidate.sections[3], candidate.sections[2]]; }, 'design section roles must follow this order'],
    ['duplicate design role', design, (candidate) => { candidate.sections[1].role = candidate.sections[0].role; }, 'section.role values must be unique'],
    ['zero design diagrams', design, (candidate) => { candidate.sections.find((section) => section.role === 'diagram').blocks = [{ type: 'paragraph', id: 'design-diagram-placeholder', text: 'Missing diagram' }]; }, 'require exactly one Excalidraw diagram block'],
    ['two design diagrams', design, (candidate) => { const block = clone(candidate.sections.find((section) => section.role === 'diagram').blocks[0]); block.id = 'second-design-diagram'; candidate.sections.find((section) => section.role === 'diagram').blocks.push(block); }, 'require exactly one Excalidraw diagram block'],
    ['missing design decision', design, (candidate) => { candidate.sections.find((section) => section.role === 'decisions').blocks = [{ type: 'paragraph', id: 'decision-placeholder', text: 'Missing decision' }]; }, 'require at least one architecture decision block'],
    ['cross-placed design decision', design, (candidate) => { const decisions = candidate.sections.find((section) => section.role === 'decisions'); const proof = candidate.sections.find((section) => section.role === 'proof'); [decisions.blocks, proof.blocks] = [proof.blocks, decisions.blocks]; }, 'decision blocks must be inside the "decisions" section role'],
  ];
  for (const [label, source, mutate, expected] of profileFailures) {
    expectInvalid(() => { const candidate = clone(source); mutate(candidate); validateDocumentSpec(candidate); }, expected, label);
  }

  expectInvalid(() => {
    const candidate = clone(prd);
    candidate.document.status = 'Approved';
    validateDocumentSpec(candidate);
  }, 'Approved documents require document.approval');
  expectInvalid(() => {
    const candidate = clone(prd);
    candidate.document.approval = { approvedBy: 'Reviewer', approvedAt: '2026-07-28' };
    validateDocumentSpec(candidate);
  }, 'Only Approved documents may contain document.approval');
  expectInvalid(() => {
    const candidate = clone(prd);
    candidate.document.updated = '2026-02-30';
    validateDocumentSpec(candidate);
  }, 'document.updated must be a real ISO date');
  expectInvalid(() => {
    const candidate = clone(prd);
    candidate.document.approval = { approvedBy: 'Reviewer', approvedAt: '2026-99-99' };
    validateDocumentSpec(candidate);
  }, 'document.approval.approvedAt must be a real ISO date');
  expectInvalid(() => {
    const candidate = clone(prd);
    candidate.document.unmanagedHtml = '<section>Bypass</section>';
    validateDocumentSpec(candidate);
  }, 'document.unmanagedHtml is unsupported');
  expectInvalid(() => {
    const candidate = clone(prd);
    candidate.sections.find((section) => section.role === 'slices').blocks[0].acceptance = [];
    validateDocumentSpec(candidate);
  }, 'acceptance must be non-empty');
  expectInvalid(() => {
    const candidate = clone(prd);
    candidate.sections.find((section) => section.role === 'slices').blocks[0].acceptance[0].id = 'AC-001';
    validateDocumentSpec(candidate);
  }, 'must use lowercase ac-### semantics');
  expectInvalid(() => {
    const candidate = clone(prd);
    delete candidate.sections.find((section) => section.role === 'behavior').blocks[0].items[0].id;
    validateDocumentSpec(candidate);
  }, '.id must use lowercase kebab/dot notation');
  expectInvalid(() => {
    const candidate = clone(prd);
    candidate.sections.find((section) => section.role === 'slices').blocks[0].scenarios[0].type = 'scenario';
    validateDocumentSpec(candidate);
  }, '.type is unsupported');
  expectInvalid(() => {
    const candidate = clone(prd);
    candidate.document.feature = '   ';
    validateDocumentSpec(candidate);
  }, 'document.feature must be non-empty text');
  for (const href of ['javascript:alert(1)', 'java\tscript:alert(1)', '\n data:text/html,unsafe']) {
    expectInvalid(() => {
      const candidate = clone(prd);
      candidate.document.relatedArtifacts = [{ label: 'Unsafe', href }];
      validateDocumentSpec(candidate);
    }, 'uses an unsafe URL scheme');
  }

  expectInvalid(() => {
    const candidate = clone(design);
    candidate.document.status = 'Approved';
    candidate.document.approval = { approvedBy: 'Architect', approvedAt: '2026-07-28' };
    validateDocumentSpec(candidate);
  }, 'Approved documents cannot contain open or proposed decisions');
  expectInvalid(() => {
    const candidate = clone(design);
    const decision = candidate.sections.find((section) => section.role === 'decisions').blocks[0];
    decision.approvedBy = 'Architect';
    decision.approvedAt = '2026-07-28';
    validateDocumentSpec(candidate);
  }, 'proposed decisions cannot contain approval metadata');
  expectInvalid(() => {
    const candidate = clone(design);
    const decision = candidate.sections.find((section) => section.role === 'decisions').blocks[0];
    decision.status = 'accepted';
    decision.approvedBy = 'Architect';
    decision.approvedAt = '2026-02-30';
    validateDocumentSpec(candidate);
  }, '.approvedAt must be a real ISO date');
  expectInvalid(() => {
    const candidate = clone(design);
    candidate.sections.find((section) => section.role === 'decisions').blocks[0].options[0].id = 'other';
    validateDocumentSpec(candidate);
  }, '.id "other" is reserved');

  const diagramPacket = clone(design);
  diagramPacket.document = { ...diagramPacket.document, id: 'diagram-packet', kind: 'diagram', status: 'Review' };
  delete diagramPacket.document.approval;
  diagramPacket.sections = [diagramPacket.sections.find((section) => section.role === 'diagram')];
  validateDocumentSpec(diagramPacket);
  expectInvalid(() => {
    const candidate = clone(diagramPacket);
    candidate.sections[0].blocks = [{ type: 'paragraph', id: 'diagram-packet-placeholder', text: 'No diagram' }];
    validateDocumentSpec(candidate);
  }, 'diagram documents require exactly one Excalidraw diagram block');

  const adversarial = clone(prd);
  adversarial.document.title = '<img src=x onerror=alert(1)> {{REPORT_PROVENANCE}}';
  adversarial.document.summary = '\"><script>alert(2)</script> Plain text: url(https://example.test/a.png) and @import https://example.test/a.css';
  const safeHtml = renderCanonicalReport(adversarial, { specPath: join(resources, 'specs/prd-example.document.json') });
  assert(!safeHtml.includes('<img src=x') && !safeHtml.includes('<script>alert(2)'), 'structured text must never become executable markup');
  assert(safeHtml.includes('&lt;img src=x onerror=alert(1)&gt; {{REPORT_PROVENANCE}}'), 'adversarial title must remain escaped literal text without slot expansion');
  assert((safeHtml.match(/Sources reviewed:/g) || []).length === 1, 'content tokens must not duplicate managed template slots');
  const adversarialHtmlPath = join(temp, 'adversarial.html');
  writeFileSync(adversarialHtmlPath, safeHtml);
  assertSuccess(run('scripts/validate-html-report.mjs', [adversarialHtmlPath]), 'escaped adversarial text remains valid report content');

  const portableDesign = clone(design);
  const diagramBlock = portableDesign.sections.find((section) => section.role === 'diagram').blocks[0];
  const sourceDiagram = join(root, 'skills/system-diagram/resources/excalidraw-slice-example.json');
  const sourceSvg = join(root, 'skills/system-diagram/resources/excalidraw-slice-example.svg');
  const tempDiagram = join(temp, 'diagram.json');
  const tempSvg = join(temp, 'diagram.svg');
  copyFileSync(sourceDiagram, tempDiagram);
  copyFileSync(sourceSvg, tempSvg);
  diagramBlock.sourcePath = 'diagram.json';
  diagramBlock.svgPath = 'diagram.svg';
  const portableSpecPath = join(temp, 'design.document.json');
  writeFileSync(portableSpecPath, JSON.stringify(portableDesign, null, 2));
  renderCanonicalReport(portableDesign, { specPath: portableSpecPath });

  const changedSource = JSON.parse(readFileSync(tempDiagram, 'utf8'));
  changedSource.title = 'Changed after render';
  writeFileSync(tempDiagram, JSON.stringify(changedSource, null, 2));
  expectInvalid(() => renderCanonicalReport(portableDesign, { specPath: portableSpecPath }), 'SVG is stale or does not match');

  copyFileSync(sourceDiagram, tempDiagram);
  writeFileSync(tempSvg, readFileSync(sourceSvg, 'utf8').replace('</svg>', '<script>alert(1)</script></svg>'));
  expectInvalid(() => renderCanonicalReport(portableDesign, { specPath: portableSpecPath }), 'contains executable or foreign content');

  const sourceText = readFileSync(tempDiagram, 'utf8').trim();
  const digest = createHash('sha256').update(sourceText).digest('hex');
  writeFileSync(tempSvg, `<svg role="img"><title>Forged</title><desc>Not Excalidraw output</desc><!-- svg-source:excalidraw --><!-- svg-spec-sha256:${digest} --></svg>`);
  expectInvalid(() => renderCanonicalReport(portableDesign, { specPath: portableSpecPath }), 'is not exact bundled Excalidraw output');

  const sameReportPath = join(temp, 'same-report.json');
  writeFileSync(sameReportPath, JSON.stringify(prd));
  const reportBefore = readFileSync(sameReportPath, 'utf8');
  const sameReport = run('scripts/render-canonical-report.mjs', [sameReportPath, sameReportPath]);
  assert(sameReport.status !== 0 && `${sameReport.stdout}${sameReport.stderr}`.includes('must be different'), 'report CLI must reject identical input/output paths');
  assert(readFileSync(sameReportPath, 'utf8') === reportBefore, 'report CLI must preserve same-path input');

  const sameDiagramPath = join(temp, 'same-diagram.json');
  copyFileSync(sourceDiagram, sameDiagramPath);
  const diagramBefore = readFileSync(sameDiagramPath, 'utf8');
  const sameDiagram = run('scripts/render-excalidraw-diagram.mjs', [sameDiagramPath, sameDiagramPath]);
  assert(sameDiagram.status !== 0 && `${sameDiagram.stdout}${sameDiagram.stderr}`.includes('must be different'), 'diagram CLI must reject identical input/output paths');
  assert(readFileSync(sameDiagramPath, 'utf8') === diagramBefore, 'diagram CLI must preserve same-path input');

  console.log('PASS: one canonical renderer enforces safe substitution, ordered profiles, approval, decisions, exact Excalidraw output, and same-path protection');
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function run(command, args) {
  return spawnSync(process.execPath, [join(root, command), ...args], { cwd: root, encoding: 'utf8' });
}
function assertSuccess(result, label) { assert(result.status === 0, `${label}:\n${result.stdout}${result.stderr}`); }
function expectInvalid(action, expected, label = 'invalid candidate') { try { action(); } catch (error) { assert(error.message.includes(expected), `${label}: expected "${expected}" in "${error.message}"`); return; } throw new Error(`${label}: expected failure containing ${expected}`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function assert(condition, message) { if (!condition) throw new Error(message); }
