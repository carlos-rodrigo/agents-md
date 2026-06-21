#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const checkOnly = process.argv.includes('--check');
const resourcesDir = join(root, 'skills/html-report-designer/resources');
const tailwindBin = join(root, 'node_modules/.bin/tailwindcss');
const templates = [
  { css: 'report.tailwind.css', html: 'report-template.html' },
  { css: 'prd.tailwind.css', html: 'prd-template.html' },
  { css: 'design.tailwind.css', html: 'design-template.html' },
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function compileCss(inputPath) {
  const tmp = mkdtempSync(join(tmpdir(), 'html-report-css-'));
  const outputPath = join(tmp, 'compiled.css');
  const result = spawnSync(
    tailwindBin,
    ['-c', join(root, 'tailwind.config.cjs'), '-i', inputPath, '-o', outputPath, '--minify'],
    { cwd: root, encoding: 'utf8' },
  );

  if (result.error?.code === 'ENOENT') {
    fail('Tailwind CLI is not installed. Run `cd /Users/carlosrodrigo/agents && npm install` once, then retry.');
  }
  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    fail(`Tailwind build failed for ${inputPath}`);
  }

  const css = readFileSync(outputPath, 'utf8').trim();
  rmSync(tmp, { recursive: true, force: true });
  return css;
}

function buildStyleBlock(css, sourceName) {
  return `<style data-tailwind-build="${sourceName}">\n/* tailwind-report-css:start */\n${css}\n/* tailwind-report-css:end */\n  </style>`;
}

let changed = false;
for (const template of templates) {
  const cssPath = join(resourcesDir, template.css);
  const htmlPath = join(resourcesDir, template.html);
  const css = compileCss(cssPath);
  const html = readFileSync(htmlPath, 'utf8');
  const styleBlock = buildStyleBlock(css, template.css);
  const nextHtml = html.replace(/<style(?:\s+[^>]*)?>[\s\S]*?\n\s*<\/style>/, styleBlock);

  if (nextHtml === html) {
    console.log(`✓ ${template.html} CSS is current`);
    continue;
  }

  changed = true;
  if (checkOnly) {
    console.error(`✗ ${template.html} has stale compiled Tailwind CSS. Run \`npm run build:report-css\`.`);
  } else {
    writeFileSync(htmlPath, nextHtml);
    console.log(`✓ rebuilt ${template.html} from ${template.css}`);
  }
}

if (checkOnly && changed) process.exit(1);
if (!changed) console.log('All HTML report CSS is up to date.');
