# Renderer Workflow

Use the existing build-time Excalidraw renderer for every diagram. Do not rewrite or bypass its API, hand-author the final SVG, or use an alternative renderer.

## Outputs

Preferred locations:

```text
docs/features/{feature}/prd.html
docs/features/{feature}/design.html
docs/features/{feature}/diagrams/{name}.html
docs/architecture/{name}.html
```

## Build

Create an explicitly positioned JSON scene, then run:

```bash
node /Users/carlosrodrigo/agents/scripts/render-excalidraw-diagram.mjs spec.json output.svg
```

The renderer provides coordinated rough geometry, embedded Virgil, semantic text, accessibility metadata, stable review IDs, labelled edge groups, provenance, and reading-order wrappers.

## Scene layout defaults

Before rendering an Excalidraw scene:

- arrange the main explanation from top to bottom;
- wrap text first, then size nodes with about 24px or more internal padding;
- leave about 56px or more between node bounds, increasing the gap for edge labels or routed turns;
- route arrows outside content with visible approach/departure segments and clear arrowheads;
- place edge labels above opaque/paper-colored backgrounds with padding;
- remove crossings and collisions before increasing canvas density;
- split the figure when legibility would otherwise require smaller text or tighter spacing.

Horizontal composition is an exception for comparisons, ownership lanes, or causal fan-out—not the default.

`reviewId`/`reviewIds` are namespace-relative suffixes. Use `reviewPrefix` plus a unique required `id` when several diagrams are inlined.

## Preserve when embedding

- `<!-- svg-source:excalidraw -->` provenance;
- root `role="img"`, `aria-labelledby`, `<title>`, and `<desc>`;
- searchable text;
- stable `data-review-id` groups;
- edge-label groups in the foreground;
- `.diagram-reveal` wrappers and authored delay order;
- label backgrounds and explicit routes.

Do not apply `.path-draw` to exported coordinated multi-stroke edge groups.

## Validate

From `/Users/carlosrodrigo/agents`:

```bash
npm run check:report-css
node scripts/validate-html-report.mjs path/to/finished-diagram.html
```

Use `--allow-placeholders` only for template validation. Inspect mobile overflow, node padding, vertical spacing, arrowhead clearance, label collisions, print scaling, static/no-JS visibility, and reduced motion in a browser.
