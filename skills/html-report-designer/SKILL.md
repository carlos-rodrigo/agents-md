---
name: html-report-designer
description: "Apply the shared static HTML documentation template, design system, accessibility contract, optional motion runtime, and build/validation workflow. Content-neutral: the calling skill owns what the document presents and in what order. Use for self-contained PRDs, feature designs, diagrams, research, and decision documents."
---

# HTML Report Designer

Use this skill to turn an already-composed document into a polished, self-contained HTML artifact.

It owns:

- the shared static document system;
- Protocol-derived documentation chrome and layout behavior;
- typography, color, spacing, figures, code, callouts, and review-anchor styling;
- accessible, responsive, print-safe HTML;
- optional static-first motion;
- local build and validation guidance.

It does not own product requirements, architecture content, section names, section order, required examples, review decisions, or whether a diagram exists. The calling skill owns narrative order, evidence, conclusions, and omissions.

## Content neutrality

The calling skill supplies the complete content model. Treat that structure as source material, not a suggestion to reshape it into a generic report pattern.

- Preserve supplied headings, order, emphasis, evidence, and omissions.
- Never require a workflow, scenario, decision, diagram, wireframe, matrix, or navigation element.
- Never add sections because a component or example exists in this skill.
- Never make visual richness, section count, or a renderer a completion gate.
- Ask the calling skill when structure is ambiguous; do not infer PRD or architecture requirements here.
- The template is never a content checklist.

PRD, design, and generic shells differ only in metadata labels, authority links, and the optional component vocabulary loaded for the composed content. They share the same document behavior.

## Template source

Use the local Tailwind Plus Protocol project supplied by the user as a visual reference:

```text
~/Developer/tailwind-plus-protocol/
```

The durable output is an independently implemented static document shell, not copied Next.js/React template source. Preserve the useful visual principles—focused reading column, restrained zinc surfaces, emerald navigation accent, compact sans typography, section rail, and quiet borders—without carrying application controls such as search, sign-in, global product navigation, or dark-mode infrastructure into a single-file report.

The Tailwind Plus source is commercially licensed. Do not redistribute its source or direct derivatives as a template library. The files in this skill are a purpose-built static document system.

Extract behavior from the local `Layout`, `Header`, `Navigation`, `MobileNavigation`, `Prose`, `Heading`, MDX primitives, code groups, guide/resource groups, tags, and typography configuration—not from screenshot mimicry alone. `references/protocol-patterns.md` records the reusable translation and when each pattern is appropriate.

## Shared shell

Durable PRDs and feature designs use:

- one `<main id="main">` and one article;
- one document header with status, type, updated date, title, summary, and authority/source context;
- a restrained fixed section rail on wide screens;
- a compact fixed header bar;
- a native `<details>` section index on narrow screens;
- a 48rem focused reading spine inside a 66rem artifact canvas;
- compact 14px body, 16px lead, 18px section heading, and 24px page-title typography;
- a compact provenance footer;
- no remote assets or runtime dependency.

The section rail is progressive presentation. `resources/document-navigation.js` derives links from the calling skill's authored `h2[id]` elements. Without JavaScript, the article remains complete and the missing generated index does not alter meaning.

Generic reports may use the same shell or omit navigation when the document is too small to benefit. Do not force portal chrome such as breadcrumbs, document switchers, search, feedback widgets, previous/next links, or back-to-top controls.

## Design systems

### Protocol documents

PRD and design shells use Protocol-derived documentation chrome:

- white page and paper surfaces;
- zinc primary, secondary, tertiary text, and hairlines;
- emerald for links, focus, active navigation, and small semantic emphasis;
- a compact 14/16/18/24px system-sans hierarchy with generous line height;
- a 48rem prose spine and a 66rem wide-artifact canvas;
- 64px section rhythm created primarily by whitespace;
- nearly flat surfaces with little or no shadow;
- a 4px spacing base and restrained radius family.

Use the semantic variables in `resources/prd.tailwind.css` and `resources/design.tailwind.css`. Do not improvise local hex values, spacing, or component radii in generated documents. Avoid oversized marketing titles, automatic separators between every section, and card stacks that make documentation look like a dashboard.

### Editorial Ink

Generic reports and system figures use Editorial Ink: warm paper, high-contrast ink, brick accent, and restrained blue/green/ochre/red/violet semantic categories. Use it when the figure or evidence—not document chrome—is the primary visual artifact.

The canonical tokens and usage rules live in `references/report-system.md`.

## Pattern selection

Patterns are optional presentation tools. Choose one only after the calling skill names the rhetorical job.

Use the smallest fitting Protocol translation:

- **prose spine** for narrative, rationale, rules, and conclusions;
- **lead** for one opening promise or orientation sentence;
- **metadata tag** for a short status, method, or category—not decoration;
- **document note** when a compact fact changes readiness, interpretation, or next action;
- **property list** for named responsibilities, states, acceptance categories, contract terms, or the tradeoffs of a supplied decision;
- **ordered path** for sequence or causality;
- **split row** only for two bodies of evidence that need same-scale comparison;
- **code group** for primary command, payload, or contract evidence;
- **resource grid/card** only for equivalent navigable resources, never a requirements gallery;
- **section divider** for a major conceptual reset, not every section;
- **hero wash** only for a true overview/landing document, never by default;
- **figure canvas** for a justified supplied diagram or comparison.

