#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cssPath = resolve(root, 'resources/report.tailwind.css');
const args = process.argv.slice(2);
const check = args[0] === '--check';
if (check) args.shift();
const [inputPath, outputPath = inputPath] = args;
if (!inputPath) throw new Error('Usage: render-mockup.mjs [--check] input.html [output.html]');

const html = readFileSync(inputPath, 'utf8');
for (const [pattern, label] of [[/<main\b[^>]*class=["'][^"']*\bmockup-shell\b/i, 'main.mockup-shell'], [/<div\b[^>]*class=["'][^"']*\bmockup-banner\b/i, 'div.mockup-banner'], [/<header\b[^>]*class=["'][^"']*\bmockup-title\b/i, 'header.mockup-title'], [/<div\b[^>]*class=["'][^"']*\bscreen-label\b/i, 'div.screen-label'], [/<section\b[^>]*class=["'][^"']*\bapp-window\b/i, 'section.app-window']]) {
  if (!pattern.test(html)) throw new Error(`Mockup requires ${label} Editorial Infrastructure shell hook`);
}
if ((html.match(/<h1\b/gi) ?? []).length !== 1) throw new Error('Mockup requires exactly one h1');
const css = readFileSync(cssPath, 'utf8').trim();
const digest = createHash('sha256').update(css).digest('hex');
const bridge = `:root {
  --paper: var(--page) !important; --ink: var(--text) !important; --muted: var(--text-muted) !important; --line: var(--border) !important;
  --green: var(--accent-strong) !important; --green-soft: var(--accent-soft) !important; --clay: var(--danger) !important; --clay-soft: var(--danger-soft) !important; --card: var(--surface) !important;
}
body[data-visual-mode="editorial-infrastructure-v1"] {
  background: var(--page) !important;
  background-image: linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px) !important;
  background-size: 24px 24px !important; color: var(--text) !important; font-family: var(--sans) !important;
}
.mockup-shell { width: min(1300px, calc(100% - 32px)) !important; max-width: 1300px !important; margin: 32px auto 72px !important; padding: 0 !important; }
.mockup-banner { padding: 13px 18px !important; border-bottom: 1px solid var(--border) !important; color: var(--text-subtle) !important; font: 700 11px/1.3 var(--mono) !important; letter-spacing: .06em !important; }
.mockup-banner .proposed { color: var(--danger) !important; }
.mockup-title { margin: 0 !important; padding: clamp(40px, 6vw, 76px) !important; border-bottom: 1px solid var(--border-strong) !important; }
.mockup-title h1 { max-width: 1040px !important; margin: 0 !important; color: var(--text) !important; font: 400 clamp(44px, 5.5vw, 76px)/.98 var(--sans) !important; letter-spacing: -.055em !important; }
.mockup-title p { max-width: 820px !important; margin: 24px 0 0 !important; color: var(--text-muted) !important; font: 400 clamp(18px, 1.6vw, 22px)/1.42 var(--sans) !important; }
.screen-label { margin: 0 !important; padding: 40px 0 12px !important; color: var(--accent) !important; font: 750 11px/1.3 var(--mono) !important; letter-spacing: .07em !important; }
.app-window { border: 1px solid var(--border) !important; border-radius: 0 !important; background: var(--page) !important; box-shadow: none !important; }
.app-chrome, .main-canvas, .record, .map-caption { background-color: var(--page) !important; }
.context-nav { background-color: var(--surface-subtle) !important; }
.global-nav { background-color: #171717 !important; }
.context-item.active { background-color: var(--surface) !important; color: var(--text) !important; }
.attention, .attention strong { color: var(--text) !important; }
.main-head h2, .farm-mini h3, .state-value, .record h3, .timeline-head h3 { font-family: var(--sans) !important; letter-spacing: -.035em !important; }
@media (max-width: 680px) {
  .mockup-shell { width: min(100% - 20px, 680px) !important; margin-top: 10px !important; }
  .mockup-title { padding: 32px 22px !important; }
  .mockup-title h1 { font-size: 42px !important; }
}`;
const managed = `<style data-editorial-infrastructure="v1" data-editorial-infrastructure-sha256="${digest}">\n/* editorial-infrastructure:start */\n${css}\n/* mockup-editorial-bridge:start */\n${bridge}\n/* mockup-editorial-bridge:end */\n/* editorial-infrastructure:end */\n</style>`;
const marker = /<style\s+data-editorial-infrastructure="v1"[^>]*>[\s\S]*?<\/style>/;
const withoutManaged = html.replace(/\s*<style\s+data-editorial-infrastructure="v1"[^>]*>[\s\S]*?<\/style>\s*/i, '\n').replace(/\n{3,}/g, '\n\n');
const withVisualMode = /<body\b[^>]*>/i.test(withoutManaged)
  ? withoutManaged.replace(/<body\b([^>]*)>/i, (match, attributes) => /data-visual-mode\s*=/.test(attributes) ? match : `<body${attributes} data-visual-mode="editorial-infrastructure-v1">`)
  : withoutManaged;
const normalizedHead = withVisualMode.replace(/\s*<\/head>/i, '</head>');
const rendered = normalizedHead.replace(/<\/head>/i, `\n  ${managed}\n</head>`);
if (rendered === withoutManaged && !/<head(?:\s[^>]*)?>/i.test(html)) throw new Error('Mockup must contain a <head> element');
if (check) {
  if (outputPath !== inputPath) throw new Error('--check accepts only one input path');
  if (rendered !== html) throw new Error(`Mockup is stale. Run ${process.argv[1]} ${inputPath}`);
  console.log(`✓ ${inputPath} uses Editorial Infrastructure v1 (${digest})`);
} else {
  writeFileSync(outputPath, rendered);
  console.log(`✓ rendered ${outputPath} with Editorial Infrastructure v1 (${digest})`);
}
