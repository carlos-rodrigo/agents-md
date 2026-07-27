---
name: design-solution
description: "Create or update a feature's concise high-level design.html from an approved PRD. Use for architecture pressure, boundaries, causal system paths, tradeoffs, risks, and optional delivery slices. HTML presentation comes from html-report-designer; diagrams are question-driven and optional. Triggers on: create design, design this, design.html, architecture design, solution design, slice plan."
---

# Feature Design

Use this skill to answer one architecture question:

> What is the smallest system shape that can keep the approved product promise, and where should responsibility live?

Default artifacts:

```text
docs/features/{feature}/prd.html    # approved product authority
docs/features/{feature}/design.html # current intended architecture
docs/adrs/                          # optional durable decisions
.features/{feature}/tasks/          # optional execution packets
```

This skill owns the design's content structure. `html-report-designer` owns the static shell, visual tokens, accessibility, generation, and validation—not architecture content or section order.

## Architecture narrative

Build the shortest credible design with this spine:

> approved product promise → architecture pressure → chosen seam → causal system path → tradeoffs and proof → meaningful boundary

Use feature-specific headings and any useful order. Omit a role entirely when it does not help answer the architecture question.

## Design gate

Read the approved PRD or explicit approved product brief first. Design must not invent product behavior.

Proceed when product promise, observable proof, scope, constraints, and blocking decisions are clear. Consume optional PRD evidence that is present. The absence of optional UI, domain, story, or diagram sections is not a blocker.

Skip durable design for small clear changes when one obvious seam satisfies the approved behavior and an implementation feedback loop can carry the remaining detail.

Create or update `design.html` when architecture merits durable review, for example:

- responsibility or state ownership is ambiguous;
- multiple credible seams or integration paths exist;
- contracts, auth, persistence, migration, compatibility, rollout, or recovery matter;
- failure/operational behavior changes the solution shape;
- work should be split into independently reviewable vertical outcomes.

## Process

1. Extract only the approved product promise, observable proof, constraints, and boundary.
2. Inspect current entry points, owners, data/state, contracts, tests, and relevant ADRs.
3. Name the architecture pressure that makes the obvious implementation insufficient.
4. Choose the narrowest seam that owns the change.
5. Trace one causal system path from external trigger to observable result.
6. Record consequential tradeoffs, risks, proof strategy, and meaningful boundaries.
7. Add optional contracts, diagrams, operations, or slices only when the architecture question needs them.
8. Generate `design.html` through `html-report-designer` without surrendering content order.
9. Validate claims against code/docs and the artifact against shared quality gates.
10. Stop before line-by-line patches or execution evidence.

## Architecture core

A useful first pass makes these facts obvious:

- **Approved promise:** what product outcome the system must preserve.
- **Observable proof:** what external behavior makes the architecture credible.
- **Architecture pressure:** what ownership, timing, scale, reliability, compatibility, or risk makes a design decision necessary.
- **Chosen seam:** which boundary owns coordination and why it is narrower than alternatives.
- **Meaningful boundary:** what remains unchanged or deliberately outside this design.

Do not paste the PRD. Link to it and extract only facts that shape architecture.

## Composition gate

Compose only the roles needed for the current architecture question. A small internal behavior may need the core, one path, and proof. A persistence boundary may need contracts, migration, recovery, and an ADR. A user-facing cross-boundary change may need interface consequences and one system path.

Do not add architecture inventory, technology sections, domain models, matrices, risks, slices, or diagrams merely because a report template can render them.

Load `references/optional-design-recipes.md` only for the role that is actually needed:

- interface consequences;
- contracts/domain/data/persistence;
- operations/rollout/risk;
- outside-in slice outline;
- traceability.

## Causal system path

Trace one small causal path before drawing topology:

```text
external trigger → entry/transport → owning seam → policy/state transition → dependency or persistence → observable result
```

Name real symbols or paths when known, but keep the design at boundary level. Include a failure branch only when it changes ownership, contract, recovery, or product-visible behavior.

