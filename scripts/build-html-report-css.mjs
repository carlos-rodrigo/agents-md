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
const restoredReportConfig = join(root, 'scripts/restored-report-tailwind.config.cjs');
const defaultConfig = join(root, 'tailwind.config.cjs');
const groups = [
  {
    dir: htmlResources,
    css: 'report.tailwind.css',
    html: ['report-template.html'],
    config: restoredReportConfig,
  },
  {
    dir: htmlResources,
    css: 'prd.tailwind.css',
    html: ['prd-template.html'],
    config: restoredReportConfig,
  },
  {
    dir: htmlResources,
    css: 'design.tailwind.css',
    html: ['design-template.html'],
    config: restoredReportConfig,
  },
  {
    dir: 'skills/system-diagram/resources',
    css: 'system-diagram.tailwind.css',
    html: ['system-diagram-template.html'],
    config: defaultConfig,
  },
];
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

let changed = false;
for (const group of groups) {
  const resourcesDir = join(root, group.dir);
  const cssPath = join(resourcesDir, group.css);
  const css = compileCss(cssPath, group.config);
  const styleBlock = buildStyleBlock(css, group.css);

  for (const htmlName of group.html) {
    const htmlPath = join(resourcesDir, htmlName);
    if (!existsSync(htmlPath)) fail(`Missing HTML resource ${htmlPath}`);
    const html = readFileSync(htmlPath, 'utf8');
    let nextHtml = html.replace(/<style(?:\s+[^>]*)?>[\s\S]*?\n\s*<\/style>/, styleBlock);
    for (const script of sharedScripts) nextHtml = inlineSharedScript(nextHtml, script);

    if (nextHtml === html) {
      console.log(`✓ ${htmlName} assets are current`);
      continue;
    }

    changed = true;
    if (checkOnly) {
      console.error(`✗ ${htmlName} has stale compiled assets. Run \`npm run build:report-css\`.`);
    } else {
      writeFileSync(htmlPath, nextHtml);
      console.log(`✓ rebuilt ${htmlName} from ${group.css} and shared runtimes`);
    }
  }
}

if (checkOnly && changed) process.exit(1);
if (!changed) console.log('All HTML report assets are up to date.');
