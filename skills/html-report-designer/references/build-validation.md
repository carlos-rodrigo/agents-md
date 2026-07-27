# Build and Validation

Run commands from `/Users/carlosrodrigo/agents` unless the project owns equivalent tooling.

## CSS

Edit source files:

```text
skills/html-report-designer/resources/report.tailwind.css
skills/html-report-designer/resources/prd.tailwind.css
skills/html-report-designer/resources/design.tailwind.css
skills/system-diagram/resources/system-diagram.tailwind.css
```

Rebuild inline CSS:

```bash
npm run build:report-css
npm run check:report-css
```

Use Tailwind only at build time. Finished artifacts do not use the CDN or remote CSS.

## Motion runtime

The report build inlines the shared native artifact runtime from:

```text
skills/html-report-designer/resources/artifact-motion.js
```

Do not paste divergent copies or add a motion dependency. The shared runtime is native, optional, and inlined by `npm run build:report-css`. Record the semantic motif, static fallback, reduced-motion result, and verification in artifact provenance when motion is used.

## Diagrams

For justified Excalidraw figures, create an explicitly positioned scene and run:

```bash
node scripts/render-excalidraw-diagram.mjs spec.json output.svg
```

Inspect labels, routes, mobile overflow, print size, accessibility metadata, provenance, and reveal order before inlining.

## Validation

Finished reports:

```bash
node scripts/validate-html-report.mjs docs/features/{feature}/prd.html
node scripts/validate-html-report.mjs docs/features/{feature}/design.html
```

Use `--allow-placeholders` only for templates.

Run the repository gate:

```bash
bash scripts/verify.sh
```

## Browser review

Open the final file and inspect normal, narrow, short-height, enlarged-text, reduced-motion, no-JS, JS-stripped review, and print modes. For a JS-stripped check, remove source `<script>` elements into a temporary copy or load the artifact through the actual review harness; then verify that CSS motion or static/native source order remains complete. A validator cannot prove hierarchy, useful motion, fallback behavior, diagram legibility, or subject-specific visual quality.

```bash
open docs/features/{feature}/prd.html
open docs/features/{feature}/design.html
```

Record commands/results, manual observations, skipped checks, and remaining risk.