PRD and design CSS expose neutral reusable classes (`.doc-note`, `.property-list`, `.property`, `.split-row`, `.code-group`, `.resource-grid`, `.resource-card`, `.meta-tag`, `.section-divider`, `.hero-wash`) alongside optional owning-skill classes. Their existence does not imply use. Keep supplied product or architecture decisions in Protocol headings, prose, and—when named terms aid scanning—property rows; do not invent a bespoke decision card. Read `references/protocol-patterns.md` for selection and construction, then `references/artifact-patterns.md` for the content role.

## Generation workflow

1. Receive composed, approved content from the owning skill.
2. Select the shell:
   - `resources/prd-template.html` for PRD metadata;
   - `resources/design-template.html` for design metadata and PRD authority link;
   - `resources/report-template.html` for other durable HTML documents.
3. Replace metadata placeholders.
4. Insert the composed content into the shell's single slot:
   - `{{COMPOSED_PRD_CONTENT}}`;
   - `{{COMPOSED_DESIGN_CONTENT}}`;
   - `{{COMPOSED_REPORT_CONTENT}}`.
5. Keep authored heading IDs and `data-review-id` anchors stable.
6. Use only relevant component classes from the shared source CSS.
7. Inline a justified SVG figure; never reserve an empty mandatory diagram slot.
8. Rebuild CSS and shared runtimes.
9. Validate, review in a browser, and record skipped checks or remaining risk.

Do not generate a Markdown twin by default. Finished output is one portable `.html` file with inline compiled CSS, inline SVG, and optional inline native JavaScript.

## Review anchors

Use stable anchors on consequential authored claims:

```html
<section id="retry-policy" data-review-id="policy.retry">
<article data-review-id="decision.storage-boundary">
<g data-review-id="figure.save-path.node-repository">
```

Rules:

- lowercase kebab/dot notation;
- tie IDs to durable concepts, not visual position;
- unique within the file;
- preserve IDs during edits;
- do not anchor every decorative wrapper.

## Figures and large diagrams

The calling skill or `system-diagram` decides whether a figure exists and what it says. This skill only gives it a reliable frame.

Every complex figure that is supplied should have:

- a visible question or how-to-read note;
- `<figure>` and `<figcaption>`;
- SVG `<title>` and `<desc>` with accessible naming;
- searchable text at a legible effective size;
- a nearby structured text equivalent;
- stable review anchors on consequential groups;
- horizontal overflow at narrow widths rather than unreadable downscaling;
- static print output.

Use a wide canvas only for a real figure, contract, or comparison. See `system-diagram` and its tool research for renderer/layout selection.

## Motion

Motion is optional and may clarify causal order, a state transition, retained identity, or review destination. Default documents and shared templates must not choreograph every section; ordinary recipes remain static.

Use semantic values only:

```html
data-motion="enter"
data-motion="flow"
data-motion="state"
data-motion="target"
```

`resources/artifact-motion.js` is the shared native runtime. Source content starts visible; JavaScript, CSS view timelines, or the runtime may enhance it. No-JS, JS-stripped review, reduced motion, and print must preserve every fact and conclusion.

Use `data-motion-sections="enter"` only when section entrance improves orientation. For scroll-paced diagram parts, keep renderer-owned `.diagram-reveal` groups in causal source order. Read `references/accessibility-motion.md` and `references/scrollytelling.md` before using richer motion.

## Accessibility and portability

A finished artifact must have:

- `<!doctype html>` and `<html lang>`;
- exactly one `<h1>` and a non-skipping heading hierarchy;
- skip link to `<main id="main">`;
- native semantic controls and visible focus treatment;
- no color-only meaning;
- labelled tables when tables are actually used;
- meaningful disclosure summaries;
- no rich HTML hidden behind `role="img"`;
- readable narrow, enlarged-text, and print modes;
- no required remote CSS, font, image, script, or iframe;
- no unresolved placeholders.

See `references/accessibility-motion.md` for the complete check.

## Build and validation

Source files:

```text
resources/report.tailwind.css
resources/prd.tailwind.css
resources/design.tailwind.css
resources/artifact-motion.js
resources/document-navigation.js
```

From `/Users/carlosrodrigo/agents`:

```bash
npm run build:report-css
npm run check:report-css
node scripts/validate-html-report.mjs path/to/report.html
bash scripts/verify.sh
```

Use `--allow-placeholders` only for shell templates. The validator checks document-system invariants; it must not enforce PRD sections, design sections, diagrams, wireframes, or content richness.

Open finished output in a browser and inspect normal, narrow, short-height, enlarged-text, reduced-motion, no-JS/JS-stripped, and print behavior. Details live in `references/build-validation.md`.

## References

Load only what the current artifact needs:

- `references/report-system.md` — shell, tokens, hierarchy, and diagram frame;
- `references/protocol-patterns.md` — source-derived Protocol patterns, selection rules, metrics, and anti-patterns;
- `references/artifact-patterns.md` — optional semantic presentation patterns;
- `references/accessibility-motion.md` — structural access, figures, motion, fallbacks;
- `references/scrollytelling.md` — eligibility and fallback contract for scroll narratives;
- `references/build-validation.md` — build, validation, and browser checks.

## Output

End with:

```text
HTML report: {path}
Shell: {PRD | design | generic}
Content structure: {preserved from owning skill}
Motion: {none | motif + meaning clarified}
Review anchors: {yes | no + reason}
Validation: {passed | not run + reason | failed + key issue}
Opened: {yes | no + reason}
```
