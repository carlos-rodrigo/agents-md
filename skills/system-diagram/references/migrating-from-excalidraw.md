# Migrating Retained Diagram Sources

Use this recipe when a project still has JSON authored for the former Excalidraw export backend. Migrate source once, render with the bundled System Diagram renderer, and review the new geometry; do not patch the generated SVG.

## 1. Preserve meaning before style

Record the existing diagram question, evidence, node/edge meaning, uncertainty, walkthrough, and stable review IDs. The migration changes rendering and source shape—not product or architecture semantics.

## 2. Convert the root contract

- Add `"schemaVersion": "system-diagram-v1"`.
- Keep `id`, `title`, `desc`, `reviewPrefix`, `reviewId`, `padding`, `nodes`, and `edges`.
- Replace `backgroundColor` with `"canvas": { "grid": true }` when the quiet technical grid helps.
- Remove legacy `version`, font, roughness, fill, stroke, and browser-export fields.
- Keep `title` and `desc` explicit; the new schema does not invent accessibility text.

## 3. Map semantics, not colors

Node `kind` values:

```text
default · entry · service · domain · repository · policy
decision · feedback · success · warning · risk
```

Edge `kind` values:

```text
primary · secondary · boundary · feedback · success · warning · risk
```

Use `primary` for the one blue causal route. Use neutral boundaries and secondary relations unless warning, risk, proof, or recovery changes the explanation. The renderer owns all actual colors and CSS.

## 4. Recheck geometry

Every edge must:

- contain non-zero orthogonal segments;
- begin on its declared `from` node boundary;
- end on its declared `to` node boundary;
- leave enough whitespace for its label.

Wrap node text with explicit newlines, keep authored text at 14px or larger, and enlarge the node when validation reports text overflow. Add optional `groups` only for ownership or boundaries that change understanding.

## 5. Render and verify

```bash
node "<system-diagram-dir>/scripts/render-system-diagram.mjs" \
  path/to/diagram.json path/to/diagram.svg
node "<system-diagram-dir>/scripts/render-system-diagram.mjs" --check \
  path/to/diagram.json path/to/diagram.svg
```

Then regenerate the consuming report and inspect desktop, local narrow overflow, no-JS, reduced-motion, and print. Expected output contains:

```text
<!-- svg-source:system-diagram -->
data-diagram-style="infrastructure-v1"
```

The report renderer additionally records an output digest so standalone validation detects modified embedded SVG.

## 6. Remove the old setup

After all retained diagrams are current:

- remove old Excalidraw renderer scripts and package dependencies;
- update report source paths if example files were renamed;
- run the repository regression gate under the oldest supported Node.js version.

Old generated HTML may remain readable as history, but it is not current canonical output.
