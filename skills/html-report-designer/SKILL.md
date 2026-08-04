---
name: html-report-designer
description: "Render source-owned, authority-classified PRD, design, diagram, research, report, or decision content through one portable self-contained HTML report template. Use for canonical DocumentSpec validation, report components, navigation, decision recorders, accessibility, responsive behavior, motion enhancement, print, and deterministic regeneration. Do not decide product or architecture content."
compatibility: "Requires Node.js 18+ and filesystem access. Diagram reports require the sibling System Diagram skill; both renderers are dependency-free at runtime. CSS rebuild and browser checks use the repository toolchain."
---

# HTML Report Designer

Render source-owned, authority-classified meaning through one canonical container. This skill owns HTML, CSS, components, navigation, review controls, accessibility, portability, and validation—not product requirements, architecture choices, or diagram semantics.

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
scripts/render-mockup.mjs
scripts/validate-html-report.mjs
```

Resolve each path against the directory containing this loaded `SKILL.md`. Never assume the caller's repository contains the renderer. Do not copy a template into the target project, hand-author a shell, add document-local CSS, or patch rendered HTML.

`report-template.html` is the only production template for PRDs, designs, diagram packets, research briefs, reports, and decision packets. Document kind changes structured content and validation—not the shell, style family, or runtime. The approved global visual language is **Editorial Infrastructure**: a pure-white square-grid canvas in light mode, a system-preference dark canvas, an oversized editorial title, numbered chapter rail, brief-ledger facts, inline semantic decisions, and full-width infrastructure figures. Print always returns to the white light palette.

## Ownership

- `prd` owns product truth, required PRD roles, slices, acceptance, and product decisions.
- `design-solution` owns architecture truth, required design roles, decisions, and ADR consequences.
- `system-diagram` owns evidence validation and deterministic infrastructure-style JSON→SVG generation.
- This skill owns the report frame and rendering of source-owned structured blocks at Draft, Review, Approved, or Blocked status.

A consuming skill supplies section roles, stable IDs, authority-classified facts, decision lifecycle, and System Diagram source/output paths. This skill must not add, remove, reorder, or multiply substantive content to fill a component.

PRD-linked mockups remain separate artifacts but use the same Editorial Infrastructure visual language. Run `scripts/render-mockup.mjs` to inline the canonical CSS and record its SHA-256 digest; use `--check` before review. Product-specific mockup UI may add local components after the managed shared style block, but must not replace the canonical shell language with an unrelated palette, grid, typography, or motion system.

## DocumentSpec

Author `canonical-report-v1` JSON against `resources/canonical-report-v1.schema.json`. The bundled runtime additionally enforces:

- strict unknown-field rejection;
- stable unique review IDs;
- explicit approval metadata for Approved documents;
- required PRD/design section roles in their owning skill's declared order;
- complete PRD product slices;
- exactly one System Diagram in its owning `diagram` role for substantive PRDs, designs, and standalone diagram packets;
- at least one architecture decision for designs;
- accepted decisions in Approved documents;
- `system-diagram-v1` JSON/SVG provenance and exact renderer output at render time.

Use `resources/report-example.document.json` only as a block-shape example, never as a section inventory.

## Canonical components

The renderer provides structured blocks for:

- paragraphs, lists, facts, steps, callouts, quotes, and code;
- Given/When/Then scenarios;
- product slices with compact story traceability, BDD Given/When/Then scenarios, connected ordered workflows with explicit handoffs, acceptance, and after-slice outcomes;
- decision recorders with options, custom answer, rationale, owner, lifecycle, checkbox, persistence, and Markdown export;
- infrastructure-style SVG figures with question, caption, stable anchors, and ordered walkthrough.

Add a new block type only when a current document cannot express required meaning with existing blocks. A component is not a reason to create content.

## Decision recorder contract

Every `decision` block renders a **Decision recorded** checkbox.

- Open/Proposed controls require a selected option or custom answer, rationale, and owner before recording.
- Browser state persists locally and exports a Markdown review record tied to the exact decision-source fingerprint; changed decision meaning invalidates prior recorded state.
- Without JavaScript, non-accepted recording remains disabled with truthful fallback text; accepted decisions still show canonical approver/date.
- Browser recording is review input only; it never changes the source JSON, rendered HTML, approval status, or ADR.
- Accepted decisions render checked and read-only, and require canonical approver/date metadata.
- Consuming skills reconcile exported stable IDs into canonical source only after explicit human approval.

## Diagram contract

A report `diagram` block references a `system-diagram-v1` JSON source and its generated SVG. A standalone `document.kind: "diagram"` packet must contain exactly one such block under its `diagram` section role. The renderer embeds the SVG only when it contains `<!-- svg-source:system-diagram -->`, the exact raw-source digest, `data-diagram-style="infrastructure-v1"`, accessible SVG metadata, a valid source document, and byte-exact output verified by the sibling bundled renderer. The rendered figure records an output digest so standalone validation detects modified embedded SVG even when retained source is unavailable. It never draws, lays out, or semantically changes a diagram.

## UX contract

Every report is:

1. **Glanceable** — Editorial Infrastructure makes title, status, summary, review focus, and approval state lead the first viewport.
2. **Navigable** — one collapsible sticky index generated from actual sections.
3. **Scannable** — descriptive headings and bounded components support retrieval.
4. **Reviewable** — stable conceptual `data-review-id` anchors and portable decision exports.
5. **Truthful** — facts, assumptions, risks, proposals, and accepted decisions remain distinct.
6. **Portable** — self-contained HTML with no network or runtime dependency.
7. **Accessible** — semantic landmarks, keyboard focus, contrast, text equivalents, reduced motion, no-JS visibility, and print completeness.

Motion is optional progressive enhancement. Static source order is complete. Never blur meaning-bearing text, require JavaScript for content, or add decorative motion.

## Workflow

1. Receive source-owned, authority-classified structured content from its owning skill.
2. Validate section roles, IDs, approval/decision state, and diagram JSON/SVG references.
3. Render from any project working directory:

```bash
node "<html-report-designer-dir>/scripts/render-canonical-report.mjs" \
  path/to/document.json path/to/report.html