A path should answer:

- who initiates the change;
- which boundary validates or translates it;
- where policy and coordination live;
- who owns state and durability;
- what result crosses back to the caller;
- where failure is detected and recovered.

## Decisions and technology

Record a decision when plausible alternatives produce materially different ownership, compatibility, safety, or delivery cost. State chosen direction, evidence, rejected alternatives, tradeoffs, reversibility, and escalation owner.

Technology choices belong only when they constrain a boundary or materially change delivery/risk. Do not inventory the stack.

Data/domain/persistence detail belongs only when ownership, invariants, migration, or recovery depends on it. Link to canonical schemas or contracts rather than copying full field catalogs.

## Architecture diagram gate

Use `system-diagram` only after naming a diagram question. A design diagram is optional.

Create one when:

1. a named architecture question or boundary remains hard to understand in prose/code links;
2. one small causal path can answer it;
3. existing prose, code links, or tests are insufficient;
4. the diagram will unlock a review decision or shared mental model.

Prefer one legible path over a mega-map. When Excalidraw is selected, follow `system-diagram`'s top-to-bottom spacing, node-padding, and arrow-legibility contract so architecture content does not crowd the figure. The diagram's renderer is a presentation choice, not an architecture requirement.

## Outside-in slices

Add slices only when sequencing, delegation, approval, or tracer-bullet delivery matters. Each slice must be an independently reviewable architecture question or an approved child outcome.

A slice starts from external need and observable proof, then pulls in only the transport, seam, policy, state, and dependency required for that outcome. Task execution steps and proof results stay in task packets.

Never create layer phases such as “database task,” “service task,” and “UI task” for one inseparable outcome.

## ADRs and tasks

Create or update an ADR only for architecture-significant decisions: public contracts, auth/security/privacy, persistence/migration, compatibility/rollout, cross-service ownership, or major module boundaries.

Create task packets only when execution needs approval, splitting, delegation, resumption, or a task loop. The design owns intended boundaries; task packets own commands, implementation steps, feedback loops, and actual result evidence.

## Progressive disclosure

Keep the main path and chosen tradeoff visible. Put raw research, exhaustive contract fields, secondary failure modes, and supporting evidence behind links or meaningful disclosures.

A reviewer should be able to understand the thesis without opening every detail. Do not hide the recommendation, invariant, risk, or recovery path.

## Research rule

Use repository prior art first. Research external tools or patterns only when it can change the decision. Capture:

```text
source → relevant constraint or capability → design impact
```

Prefer primary documentation. Separate observed facts from interpretation.

## Quality gate

Before finishing:

- [ ] The design traces to an approved PRD or explicit approved product authority.
- [ ] The architecture pressure and chosen seam are explicit.
- [ ] One causal path reaches an observable result.
- [ ] Ownership, state, boundary crossings, and material failure/recovery are understandable.
- [ ] Decisions show tradeoffs and credible alternatives rather than foregone conclusions.
- [ ] Optional detail exists only because it changes architecture review.
- [ ] Diagrams, when used, answer a named question and remain understandable as text.
- [ ] Slices are vertical outcomes, not layers.
- [ ] ADR need is considered without turning ADRs into running notes.
- [ ] Task execution detail and result evidence stay out of `design.html`.
- [ ] Stable review anchors mark consequential claims.
- [ ] HTML is self-contained, accessible, and validated.

## Output

End with:

```text
Design gate: {satisfied | blocked pending product/architecture clarification}
Design updated: docs/features/{feature}/design.html {opened/reviewed | not opened + reason}
Architecture thesis: {one sentence}
Research: {sources reviewed | skipped with reason}
Optional artifacts: {none | artifact + question unlocked}
ADRs: {none | paths}
Slices/tasks: {none | paths or proposed outcomes}
Validation: {passed | not run + reason | failed + key issue}
Next: {review design | resolve question | create task packets | define feedback loop | execute directly}
```
