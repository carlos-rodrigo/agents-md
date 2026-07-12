#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve } from 'node:path';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { assertSelfContainedSvg, normalizeSpec } from './excalidraw-diagram-spec.mjs';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const stdoutOnly = args.includes('--stdout');
const positional = args.filter((arg) => !arg.startsWith('--'));

if (args.includes('--help') || positional.length < 1 || (!stdoutOnly && positional.length < 2)) {
  console.log(`Usage: render-excalidraw-diagram.mjs [--check] [--stdout] <diagram.json> [output.svg]

Build-time authentic Excalidraw renderer for self-contained report diagrams.
The JSON scene defines explicitly positioned nodes and routed arrows. Output keeps
searchable SVG text, embedded fonts, accessibility metadata, and review IDs.`);
  process.exit(args.includes('--help') ? 0 : 2);
}

const root = resolve(import.meta.dirname, '..');
const inputPath = resolve(positional[0]);
const outputPath = positional[1] ? resolve(positional[1]) : null;
const spec = normalizeSpec(JSON.parse(readFileSync(inputPath, 'utf8')));
const svg = await renderExcalidrawDiagram(spec);

if (stdoutOnly) {
  process.stdout.write(`${svg}\n`);
  process.exit(0);
}

if (checkOnly) {
  if (!existsSync(outputPath)) {
    console.error(`✗ ${outputPath} is missing. Render it before checking.`);
    process.exit(1);
  }
  const current = readFileSync(outputPath, 'utf8');
  if (current.trim() !== svg.trim()) {
    console.error(`✗ ${outputPath} is stale. Run \`node scripts/render-excalidraw-diagram.mjs ${positional[0]} ${positional[1]}\`.`);
    process.exit(1);
  }
  console.log(`✓ ${outputPath} is current`);
  process.exit(0);
}

writeFileSync(outputPath, `${svg}\n`);
console.log(`✓ rendered ${outputPath}`);

async function renderExcalidrawDiagram(rawSpec) {
  const bundle = await buildBrowserExporter();
  const executablePath = chromium.executablePath();
  if (!existsSync(executablePath)) {
    throw new Error('Pinned Playwright Chromium is missing. Run `npx playwright install chromium`.');
  }
  const assetServer = await startAssetServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    await page.route('**/*', async (route) => {
      const requestUrl = route.request().url();
      const protocol = new URL(requestUrl).protocol;
      if ((protocol === 'http:' || protocol === 'https:') && !requestUrl.startsWith(assetServer.origin)) {
        await route.abort('blockedbyclient');
      } else {
        await route.continue();
      }
    });
    await page.addInitScript((path) => { window.EXCALIDRAW_ASSET_PATH = path; }, `${assetServer.origin}/assets/`);
    await page.goto(assetServer.origin);
    await page.addScriptTag({ content: bundle });
    const svg = await page.evaluate((spec) => window.renderExcalidrawDiagram(spec), rawSpec);
    assertSelfContainedSvg(svg);
    return svg;
  } finally {
    await browser?.close();
    await assetServer.close();
  }
}

async function startAssetServer() {
  const assetRoot = resolve(root, 'node_modules/@excalidraw/excalidraw/dist/prod');
  const stage = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Excalidraw export stage</title></head><body></body></html>';
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    if (url.pathname === '/') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(stage);
      return;
    }
    if (!url.pathname.startsWith('/assets/')) {
      response.writeHead(404).end();
      return;
    }
    const filePath = resolve(assetRoot, decodeURIComponent(url.pathname.slice('/assets/'.length)));
    if (!filePath.startsWith(`${assetRoot}/`) || !existsSync(filePath)) {
      response.writeHead(404).end();
      return;
    }
    const contentType = extname(filePath) === '.woff2' ? 'font/woff2' : 'application/octet-stream';
    response.writeHead(200, { 'content-type': contentType });
    response.end(readFileSync(filePath));
  });
  await new Promise((done, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', done);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('could not start the local Excalidraw asset server');
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((done, reject) => server.close((error) => error ? reject(error) : done())),
  };
}

async function buildBrowserExporter() {
  const result = await build({
    entryPoints: [resolve(root, 'scripts/excalidraw-export-browser.js')],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: {
      '.woff2': 'dataurl',
      '.ttf': 'dataurl',
      '.png': 'dataurl',
      '.svg': 'dataurl',
    },
    logLevel: 'silent',
  });
  const javascript = result.outputFiles[0];
  if (!javascript) throw new Error('esbuild did not produce the Excalidraw browser bundle');
  return javascript.text;
}
