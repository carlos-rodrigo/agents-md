---
name: system-diagram
description: "Create an evidence-backed explanatory system diagram for an approved PRD, technical design, or focused diagram packet using the mandatory bundled Excalidraw JSON-to-SVG renderer. Use for causal flows, state transitions, ownership, boundaries, communication, domain effects, or recovery paths. Do not use another renderer or invent product/architecture semantics."
compatibility: "Requires Node.js 18+, npm-installed bundled dependencies, filesystem access, and Playwright Chromium. Run npm install in this skill directory once after a copied installation."
---

# System Diagram

Create one learning artifact that answers one explicit question. The consuming PRD or design owns approved semantics, applicability, scope, and placement. This skill validates evidence and owns visual encoding, Excalidraw authoring, accessibility, and internal figure reading order.

## Setup

Resolve paths from the directory containing this loaded `SKILL.md`. After copying skills to another location, install this skill's pinned renderer dependencies once:

```bash
npm install --prefix "<system-diagram-dir>"
```

Never fall back to hand-authored SVG or another renderer when setup is missing; report the blocker.

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

Choose the smallest semantic mode; all modes use the same Excalidraw renderer:

- causal/code flow;
- component communication;
- domain evolution;
- state/lifecycle;
- ownership/lane map;
- before/after;
- decision map;
- outside-in architecture slice.

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

Color communicates semantic state or ownership and is paired with text, line style, or shape. Include a local legend when more than one semantic color is used.

## Required renderer

Use only the bundled build-time Excalidraw renderer:

```bash
node "<system-diagram-dir>/scripts/render-excalidraw-diagram.mjs" \
  path/to/diagram.json path/to/diagram.svg
node "<system-diagram-dir>/scripts/render-excalidraw-diagram.mjs" --check \
  path/to/diagram.json path/to/diagram.svg
```

Keep the JSON source and SVG together when regeneration matters. Preserve `<!-- svg-source:excalidraw -->`, the renderer's JSON source digest, searchable text, embedded fonts, accessible title/description, stable review IDs, foreground edge labels, and renderer-owned `.diagram-reveal` groups.

Do not hand-author the final SVG, edit generated SVG, use browser diagram runtimes, or change renderer because a scene is crowded. Split the question into smaller figures instead.

## Geometry

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
- JSON source is retained; generated SVG is current and carries Excalidraw provenance.
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
