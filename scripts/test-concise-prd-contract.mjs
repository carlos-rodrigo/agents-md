#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const prd = read('skills/prd/SKILL.md');
const report = read('skills/html-report-designer/SKILL.md');
const design = read('skills/design-solution/SKILL.md');
const diagram = read('skills/system-diagram/SKILL.md');

requireAll('prd', prd, [
  'specific moment → friction and consequence → bounded product bet → observable proof → meaningful boundary',
  '## Composable PRD roles',
  '## Linchpin artifact gate',
  '## Outcome-based splitting',
  'roughly five-minute read',
  'never split by package, component, or architecture layer',
  'Stories, post-story flow rows, domain maps, diagrams, wireframes, UI alternatives, selectors, and readiness ceremony are optional',
  '3–5 flow steps',
  '3–7 outcome-protecting rules',
  '3–6 observable proofs',
]);

requireAll('html-report-designer', report, [
  '## Generation quality contract',
  'resources/prd-template.html',
  'resources/design-template.html',
  'Start from the most specific template',
]);

requireAll('design-solution', design, [
  'optional PRD evidence that is present',
  'The absence of optional UI, domain, story, or diagram sections is not a blocker',
  'Design must not invent product behavior',
]);

requireAll('system-diagram', diagram, [
  'A PRD diagram is optional',
  'named product uncertainty',
  'existing prose or evidence is insufficient',
]);

forbidAll('prd', prd, [
  'Finished PRDs have no diagram exemption or grandfathering',
  'A finished PRD never omits both diagram forms',
  'Every finished PRD includes at least one meaningful renderer-backed Excalidraw semantic diagram',
  'include 2-3 options as real wireframes',
]);
forbidAll('html-report-designer', report, [
  'finished PRDs include an authentic renderer-backed Excalidraw semantic diagram',
  'A PRD with no meaningful domain behavior uses the required semantic diagram',
  'the authentic semantic diagram gate has no grandfathering or self-issued exemption',
]);
forbidAll('design-solution', design, [
  'including post-story user flows, domain interactions, the selected UI option/mockup, and resolved review gaps',
  'selected PRD UI option, post-story flows, domain interactions, and review gaps are consumed or explicitly blocked',
]);
forbidAll('system-diagram', diagram, [
  'A finished PRD must include one authentic renderer SVG',
]);

console.log('PASS: concise composition-neutral PRD guidance is aligned across owning and consuming skills');

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
