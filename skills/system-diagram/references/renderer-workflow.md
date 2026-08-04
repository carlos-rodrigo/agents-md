# Renderer Workflow

Use the bundled deterministic System Diagram renderer for every diagram. Resolve `<system-diagram-dir>` from the directory containing the loaded `SKILL.md`.

## Outputs

Keep regeneration source near the consuming document:

```text
docs/features/{feature}/diagrams/{name}.json
docs/features/{feature}/diagrams/{name}.svg
```

## Build

Create an explicitly positioned `system-diagram-v1` JSON document, then run:

```bash
node "<system-diagram-dir>/scripts/render-system-diagram.mjs" spec.json output.svg
node "<system-diagram-dir>/scripts/render-system-diagram.mjs" --check spec.json output.svg
```

The renderer provides exact geometry, embedded component CSS, searchable semantic text, accessibility metadata, stable review IDs, labelled edge groups, provenance, and reading-order wrappers. It needs Node.js only—no browser export stage or runtime package installation.

## Source contract

The renderer, not each scene, owns fonts, color, node surfaces, shadows, grid, arrowheads, and semantic states. Source JSON supplies:

- `schemaVersion: "system-diagram-v1"`;
- one stable diagram `id`, title, and description;
- optional boundary/ownership groups;
- explicitly positioned nodes with semantic `kind`;
- orthogonally routed edge points with semantic `kind` and effect-bearing labels;
- optional exact edge `labelPosition` only when automatic placement is unclear;
- review IDs and optional reveal order.

The source validator requires explicit non-empty title/description, XML-safe text, 14px-or-larger authored type, non-zero orthogonal segments, and endpoints attached to the declared node boundaries. It also rejects labels that collide with any node. Add route whitespace first; use `labelPosition` only for a deliberate collision-free placement.

Do not add scene-local fill, stroke, roughness, font, arbitrary CSS, or SVG fragments. Unsupported fields fail validation instead of creating a second visual language.

## Scene layout defaults

- Arrange the main explanation top to bottom.
- Use a horizontal path only for comparisons, ownership lanes, or a real causal fan-out.
- Wrap text first, then size nodes with about 20–24px internal padding.
- Leave about 56px between node bounds, increasing gaps for labels and routed turns.
- Route arrows through whitespace with clear approach/departure and arrowheads.
- Place edge labels above routes or beside vertical routes on opaque white surfaces.
- Use ownership groups only when the boundary changes understanding.
- Remove crossings and collisions before increasing density.
- Split when legibility would require smaller text or tighter spacing.

The visual baseline follows Vercel infrastructure storytelling: white canvas, quiet grid, mostly white nodes, neutral boundaries, one blue primary path, and restrained semantic exception colors.

`reviewId`/`reviewIds` are namespace-relative suffixes. Use `reviewPrefix` plus a unique required scene `id` when several diagrams are inlined.

## Preserve when embedding

- `<!-- svg-source:system-diagram -->` provenance;
- exact raw-source `svg-spec-sha256` digest and `data-diagram-style="infrastructure-v1"`;
- root `role="img"`, `aria-labelledby`, `<title>`, and `<desc>`;
- searchable text and embedded CSS;
- stable `data-review-id` groups;
- foreground edge-label groups;
- `.diagram-reveal` wrappers and authored delay order;
- label surfaces and explicit routes.

## Validate

Run the renderer `--check`; it compares the complete generated SVG file byte-for-byte, including its final newline. Then inspect desktop, 320px overflow, node padding, vertical spacing, arrowhead clearance, label collisions, print scaling, static/no-JS visibility, and reduced motion. The consuming `html-report-designer` validator checks embedded provenance, exact renderer output, and report-level accessibility.
