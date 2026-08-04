---
name: system-diagram
description: "Create an evidence-backed explanatory system diagram for a source-classified PRD or technical design, or for a focused diagram packet using the mandatory bundled deterministic SVG/CSS renderer. Use for causal flows, state transitions, ownership, boundaries, communication, domain effects, or recovery paths. Do not use another renderer or invent product/architecture semantics."
compatibility: "Requires Node.js 18+ and filesystem access. The renderer has no runtime package or browser dependency."
---

# System Diagram

Create one learning artifact that answers one explicit question. The consuming PRD or design owns source-classified semantics, authority, applicability, scope, and placement. This skill validates evidence and owns structured diagram authoring, the infrastructure visual system, accessibility, and internal figure reading order.

## Setup

Resolve paths from the directory containing this loaded `SKILL.md`. The renderer is portable Node.js with no package installation or browser stage. Never fall back to hand-authored SVG or another renderer when the bundled script is missing; report the blocker. For retained sources from the former backend, follow [references/migrating-from-excalidraw.md](references/migrating-from-excalidraw.md).

## Gate

Before drawing, state:

```text
Diagram question:
Understanding or decision unlocked:
Consuming authority and placement:
Audience:
Evidence:
Scope and exclusions:
```

Draw only when a real relationship, sequence, state transition, responsibility boundary, ownership path, or recovery path can be taught from evidence. The consuming PRD/design decides that its mandatory durable diagram applies; this skill must return unsupported semantics as blockers rather than plausibly filling gaps.

## Semantic brief

Complete before authoring geometry:

```text
Question:
Understanding unlocked:
Audience:
Mode:
Evidence:
Main path:
Nodes:
Labelled edges:
Boundaries/ownership:
State or payload:
Failure/recovery:
Uncertainty:
Reading order:
Text walkthrough:
```

Inspect the smallest relevant source, tests, routes, types, docs, and logs needed to verify actors, triggers, entry point, owner, state, calls/events/protocols, observable result, and material failure/recovery. Do not infer flow from folder names.

## Modes

Choose the smallest semantic mode; all modes use the same deterministic SVG renderer:

- causal/code flow;
- component communication;
- domain evolution;
- state/lifecycle;
- ownership/lane map;
- before/after;
- decision map;
- outside-in architecture slice.

For temporal participant communication, select the sequence capability: participants and lifelines, ordered sync/async/return/self messages, notes, activations, and bounded alt/opt/loop fragments. A merely linear workflow remains causal flow; static topology remains architecture view; one-scope decomposition remains component decomposition.

The first sequence implementation uses the version-isolated `system-diagram-v2` source contract and `sequence-v1` layout. Existing `system-diagram-v1` sources continue through the frozen renderer. The sequence renderer must reuse the `infrastructure-v1` visual language and report-owned walkthrough boundary.

Read [references/diagram-modes.md](references/diagram-modes.md) only for the selected mode.

## Semantic contract

### Nodes

A node earns space only when responsibility, boundary, state ownership, or observable result changes. Use a plain label and real symbol/path where traceability helps:

```text
Human label
RealClass.method() / route / event
owner · runtime · important state
```

### Edges

Label every meaningful edge with an action, call, event, transition, protocol, payload, or effect. An arrow explains causality, not adjacency.

### Boundaries and uncertainty

Show only boundaries relevant to the question. Mark proposed, assumed, blocked, retry, recovery, and failure paths explicitly rather than styling them as settled success.

### Color

Color communicates semantic state or ownership and is always paired with visible kind text, edge labels, line style, or shape. Include a local legend only when those adjacent non-color cues do not make the meaning explicit.

## Required renderer

Use only the bundled build-time infrastructure renderer. Dispatch by source version before normalization:

```bash
node "<system-diagram-dir>/scripts/render-system-diagram.mjs" \
  path/to/v1-diagram.json path/to/diagram.svg
node "<system-diagram-dir>/scripts/render-sequence-diagram.mjs" \
  path/to/sequence-v2.json path/to/sequence.svg
node "<system-diagram-dir>/scripts/render-sequence-diagram.mjs" --check \
  path/to/sequence-v2.json path/to/sequence.svg
```

Do not send v1 through sequence validation or layout. Do not hand-author sequence coordinates; source order and semantic references determine geometry.

Author strict `system-diagram-v1` JSON. `resources/infrastructure-diagram.css` is the sole visual style source and is embedded into every SVG. Keep the JSON source and SVG together when regeneration matters. Preserve `<!-- svg-source:system-diagram -->`, `data-diagram-style="infrastructure-v1"`, the renderer's exact raw-JSON source digest, searchable text, embedded CSS, accessible title/description, stable review IDs, foreground edge labels, and renderer-owned `.diagram-reveal` groups.

Do not hand-author the final SVG, edit generated SVG, use browser diagram runtimes, or add scene-local colors, fonts, roughness, or effects. The renderer owns the visual language. Split a crowded question into smaller figures instead.

## Visual and geometry defaults

Use the Vercel-infrastructure-inspired visual language as a principle set, not a pixel copy: a white canvas, optional quiet grid, mostly white nodes, neutral ownership boundaries, one blue primary route, and restrained green/amber/red semantic paths. Typography is technical and exact; shapes and connectors are clean rather than hand-drawn.

- Default to one top-to-bottom causal spine; use horizontal layout only for a real comparison, lane, or fan-out.
- Wrap text first and size nodes outward with at least about 24px internal padding.
- Leave at least about 56px between node bounds, increasing space for labels and turns.
- Keep effective text at least 12px; prefer 14–18px primary labels.
- Route arrows through whitespace with clear approach/departure and arrowhead clearance.
- Put edge labels in the foreground on opaque/paper backgrounds.
- Never route through node content or under labels.
- Use generous margins and an explicit viewBox.
- Split rather than shrink a crowded figure.

Read [references/drawing-and-accessibility.md](references/drawing-and-accessibility.md) for geometry, accessibility, motion, mobile, and print review. Read [references/renderer-workflow.md](references/renderer-workflow.md) for exact regeneration and embedding rules.

## Report handoff

Return the consuming skill:

- diagram question and understanding unlocked;
- evidence and uncertainty;
- JSON source path;
- generated SVG path;
- ordered text walkthrough;
- renderer freshness result.

`html-report-designer` embeds the generated SVG through a canonical `diagram` block. This skill does not own a report template or page shell.

## Quality gate

- One explicit question and understanding unlocked.
- Evidence supports every real node, edge, state, and owner.
- Main path can be narrated in order.
- Every meaningful edge is labelled.
- Uncertainty and recovery are truthful.
- Text, padding, routes, labels, and arrowheads remain legible.
- `system-diagram-v1` JSON source is retained; generated SVG is current and carries System Diagram provenance and `infrastructure-v1` style metadata.
- SVG has viewBox, title, description, accessible naming, searchable text, and stable review anchors.
- Nearby walkthrough preserves the conclusion with the image hidden.
- Desktop, 320px overflow, print, no-JS, and reduced-motion states remain complete.

## Output

```text
Created: {JSON path} · {SVG path}
Question/unlocked: {question} · {understanding}
Mode/layout: {mode} · {layout rationale}
Evidence: {paths/docs/logs}
Reading order: {static order + optional progressive groups}
Validation: {renderer current + accessibility/visual checks}
Uncertainty: {none | blockers}
```
