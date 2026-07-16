#!/usr/bin/env node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const validator = join(root, 'scripts/validate-html-report.mjs');
const template = readFileSync(join(root, 'skills/html-report-designer/resources/prd-template.html'), 'utf8');
const reportTemplate = readFileSync(join(root, 'skills/html-report-designer/resources/report-template.html'), 'utf8');
const designTemplate = readFileSync(join(root, 'skills/html-report-designer/resources/design-template.html'), 'utf8');
const domainExampleSvg = readFileSync(join(root, 'skills/html-report-designer/resources/excalidraw-domain-interaction-example.svg'), 'utf8');
const domainInsertionPoint = '<p class="section-summary">{{DOMAIN_INTERACTIONS_SUMMARY}}</p>';
const whatInsertionPoint = '<p class="section-summary">{{WHAT_FEATURE_SUMMARY}}</p>';
const canonicalSlot = 'data-excalidraw-slot="semantic-domain-diagram"';
const temp = mkdtempSync(join(tmpdir(), 'html-report-validator-'));

try {
  assert(template.includes(domainInsertionPoint), 'PRD template domain insertion point is missing');
  assert(template.includes(whatInsertionPoint), 'PRD template overview insertion point is missing');

  const missingUiEvidencePath = join(temp, 'missing-ui-evidence', 'prd.html');
  writeFixture(
    missingUiEvidencePath,
    template.replace('data-review-id="ui-options.existing-ui-evidence"', 'data-review-id="ui-options.unanchored-ui-note"'),
  );
  assertFailureIncludes(
    runValidator(missingUiEvidencePath, { allowPlaceholders: true }),
    'existing UI continuity evidence',
    'PRD without existing UI continuity evidence',
  );

  const missingMockupGatePath = join(temp, 'missing-mockup-gate', 'prd.html');
  writeFixture(
    missingMockupGatePath,
    template.replace('data-review-id="ui-options.mockup-decision"', 'data-review-id="ui-options.unanchored-mockup-note"'),
  );
  assertFailureIncludes(
    runValidator(missingMockupGatePath, { allowPlaceholders: true }),
    'mockup decision gate',
    'PRD without a mockup decision gate',
  );

  const danglingUiOptionPath = join(temp, 'dangling-ui-option', 'prd.html');
  writeFixture(
    danglingUiOptionPath,
    template.replace('data-ui-option-ref="ui-options.option-a"', 'data-ui-option-ref="ui-options.missing-option"'),
  );
  assertFailureIncludes(
    runValidator(danglingUiOptionPath, { allowPlaceholders: true }),
    'UI option selector references missing data-review-id',
    'PRD with a dangling UI option selector',
  );

  const placeholderTemplatePath = join(temp, 'placeholder-template', 'prd-template.html');
  writeFixture(placeholderTemplatePath, template);
  assertSuccess(
    runValidator(placeholderTemplatePath, { allowPlaceholders: true }),
    'canonical placeholder PRD template',
  );

  const missingSlotPath = join(temp, 'missing-slot', 'prd-template.html');
  writeFixture(missingSlotPath, template.replace(canonicalSlot, 'data-excalidraw-slot="removed"'));
  assertFailureIncludes(
    runValidator(missingSlotPath, { allowPlaceholders: true }),
    'canonical semantic Excalidraw slot',
    'placeholder PRD template without its canonical semantic diagram slot',
  );

  const finishedTemplate = replacePlaceholders(template);
  const noDiagramPath = join(temp, 'no-diagram', 'prd.html');
  writeFixture(noDiagramPath, finishedTemplate);
  assertFailureIncludes(
    runValidator(noDiagramPath),
    'authentic semantic Excalidraw diagram',
    'finished PRD without a semantic diagram',
  );

  const fakeSvgPath = join(temp, 'fake-svg', 'prd.html');
  const fakeSvg = '<svg role="img" aria-label="Fake domain flow" data-review-id="domain-interactions.fake.svg"><!-- svg-source:excalidraw --><g class="diagram-reveal"><text>Fact → balance</text></g></svg>';
  writeFixture(fakeSvgPath, insertInSection(finishedTemplate, 'domain-interactions', domainInsertionPoint.replace('{{DOMAIN_INTERACTIONS_SUMMARY}}', 'Fixture'), fakeSvg));
  assertFailureIncludes(
    runValidator(fakeSvgPath),
    'authentic semantic Excalidraw diagram',
    'finished PRD with a fake SVG',
  );

  const htmlWireframePath = join(temp, 'html-wireframe-only', 'prd.html');
  const richWireframe = '<figure data-review-id="domain-interactions.fake-wireframe"><div class="wireframe-frame"><h3>Fact flow</h3><p>Fact changes balance.</p></div><figcaption>HTML wireframe only.</figcaption></figure>';
  writeFixture(htmlWireframePath, insertInSection(finishedTemplate, 'domain-interactions', domainInsertionPoint.replace('{{DOMAIN_INTERACTIONS_SUMMARY}}', 'Fixture'), richWireframe));
  assertFailureIncludes(
    runValidator(htmlWireframePath),
    'authentic semantic Excalidraw diagram',
    'finished PRD with only an HTML wireframe',
  );

  const unrelatedDiagramPath = join(temp, 'unrelated-diagram', 'prd.html');
  writeFixture(
    unrelatedDiagramPath,
    insertAfter(finishedTemplate, whatInsertionPoint.replace('{{WHAT_FEATURE_SUMMARY}}', 'Fixture'), authenticDiagram()),
  );
  assertFailureIncludes(
    runValidator(unrelatedDiagramPath),
    'inside the user-flows or domain-interactions section',
    'finished PRD with an unrelated Excalidraw diagram',
  );

  const inaccessibleDiagramPath = join(temp, 'inaccessible-diagram', 'prd.html');
  const inaccessibleDiagram = authenticDiagram()
    .replace(/ aria-labelledby="[^"]+"/, '')
    .replace(/<title[\s\S]*?<\/title>/, '')
    .replace(/<desc[\s\S]*?<\/desc>/, '');
  writeFixture(
    inaccessibleDiagramPath,
    insertInSection(finishedTemplate, 'domain-interactions', domainInsertionPoint.replace('{{DOMAIN_INTERACTIONS_SUMMARY}}', 'Fixture'), inaccessibleDiagram),
  );
  assertFailureIncludes(
    runValidator(inaccessibleDiagramPath),
    'accessible title and description',
    'finished PRD with an inaccessible semantic diagram',
  );

  for (const section of ['domain', 'user-flow']) {
    const insertionPoint = section === 'domain'
      ? domainInsertionPoint.replace('{{DOMAIN_INTERACTIONS_SUMMARY}}', 'Fixture')
      : '<p class="section-summary">Fixture</p>';
    const source = section === 'domain'
      ? finishedTemplate
      : replaceFirstInSection(finishedTemplate, 'user-flows', insertionPoint, `${insertionPoint}${authenticDiagram()}`);
    const content = section === 'domain'
      ? insertInSection(source, 'domain-interactions', insertionPoint, authenticDiagram())
      : source;
    const validPath = join(temp, `valid-${section}`, 'prd.html');
    writeFixture(validPath, content);
    assertSuccess(runValidator(validPath), `finished PRD with an authentic ${section} semantic diagram`);
  }

  const scenarioGridPath = join(temp, 'scenario-auto-fit', 'report.html');
  writeFixture(
    scenarioGridPath,
    replacePlaceholders(reportTemplate).replace(
      'class="before-after" data-layout-exception="visual-diff" data-visual-diff-states="2"',
      'class="example-pair"',
    ),
  );
  assertFailureIncludes(
    runValidator(scenarioGridPath),
    'sequential scenarios must use a stacked layout',
    'report with a scenario-bearing auto-fit gallery',
  );

  const optionGridPath = join(temp, 'option-auto-fit', 'prd-template.html');
  writeFixture(
    optionGridPath,
    template.replace('class="ui-option-list"', 'class="card-grid"'),
  );
  assertFailureIncludes(
    runValidator(optionGridPath, { allowPlaceholders: true }),
    'UI options must use full-width stacked rows',
    'PRD with an auto-fit UI option gallery',
  );

  const emptySummaryPath = join(temp, 'empty-summary', 'report.html');
  writeFixture(
    emptySummaryPath,
    replacePlaceholders(reportTemplate).replace(
      /<summary>[\s\S]*?<\/summary>/,
      '<summary> </summary>',
    ),
  );
  assertFailureIncludes(
    runValidator(emptySummaryPath),
    'meaningful non-empty <summary>',
    'report with an empty disclosure summary',
  );

  const unrelatedCaptionPath = join(temp, 'unrelated-caption', 'report.html');
  const complexFigureWithoutCaption = `<figure data-complex-figure data-review-id="examples.complex-figure"><p class="figure-question"><strong>Question:</strong> What changes?</p><svg role="img" aria-label="Change flow"><title>Change flow</title><desc>One state changes into another.</desc><text>Before → After</text></svg></figure><ol class="diagram-walkthrough" data-figure-walkthrough-for="examples.complex-figure"><li>Read the change.</li></ol><figure><figcaption>Unrelated page-level caption.</figcaption></figure>`;
  writeFixture(
    unrelatedCaptionPath,
    insertAfter(
      replacePlaceholders(reportTemplate),
      '<p class="section-summary">Fixture</p>',
      complexFigureWithoutCaption,
    ),
  );
  assertFailureIncludes(
    runValidator(unrelatedCaptionPath),
    'needs its own <figcaption>',
    'complex figure relying on an unrelated caption',
  );

  const richRoleImgPath = join(temp, 'rich-role-img', 'report.html');
  const hiddenRichWireframe = '<div role="img" aria-label="Interactive mockup"><h3>Settings</h3><label>Mode <input type="text" /></label><button type="button">Save</button></div>';
  writeFixture(
    richRoleImgPath,
    insertAfter(
      replacePlaceholders(reportTemplate),
      '<p class="section-summary">Fixture</p>',
      hiddenRichWireframe,
    ),
  );
  assertFailureIncludes(
    runValidator(richRoleImgPath),
    'rich HTML must not use role="img"',
    'rich HTML wireframe hidden behind role img semantics',
  );

  const simpleRoleImgPath = join(temp, 'simple-role-img', 'report.html');
  writeFixture(
    simpleRoleImgPath,
    insertAfter(
      replacePlaceholders(reportTemplate),
      '<p class="section-summary">Fixture</p>',
      '<span role="img" aria-label="Complete">✓</span>',
    ),
  );
  assertSuccess(runValidator(simpleRoleImgPath), 'simple labelled icon using role img semantics');

  const missingDesignDiagramPath = join(temp, 'design-no-renderer', 'design.html');
  writeFixture(missingDesignDiagramPath, replacePlaceholders(designTemplate));
  assertFailureIncludes(
    runValidator(missingDesignDiagramPath),
    'renderer-backed domain building-block diagram',
    'finished design without a renderer-backed domain diagram',
  );

  const validDesignDiagramPath = join(temp, 'design-renderer', 'design.html');
  writeFixture(
    validDesignDiagramPath,
    replacePlaceholders(designTemplate.replace('{{DOMAIN_INTERACTION_DIAGRAM_SVG}}', domainExampleSvg)),
  );
  assertSuccess(runValidator(validDesignDiagramPath), 'finished design with a renderer-backed domain diagram');

  console.log('✓ HTML report validator learning hierarchy, disclosure, figure, wireframe, and diagram checks');
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function authenticDiagram() {
  return `<figure data-excalidraw-slot="semantic-domain-diagram">${domainExampleSvg}<figcaption>Read from evidence to visible state.</figcaption></figure>`;
}

function replacePlaceholders(content) {
  return content.replace(/\{\{[^}]+\}\}/g, 'Fixture');
}

