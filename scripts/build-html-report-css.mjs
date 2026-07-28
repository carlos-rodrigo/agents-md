#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const checkOnly = process.argv.includes('--check');
const tailwindBin = join(root, 'node_modules/.bin/tailwindcss');
const htmlResources = 'skills/html-report-designer/resources';
const reportConfig = join(root, 'scripts/report-tailwind.config.cjs');
const reportCssName = 'report.tailwind.css';
const reportTemplateName = 'report-template.html';
const sharedScripts = [
  {
    attribute: 'data-artifact-motion="native"',
    marker: 'artifact-motion',
    path: join(root, htmlResources, 'artifact-motion.js'),
  },
  {
    attribute: 'data-document-navigation="progressive"',
    marker: 'document-navigation',
    path: join(root, htmlResources, 'document-navigation.js'),
  },
  {
    attribute: 'data-artifact-review-state="persistent"',
    marker: 'artifact-review-state',
    path: join(root, htmlResources, 'artifact-review-state.js'),
  },
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function compileCss(inputPath, configPath) {
  const tmp = mkdtempSync(join(tmpdir(), 'html-report-css-'));
  const outputPath = join(tmp, 'compiled.css');
  const result = spawnSync(
    tailwindBin,
    ['-c', configPath, '-i', inputPath, '-o', outputPath, '--minify'],
    { cwd: root, encoding: 'utf8' },
  );

  if (result.error?.code === 'ENOENT') {
    fail(`Tailwind CLI is not installed. Run npm install in ${root}, then retry.`);
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

function inlineSharedScript(html, script) {
  if (!html.includes(script.attribute)) return html;
  const source = readFileSync(script.path, 'utf8').trim();
  const pattern = new RegExp(
    `<script\\s+${script.attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*>[\\s\\S]*?<\\/script>`,
  );
  if (!pattern.test(html)) fail(`Could not find managed ${script.marker} script block.`);
  return html.replace(
    pattern,
    `<script ${script.attribute}>\n/* ${script.marker}:start */\n${source}\n/* ${script.marker}:end */\n  </script>`,
  );
}

const resourcesDir = join(root, htmlResources);
const cssPath = join(resourcesDir, reportCssName);
const htmlPath = join(resourcesDir, reportTemplateName);
if (!existsSync(htmlPath)) fail(`Missing HTML resource ${htmlPath}`);

const styleBlock = buildStyleBlock(compileCss(cssPath, reportConfig), reportCssName);
const html = readFileSync(htmlPath, 'utf8');
let nextHtml = html.replace(/<style(?:\s+[^>]*)?>[\s\S]*?\n\s*<\/style>/, styleBlock);
for (const script of sharedScripts) nextHtml = inlineSharedScript(nextHtml, script);

if (nextHtml === html) {
  console.log(`✓ ${reportTemplateName} assets are current`);
  console.log('All HTML report assets are up to date.');
} else if (checkOnly) {
  console.error(`✗ ${reportTemplateName} has stale compiled assets. Run \`npm run build:report-css\`.`);
  process.exit(1);
} else {
  writeFileSync(htmlPath, nextHtml);
  console.log(`✓ rebuilt ${reportTemplateName} from ${reportCssName} and shared runtimes`);
}
