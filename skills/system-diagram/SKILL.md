---
name: system-diagram
description: "Create a question-driven, evidence-backed system diagram as accessible inline SVG. Use for causal flows, boundaries, ownership, state, sequence, domain behavior, or architecture paths only when a visual unlocks understanding that prose/code links do not. Supports authored and auto-layout tool selection."
argument-hint: "[feature-or-doc-path]"
---

# System Diagram

Create a learning artifact that answers one system question. The diagram is not a completeness signal or decoration.

This skill owns the diagram's question, evidence, semantics, and reading order. `html-report-designer` owns the surrounding static document shell and figure frame when the diagram is embedded in a durable report.

## Gate

Before drawing, state:

```text
Diagram question: What one question must the figure answer?
Decision or understanding unlocked: What becomes reviewable after seeing it?
Evidence gap: Why are existing prose, code links, tests, screenshots, or diagrams insufficient?
Audience: Who needs to explain or decide this?
Scope: What is included and intentionally excluded?
```

Do not draw when the evidence gap is empty. Reuse or improve an existing figure when it already answers the question.

A PRD diagram is optional. It must resolve a named product uncertainty where existing prose or evidence is insufficient, not make the PRD feel substantial.

A design diagram is optional. It must resolve a named architecture question, not inventory the system.

## Architecture diagram gate

Create a design-stage diagram only when all are true:

1. A named architecture question affects ownership, boundary, state, sequence, failure, or tradeoff.
2. One small causal path can teach the answer.
3. Existing prose, code links, or tests are insufficient.
4. The evidence supports real nodes and edges.
5. The figure unlocks a specific review decision or shared explanation.

Otherwise use concise prose and source links. The gate is intentionally strict: one small causal path is useful only when existing prose, code links, or tests are insufficient.

## Brief

Complete the smallest useful brief before choosing a renderer:

```text
Question:
Decision/understanding unlocked:
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
Text equivalent:
```

If key ownership or call order cannot be established from evidence, ask one focused question rather than drawing a plausible fiction.

## Inspect reality

Read the smallest set of source, tests, routes, types, docs, and logs needed to verify:

- actor and trigger;
- real entry point;
- owner of coordination and policy;
- state/persistence owner;
- calls, events, protocols, payloads, or transitions;
- runtime/process/team boundaries;
- observable result;
- material failure, retry, recovery, or uncertainty.

Do not infer call flow from folder names alone. Distinguish observation, interpretation, assumption, and proposed design.

## Choose a mode

Use the smallest mode that answers the question:

- **Causal/code flow** — functions, methods, events, jobs, payloads, result.
- **Component communication** — responsibility, protocol, runtime boundary, handoff.
- **Domain evolution** — source concept → action/verb → target state/effect → invariant.
- **State/lifecycle** — state, trigger, guard, effect, recovery/terminal path.
- **Ownership/lane map** — runtime, module, team, or data ownership.
- **Before/after** — one stable baseline and the smallest causal change.
- **Decision map** — viable alternatives, evidence, tradeoffs, reversibility.
- **Outside-in slice** — external need → entry → seam → policy/state → proof.

See `references/diagram-modes.md` for mode-specific guidance.

## Semantic contract

### Nodes

A node earns space only when responsibility, boundary, state ownership, or result changes. Use plain meaning and real names where traceability helps:

```text
Human label
RealClass.method() / route / event
owner · runtime · important state
```

### Edges

Label every meaningful edge with the call, action, event, transition, protocol, payload, or effect. Arrows should explain causality, not merely adjacency.

```text
POST /api/imports · { fileId }
SaveUseCase.execute() · durable result
Sale --decreases--> livestock position
```

### Boundaries and uncertainty

Show only boundaries relevant to the question. Mark proposed, assumed, blocked, removed, retry, or recovery paths explicitly rather than styling them as settled success.

### Color

Color communicates responsibility or semantic state. Define the local legend and pair color with labels, line style, or shape. Use the Editorial Ink palette from `html-report-designer` for durable generic figures unless the product/repository has a stronger visual authority.

## Large high-quality SVGs

Large means more canvas, not smaller text or more concepts.

- Default Excalidraw scenes to one top-to-bottom reading spine. Use horizontal composition only for a real comparison, lane, or fan-out that becomes less clear vertically.
- Size nodes from wrapped text outward. Target at least 24px internal padding around labels, 56px of vertical space between node bounds, and extra route space wherever an arrow turns or carries a label.
- Keep effective text at least 12px; prefer 14–18px for primary labels. Never reduce text to rescue an overcrowded canvas.
- Route arrows through whitespace, attach them to an obvious node edge, and leave clear space around arrowheads. Arrows must not cross node text, run beneath labels, or disappear into borders.
- Put edge labels in the foreground on an opaque or paper-colored background. Keep each label close to its route without touching the line or arrowhead.
- Use an explicit `viewBox`, stable geometry, generous outer margins, and enough canvas height for the vertical path to breathe.
- Put wide SVGs in a horizontally scrollable figure frame at narrow widths; do not shrink until labels become unreadable.
- Keep the source SVG complete and visible without JavaScript.
- Split independent questions into separate figures. Use overview + focused detail only when both are independently useful.
- Add a nearby ordered walkthrough that preserves the conclusion when the image is hidden.
- Verify desktop, 320px reflow/overflow, enlarged text around the figure, print, and SVG-only opening.