function insertAfter(content, needle, addition) {
  assert(content.includes(needle), `fixture insertion point is missing: ${needle}`);
  return content.replace(needle, `${needle}${addition}`);
}

function insertInSection(content, reviewId, needle, addition) {
  return replaceFirstInSection(content, reviewId, needle, `${needle}${addition}`);
}

function replaceFirstInSection(content, reviewId, needle, replacement) {
  const sectionPattern = new RegExp(`(<section\\b(?=[^>]*data-review-id=["']${reviewId}["'])[^>]*>)([\\s\\S]*?)(<\\/section>)`, 'i');
  const match = content.match(sectionPattern);
  assert(match, `fixture section is missing: ${reviewId}`);
  assert(match[2].includes(needle), `fixture insertion point is missing from ${reviewId}`);
  return content.replace(sectionPattern, `${match[1]}${match[2].replace(needle, replacement)}${match[3]}`);
}

function runValidator(path, { allowPlaceholders = false } = {}) {
  const args = [validator];
  if (allowPlaceholders) args.push('--allow-placeholders');
  args.push(path);
  return spawnSync(process.execPath, args, { encoding: 'utf8' });
}

function writeFixture(path, content) {
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, content);
}

function assertFailureIncludes(result, expected, label) {
  assert(result.status !== 0, `${label} should fail validation`);
  const output = `${result.stdout}${result.stderr}`;
  assert(output.includes(expected), `${label} should explain the required fix with "${expected}":\n${output}`);
}

function assertSuccess(result, label) {
  assert(result.status === 0, `${label} should pass validation:\n${result.stdout}${result.stderr}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
