#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(root, 'skills');
const skill = (name) => readFileSync(join(skillsDir, name, 'SKILL.md'), 'utf8');
const skillNames = readdirSync(skillsDir).filter((name) => existsSync(join(skillsDir, name, 'SKILL.md')));

for (const name of skillNames) {
  const file = join(skillsDir, name, 'SKILL.md');
  const content = readFileSync(file, 'utf8');
  assert(/^---\n[\s\S]*?\n---\n/.test(content), `${name}: SKILL.md frontmatter must open and close with ---`);
  for (const [, link] of content.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(?:https?:|mailto:|#)/.test(link)) continue;
    assert(existsSync(resolve(dirname(file), link.split('#')[0])), `${name}: missing linked resource ${link}`);
  }
  for (const removed of ['prd', 'design-solution', 'html-report-designer', 'system-diagram', 'what-we-are-going-to-build', 'how-we-are-going-to-build-it', 'implement-task', 'loop', 'improve-architecture', 'code-un-slopify', 'un-slopify', 'review-pr']) {
    assert(!content.includes('`' + removed + '`'), `${name}: references removed skill ${removed}`);
  }
  assert(!/document\.json|canonical-report|prd\.html|design\.html/.test(content), `${name}: references the removed JSON/HTML report flow`);
}

for (const removed of ['improve-architecture', 'code-un-slopify', 'un-slopify', 'review-pr']) {
  assert(!existsSync(join(skillsDir, removed)), `${removed} skill must be removed`);
}

console.log('PASS: skill frontmatter, linked resources, and no references to removed skills');
