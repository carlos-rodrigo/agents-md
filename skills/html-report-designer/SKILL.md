---
name: html-report-designer
description: "Render approved PRD, design, diagram, research, report, or decision content through one portable self-contained HTML report template. Use for canonical DocumentSpec validation, report components, navigation, decision recorders, accessibility, responsive behavior, motion enhancement, print, and deterministic regeneration. Do not decide product or architecture content."
compatibility: "Requires Node.js 18+ and filesystem access. Non-diagram rendering has no runtime dependencies; diagram reports require the sibling System Diagram skill and its installed package. CSS rebuild and browser checks use the repository toolchain."
---

# HTML Report Designer

Render approved meaning through one canonical container. This skill owns HTML, CSS, components, navigation, review controls, accessibility, portability, and validation—not product requirements, architecture choices, or diagram semantics.

Default artifacts:

```text
docs/features/{feature}/{prd|design}.document.json
docs/features/{feature}/{prd|design}.html
```

## Sole rendering boundary

Every new durable report uses:

```text
resources/report-template.html
resources/report.tailwind.css
resources/canonical-report-v1.schema.json
scripts/render-canonical-report.mjs
scripts/validate-html-report.mjs
```

Resolve each path against the directory containing this loaded `SKILL.md`. Never assume the caller's repository contains the renderer. Do not copy a template into the target project, hand-author a shell, add document-local CSS, or patch rendered HTML.

`report-template.html` is the only production template for PRDs, designs, diagram packets, research briefs, reports, and decision packets. Document kind changes structured content and validation—not the shell, style family, or runtime.

## Ownership

- `prd` owns product truth, required PRD roles, slices, acceptance, and product decisions.
- `design-solution` owns architecture truth, required design roles, decisions, and ADR consequences.
- `system-diagram` owns evidence validation and Excalidraw JSON→SVG generation.
- This skill owns the report frame and rendering of already-approved structured blocks.

A consuming skill supplies section roles, stable IDs, approved facts, decision lifecycle, and Excalidraw source/output paths. This skill must not add, remove, reorder, or multiply substantive content to fill a component.

## DocumentSpec

Author `canonical-report-v1` JSON against `resources/canonical-report-v1.schema.json`. The bundled runtime additionally enforces:

- strict unknown-field rejection;
- stable unique review IDs;
- explicit approval metadata for Approved documents;
- required PRD/design section roles in their owning skill's declared order;
- complete PRD product slices;
- exactly one Excalidraw diagram in its owning `diagram` role for substantive PRDs, designs, and standalone diagram packets;
- at least one architecture decision for designs;
- accepted decisions in Approved documents;
- Excalidraw JSON/SVG provenance at render time.

Use `resources/report-example.document.json` only as a block-shape example, never as a section inventory.

## Canonical components

The renderer provides structured blocks for:

- paragraphs, lists, facts, steps, callouts, quotes, and code;
- Given/When/Then scenarios;
- product slices with compact story traceability, BDD Given/When/Then scenarios, observable sequences, acceptance, and after-slice outcomes;
- decision recorders with options, custom answer, rationale, owner, lifecycle, checkbox, persistence, and Markdown export;
- Excalidraw figures with question, caption, stable anchors, and ordered walkthrough.

Add a new block type only when a current approved document cannot express required meaning with existing blocks. A component is not a reason to create content.

## Decision recorder contract

Every `decision` block renders a **Decision recorded** checkbox.

- Open/Proposed controls require a selected option or custom answer, rationale, and owner before recording.
- Browser state persists locally and exports a Markdown review record tied to the exact decision-source fingerprint; changed decision meaning invalidates prior recorded state.
- Browser recording is review input only; it never changes the source JSON, rendered HTML, approval status, or ADR.
- Accepted decisions render checked and read-only, and require canonical approver/date metadata.
- Consuming skills reconcile exported stable IDs into canonical source only after explicit human approval.

## Diagram contract

A report `diagram` block references an Excalidraw JSON source and its generated SVG. A standalone `document.kind: "diagram"` packet must contain exactly one such block under its `diagram` section role. The renderer embeds the SVG only when it contains `<!-- svg-source:excalidraw -->`, the exact retained-JSON source digest, accessible SVG metadata, a valid source scene, and byte-exact output verified by the sibling bundled Excalidraw renderer. It never draws, lays out, or semantically changes a diagram.

## UX contract

Every report is:

1. **Glanceable** — title, status, summary, review focus, and approval state appear first.
2. **Navigable** — one collapsible sticky index generated from actual sections.
3. **Scannable** — descriptive headings and bounded components support retrieval.
4. **Reviewable** — stable conceptual `data-review-id` anchors and portable decision exports.
5. **Truthful** — facts, assumptions, risks, proposals, and accepted decisions remain distinct.
6. **Portable** — self-contained HTML with no network or runtime dependency.
7. **Accessible** — semantic landmarks, keyboard focus, contrast, text equivalents, reduced motion, no-JS visibility, and print completeness.

Motion is optional progressive enhancement. Static source order is complete. Never blur meaning-bearing text, require JavaScript for content, or add decorative motion.

## Workflow

1. Receive approved structured content from its owning skill.
2. Validate section roles, IDs, approval/decision state, and diagram JSON/SVG references.
3. Render from any project working directory:

```bash
node "<html-report-designer-dir>/scripts/render-canonical-report.mjs" \
  path/to/document.json path/to/report.html
node "<html-report-designer-dir>/scripts/validate-html-report.mjs" \
  path/to/report.html
node "<html-report-designer-dir>/scripts/render-canonical-report.mjs" --check \
  path/to/document.json path/to/report.html
```

4. Inspect desktop, 320px, keyboard, no-JS, reduced-motion, print, and diagram overflow when browser tooling exists.
5. Fix source JSON, the owning content skill, or this shared renderer. Never fix one generated HTML file directly.

## Quality gate

- One canonical template, CSS source, renderer, schema, and runtime path exist.
- Template digest and embedded DocumentSpec validate; durable HTML byte-matches adjacent structured source.
- Exactly one h1, skip link, main landmark, heading order, review-ID uniqueness, self-containment, and print styles pass.
- Required PRD/design profile behavior passes without teaching the renderer new product or architecture facts.
- Every decision recorder has complete lifecycle controls and export behavior.
- Every substantive PRD/design embeds only renderer-produced Excalidraw SVG with retained JSON source.
- Clean-copy rendering and validation pass from an unrelated working directory.
- Generated HTML regenerates byte-for-byte.

## Output

```text
DocumentSpec/report: {json path} · {html path}
Kind/status: {kind} · {status}
Template: canonical-report-v1
Decisions: {count + lifecycle states}
Diagram provenance: {Excalidraw JSON/SVG | none for non-PRD/design report}
Validation: {passed | failed + issue | not run + reason}
Opened: {yes | no + reason}
Next review action: {action}
```