A static mega-diagram is usually a sign that the question is too broad. A large canvas is appropriate for lanes, timelines, and retained identity—not for dumping every component.

## Tool selection

Choose the tool after the semantic brief. No renderer is mandatory.

Current local options:

- **Excalidraw renderer** — best for deliberately authored, sketch-like teaching diagrams and controlled reading order; layout is manual.
- **Inline authored SVG** — best for a small custom visual with precise editorial treatment.
- **Graphviz** — strongest simple open-source candidate for deterministic build-time auto-layout of larger static topology/flow graphs.
- **D2** — concise authoring front end with multiple layout engines and SVG export.
- **ELK/elkjs** — strongest layout substrate for hierarchy, ports, and orthogonal routing, but it requires a custom SVG renderer/postprocessor.
- **Mermaid or PlantUML** — convenient for familiar sequence/state/UML forms; inspect and postprocess exported SVG before embedding.
- **Cytoscape.js** — better for interactive graph exploration than static document output.
- **GoJS** — capable integrated commercial option; requires procurement/license approval.

Do not add a dependency or build pipeline only for one diagram without approval. Read `references/diagram-tool-research.md` for official sources, tradeoffs, and the recommended adoption sequence.

## Build paths

### Existing Excalidraw path

For an authored diagram, create an explicitly positioned JSON scene using the vertical spacing and arrow-legibility contract above, then run:

```bash
node /Users/carlosrodrigo/agents/scripts/render-excalidraw-diagram.mjs spec.json output.svg
```

Preserve title/description, searchable text, provenance, review IDs, edge labels, and renderer-owned `.diagram-reveal` groups. The renderer is an available medium, not a reason to create a diagram. See `references/renderer-workflow.md` for its exact regeneration and embedding contract.

### Other SVG generators

Generate at build time, then normalize the SVG before embedding:

- remove remote assets and runtime dependencies;
- add or verify `viewBox`, `<title>`, `<desc>`, and accessible naming;
- keep text searchable or provide a complete local text equivalent;
- normalize fonts/colors to document tokens where practical;
- add stable review IDs to consequential groups;
- inspect edge routes, labels, clipping, mobile overflow, and print;
- inline the final SVG in the HTML artifact.

Do not make core meaning depend on pan/zoom JavaScript. Optional controls may enhance a complete static figure.

## Motion and reading order

Motion is optional. Use it only when causal sequence, state transition, or retained identity becomes clearer.

For a scroll-paced figure, order groups in source and visual space as:

```text
context/actor → action/edge label → owner/state → result → recovery/risk
```

The source SVG remains visible. Preserve renderer-owned groups, avoid path-draw effects that break coordinated strokes, and honor reduced motion and print. See `references/drawing-and-accessibility.md`.

## Output locations

Prefer:

```text
docs/features/{feature}/prd.html
docs/features/{feature}/design.html
docs/features/{feature}/diagrams/{name}.html
docs/architecture/{name}.html
```

Embed in the owning document when the figure exists only to support that narrative. Create a focused sibling page when the diagram has an independent audience or would crowd the parent.

## Quality gate

Before handoff:

- [ ] The figure answers one explicit question and names what it unlocks.
- [ ] Source evidence supports real nodes, edges, ownership, and state.
- [ ] The main path can be narrated in order.
- [ ] Every meaningful edge has a verb/call/protocol/effect label.
- [ ] Boundaries, uncertainty, failure, and recovery are truthful.
- [ ] The local legend explains semantic color/line meaning.
- [ ] Text and labels remain readable at expected size.
- [ ] SVG has a `viewBox`, title, description, accessible naming, and stable review anchors.
- [ ] A nearby structured walkthrough preserves the conclusion.
- [ ] Wide/mobile/print/no-JS/reduced-motion states are complete.
- [ ] The final artifact has no required remote assets or renderer runtime.
- [ ] The renderer/tool choice is recorded with regeneration source.

## Output

End with:

```text
Created: {path}
Diagram question: {question}
Decision/understanding unlocked: {result}
Mode: {mode}
Renderer/layout: {tool + why}
Evidence: {paths/docs/logs}
Reading order: {static order + optional motion}
Validation: {passed | not run + reason | failed + key issue}
Uncertainty: {none | assumptions/open items}
```
