#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { renderCanonicalReport } from './canonical-report.mjs';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const positional = args.filter((arg) => !arg.startsWith('--'));

if (args.includes('--help') || positional.length !== 2) {
  console.log('Usage: render-canonical-report.mjs [--check] <document.json> <report.html>');
  process.exit(args.includes('--help') ? 0 : 2);
}

const specPath = resolve(positional[0]);
const outputPath = resolve(positional[1]);
if (outputPath === specPath) throw new Error('DocumentSpec input JSON and report output HTML paths must be different');
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
const html = renderCanonicalReport(spec, { specPath });

if (checkOnly) {
  if (!existsSync(outputPath)) {
    console.error(`✗ ${outputPath} is missing. Render it first.`);
    process.exit(1);
  }
  if (readFileSync(outputPath, 'utf8') !== html) {
    console.error(`✗ ${outputPath} is stale. Run the canonical report renderer.`);
    process.exit(1);
  }
  console.log(`✓ ${outputPath} is current`);
  process.exit(0);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html);
console.log(`✓ rendered ${outputPath}`);
