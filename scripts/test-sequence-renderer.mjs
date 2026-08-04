#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const renderer = resolve(root, 'skills/system-diagram/scripts/render-sequence-diagram.mjs');
const source = resolve(root, 'skills/system-diagram/resources/sequence-minimal-v2.json');
const output = resolve(root, 'skills/system-diagram/resources/sequence-minimal-v2.svg');
const svg = readFileSync(output, 'utf8');
assert(svg.includes('svg-source:system-diagram'), 'sequence SVG needs provenance');
assert(svg.includes(`svg-spec-sha256:${digest(source)}`), 'sequence SVG needs source digest');
for (const marker of ['data-diagram-style="infrastructure-v1"', 'data-diagram-schema="system-diagram-v2"', 'data-diagram-type="sequence"', 'data-layout-version="sequence-v1"', 'role="img"', '<title', '<desc', 'sequence-lifeline', 'sequence-message', 'SYNC', 'RETURN']) assert(svg.includes(marker), `sequence SVG missing ${marker}`);
assert(!/<(?:script|foreignObject)\b|\s+on[a-z]+\s*=|@import\s+/i.test(svg), 'sequence SVG must not contain executable content');
assert(/<svg\b[^>]*width="\d+(?:\.\d+)?"[^>]*height="\d+(?:\.\d+)?"[^>]*viewBox="0 0 \d+(?:\.\d+)? \d+(?:\.\d+)?"/.test(svg), 'sequence SVG root must expose intrinsic dimensions matching its viewBox');
const tampered = `${svg}<!-- tampered -->`;
const temp = resolve(root, `.tmp-sequence-${process.pid}.svg`); writeFileSync(temp, tampered);
try { const result = spawnSync(process.execPath, [renderer, '--check', source, temp], { encoding: 'utf8' }); assert(result.status !== 0 && `${result.stdout}${result.stderr}`.includes('stale'), 'tampered sequence SVG must fail --check'); } finally { rmSync(temp, { force: true }); }
console.log('✓ sequence SVG provenance, style, accessibility, security, and exact-output contract');
function digest(path) { return createHash('sha256').update(readFileSync(path)).digest('hex'); }
function assert(value, message) { if (!value) throw new Error(message); }
