# Renderer Workflow

Use the bundled build-time Excalidraw renderer for every diagram. Resolve `<system-diagram-dir>` from the directory containing the loaded `SKILL.md`.

## Outputs

Keep regeneration source near the consuming document:

```text
docs/features/{feature}/diagrams/{name}.json
docs/features/{feature}/diagrams/{name}.svg
```

## Build

Create an explicitly positioned JSON scene, then run:

```bash
node "<system-diagram-dir>/scripts/render-excalidraw-diagram.mjs" spec.json output.svg
node "<system-diagram-dir>/scripts/render-excalidraw-diagram.mjs" --check spec.json output.svg
```

The renderer provides coordinated rough geometry, embedded Virgil, semantic text, accessibility metadata, stable review IDs, labelled edge groups, provenance, and reading-order wrappers.

## Scene layout defaults

- Arrange the main explanation top to bottom.
- Wrap text first, then size nodes with about 24px internal padding.
- Leave about 56px between node bounds, increasing gaps for labels and routed turns.
- Route arrows through whitespace with clear approach/departure and arrowheads.
- Place edge labels above opaque/paper backgrounds with padding.
- Remove crossings and collisions before increasing density.
- Split when legibility would require smaller text or tighter spacing.

Horizontal composition is an exception for comparisons, ownership lanes, or causal fan-out.

`reviewId`/`reviewIds` are namespace-relative suffixes. Use `reviewPrefix` plus a unique required scene `id` when several diagrams are inlined.

## Preserve when embedding

- `<!-- svg-source:excalidraw -->` provenance;
- root `role="img"`, `aria-labelledby`, `<title>`, and `<desc>`;
- searchable text and embedded fonts;
- stable `data-review-id` groups;
- foreground edge-label groups;
- `.diagram-reveal` wrappers and authored delay order;
- label backgrounds and explicit routes.

Do not apply `.path-draw` to coordinated multi-stroke Excalidraw edges.

## Validate

Run the renderer `--check`, then inspect mobile overflow, node padding, vertical spacing, arrowhead clearance, label collisions, print scaling, static/no-JS visibility, and reduced motion. The consuming `html-report-designer` validator checks embedded provenance and report-level accessibility.
