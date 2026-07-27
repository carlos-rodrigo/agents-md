#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const source = readFileSync(resolve(root, 'skills/html-report-designer/resources/artifact-motion.js'), 'utf8');

const normal = run({ reduced: false, observerAvailable: true });
assert(normal.rootClasses.has('js'), 'runtime should mark JavaScript enhancement availability');
assert(normal.items.every((item) => !item.classes.has('is-visible')), 'items should wait for intersection in motion mode');
assert(normal.observed.length === normal.items.length, 'observer should watch every reveal item');
normal.observerCallback([{ target: normal.items[0], isIntersecting: true }]);
assert(normal.items[0].classes.has('is-visible'), 'intersecting item should become visible');
assert(normal.unobserved.includes(normal.items[0]), 'visible item should be unobserved');
normal.listeners.get('beforeprint')?.();
assert(normal.items.every((item) => item.classes.has('is-visible')), 'printing should reveal all content');

for (const options of [
  { reduced: true, observerAvailable: true },
  { reduced: false, observerAvailable: false },
]) {
  const result = run(options);
  assert(result.items.every((item) => item.classes.has('is-visible')), 'reduced-motion and observer fallback should show all content');
  assert(result.observed.length === 0, 'fallback mode should not observe hidden content');
}

console.log('PASS: shared artifact motion reveals on intersection and shows all content for reduced-motion/no-observer fallbacks');

function run({ reduced, observerAvailable }) {
  const rootClasses = new Set();
  const items = [makeItem(), makeItem()];
  const observed = [];
  const unobserved = [];
  let observerCallback;
  const listeners = new Map();
  const window = {
    matchMedia: () => ({ matches: reduced }),
    addEventListener: (name, handler) => listeners.set(name, handler),
  };

  if (observerAvailable) {
    window.IntersectionObserver = class {
      constructor(callback) { observerCallback = callback; }
      observe(item) { observed.push(item); }
      unobserve(item) { unobserved.push(item); }
    };
  }

  const context = {
    document: {
      documentElement: { classList: { add: (name) => rootClasses.add(name) } },
      querySelectorAll: (selector) => {
        assert(selector === '.reveal', `unexpected selector: ${selector}`);
        return items;
      },
    },
    window,
    IntersectionObserver: window.IntersectionObserver,
  };
  vm.runInNewContext(source, context);
  return { rootClasses, items, observed, unobserved, observerCallback, listeners };
}

function makeItem() {
  const classes = new Set();
  return { classes, classList: { add: (name) => classes.add(name) } };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
