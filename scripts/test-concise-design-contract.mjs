#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const design = read('skills/design-solution/SKILL.md');
const report = read('skills/html-report-designer/SKILL.md');
const diagram = read('skills/system-diagram/SKILL.md');
const recipes = read('skills/design-solution/references/optional-design-recipes.md');

requireAll('design-solution', design, [
  'approved product promise → architecture pressure → chosen seam → causal system path → tradeoffs and proof → meaningful boundary',
  '## Architecture core',
  '## Composition gate',
  '## Causal system path',
  '## Progressive disclosure',
  'references/optional-design-recipes.md',
  'Skip durable design for small clear changes',
  'Design must not invent product behavior',
  'approved PRD',
  'approved product definition, rationale, product slices, stories, scenarios, observable acceptance',
  'Missing required PRD behavior blocks design',
  'independently reviewable architecture question or an approved child outcome',
  'Task execution steps and proof results stay in task packets',
  'Technology choices belong only when they constrain a boundary or materially change delivery/risk',
  'Data/domain/persistence detail belongs only when ownership, invariants, migration, or recovery depends on it',
  'Use `system-diagram` after naming the architecture question the figure must answer',
  'one high-quality causal architecture diagram',
  'Diagram not applicable',
  'Create or update an ADR only for architecture-significant decisions',
]);

requireAll('optional design recipes', recipes, [
  '## Interface consequences',
  '## Contracts, domain, data, and persistence',
  '## Operations, rollout, and risk',
  '## Outside-in slice outline',
  '## Traceability',
  'A slice is an observable vertical outcome, not a package/layer phase',
]);

requireAll('html-report-designer', report, [
  '## Generation quality contract',
  'resources/prd-template.html',
  'resources/design-template.html',
  'Start from the most specific template',
  'scroll-reveal motion',
  'high-quality explanatory diagram',
]);

requireAll('system-diagram', diagram, [
  '## Architecture diagram gate',
  'A durable feature design normally includes one causal architecture diagram',
  'named architecture question',
  'One small causal path',
  'existing evidence supports the figure',
  'Diagram not applicable',
]);

forbidAll('design-solution', design, [
  'The design should include only decision-critical material:',
  'Every likely execution slice starts from an external need',
  'A non-engineer can follow the main scenario and diagram',
]);
forbidAll('html-report-designer', report, [
  'default to this concise pattern:',
  'Design reports must be built in this order',
  'give each slice a small outside-in design and detailed SVG diagram',
  'architecture-overview       # high-level diagram',
]);
forbidAll('system-diagram', diagram, [
  'For complex features, create a small set of diagram sections inside the main report by default',
  'Use authentic build-time Excalidraw export as the default diagram treatment',
]);

console.log('PASS: concise composition-neutral design guidance is aligned across owning and consuming skills');

function requireAll(label, content, markers) {
  const missing = markers.filter((marker) => !content.includes(marker));
  assert(missing.length === 0, `${label} missing: ${missing.join(', ')}`);
}

function forbidAll(label, content, markers) {
  const found = markers.filter((marker) => content.includes(marker));
  assert(found.length === 0, `${label} retains mandatory-richness guidance: ${found.join(', ')}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