node "<html-report-designer-dir>/scripts/validate-html-report.mjs" \
  path/to/report.html
node "<html-report-designer-dir>/scripts/render-canonical-report.mjs" --check \
  path/to/document.json path/to/report.html
node "<html-report-designer-dir>/scripts/render-mockup.mjs" --check \
  path/to/mockups.html
```

4. Inspect desktop, 320px, keyboard, no-JS, reduced-motion, print, and diagram overflow when browser tooling exists.
5. Fix source JSON, the owning content skill, or this shared renderer. Never fix one generated HTML file directly.

## Quality gate

- One canonical template, Editorial Infrastructure CSS source, renderer, schema, and runtime path exist; light remains pure white, system dark mode is readable, and print remains white.
- Template digest and embedded DocumentSpec validate; durable HTML byte-matches adjacent structured source.
- Exactly one h1, skip link, main landmark, heading order, review-ID uniqueness, self-containment, and print styles pass.
- Required PRD/design profile behavior passes without teaching the renderer new product or architecture facts.
- Every decision recorder has complete lifecycle controls and export behavior.
- Every substantive PRD/design embeds only renderer-produced infrastructure-style SVG with retained `system-diagram-v1` JSON source.
- Clean-copy rendering and validation pass from an unrelated working directory.
- Generated HTML regenerates byte-for-byte.

## Output

```text
DocumentSpec/report: {json path} · {html path}
Kind/status: {kind} · {status}
Template: canonical-report-v1
Decisions: {count + lifecycle states}
Diagram provenance: {System Diagram JSON/SVG | none for non-PRD/design report}
Validation: {passed | failed + issue | not run + reason}
Opened: {yes | no + reason}
Next review action: {action}
```
