---
name: prd
description: "Create or update a concise feature PRD that owns product intent, scope, behavior, and observable acceptance. Use before design or implementation when the product promise is unclear. HTML is the default durable format; html-report-designer supplies presentation only. Triggers on: create a prd, write prd, prd.html, product requirements, plan feature."
---

# Product Requirements Document

Use this skill to answer one product question:

> What change are we betting on, for whom, why is it worth doing, and what observable result proves it?

Default artifact:

```text
docs/features/{feature}/prd.html
```

## Restored report template lock

Every new or regenerated PRD must use the report presentation restored from commit `ce8aab10f17fb9365533ee225bd5c2ce663a897f`:

```text
skills/html-report-designer/resources/prd-template.html
```

Start from a byte-for-byte copy of this template. Keep its embedded style block and visual component classes unchanged. Replace placeholders with sourced PRD content, remove unused sample sections and their navigation links, remove `role="img"` from rich HTML wireframe wrappers while preserving their child semantics, and leave no unresolved placeholders. Do not substitute another report shell, recipe, or visual system unless the user explicitly replaces this lock.

The template controls presentation, not product scope: do not invent content merely to fill its available components.

This skill owns the PRD's content structure. `html-report-designer` supplies the shared HTML shell, design tokens, accessibility, and build/validation workflow; it does not decide the PRD's sections or require visual artifacts.

## Product narrative

Build the shortest credible story with this spine:

> specific moment → friction and consequence → bounded product bet → observable proof → meaningful boundary

A reader should understand the bet in roughly five-minute read. Small changes should be much shorter. Do not add an artifact to make the PRD look substantial.

## Process

1. Read the user request and the smallest amount of product/repository evidence needed to avoid guessing.
2. Name the user or system moment, current friction, and consequence.
3. State one bounded product bet in observable language.
4. Show the shortest flow and rules needed to remove ambiguity.
5. Define what proves the outcome and what remains outside the bet.
6. Surface only decisions that product review must resolve now.
7. Compose only the rhetorical roles needed; omit the rest.
8. Generate `prd.html` through `html-report-designer`, preserving this content order.
9. Validate facts, links, HTML, and any artifact that actually carries product meaning.
10. Stop before architecture, tasks, implementation detail, or task-level test procedure.

## Source and truth rules

- Do not invent users, workflow steps, business rules, limits, roles, validation, success metrics, or acceptance behavior.
- Ask up to 3 focused questions when an answer changes scope, risk, or whether the product bet is coherent.
- Record small non-blocking uncertainty as an assumption or open question beside its impact.
- Product-visible constraints may mention an external contract; implementation files, classes, schemas, endpoints, migrations, libraries, and rollout mechanics belong later.
- Existing product UI is evidence. Inspect it before claiming a visible workflow or proposing an alternative.
- A recommended direction is not an approved direction.
- Name sources near consequential claims and end with a compact source list.

## Composable PRD roles

These are roles, not mandatory headings or a fixed order. Use feature-specific headings and compose only what helps the reader decide.

### Opening outcome

Start with the product promise and enough context to orient the review. A useful opening may cover:

- **Moment:** where the user or system is when the need appears.
- **Friction:** what fails, costs time, creates risk, or blocks progress today.
- **Bet:** the bounded behavior change.
- **Proof:** what someone can observe when it works.
- **Boundary:** the most important thing this bet does not change.

Use a paragraph, bullets, or another concise form. Do not force five cards or repeat the same facts later.

### Product flow

Use a flow only when order, handoff, feedback, or recovery matters. Prefer 3–5 flow steps. Each step names the actor or trigger, visible action, effect, and next meaningful state. Put a material exception beside the step it changes rather than creating an exhaustive edge-case catalog.

### Outcome-protecting rules

Use 3–7 outcome-protecting rules when policy, authority, invariants, trust, or recovery would otherwise remain vague. Write observable product behavior:

```text
When {condition}, {actor} can observe {result}.
The product must not {harmful or out-of-scope behavior}.
```

### Scope and meaningful boundary

State the smallest in-scope bet and the adjacent behavior explicitly left unchanged. Boundaries are stronger than broad feature inventories.

### Observable proof

Use 3–6 observable proofs when practical. Cover the main outcome and only the failure/recovery states that change trust or scope. Product acceptance says what must be true; task-level commands and test evidence belong to `feedback-loop` or task results.

### Product decision

Include a decision block only when review must choose among plausible product directions. State the question, evidence, options, impact, owner, and next action. Do not create fake alternatives, mandatory selectors, or wireframes for a decision prose can resolve.

### Sources and uncertainty

Keep assumptions, open questions, and source anchors close to the claims they affect. An open question names impact, owner, blocker status, and resolution path.

Stories, post-story flow rows, domain maps, diagrams, wireframes, UI alternatives, selectors, and readiness ceremony are optional. Use one only when it answers a real product question better than concise prose.

## Linchpin artifact gate

A visual or interactive artifact is justified only when all are true:

1. A named product uncertainty blocks review.
2. Existing prose, product UI, screenshots, or evidence is insufficient.
3. The artifact unlocks a specific decision or shared understanding.
4. The artifact can be sourced truthfully and reviewed accessibly.

Choose the smallest linchpin artifact:

- real screenshot or existing UI reference for continuity;
- small HTML/CSS wireframe for placement or state;
- before/after for one stable object or workflow;
- system/domain diagram for a relationship or causal path;
- data visual for a sourced quantitative claim.

A PRD diagram is optional. When one is warranted, call `system-diagram` with the product question, evidence, and decision it must unlock. When Excalidraw is selected, follow `system-diagram`'s top-to-bottom spacing, node-padding, and arrow-legibility contract rather than composing a dense bespoke figure here. Do not make a renderer, a diagram slot, or visual polish a completion gate.

## Existing interface gate

For user-facing behavior:

1. Inspect the actual shell, navigation, terminology, density, controls, responsive behavior, and important states.
2. Reuse sufficient existing mockups rather than redraw them.
3. Compare only the smallest material product delta: entry point, placement, hierarchy, page/dialog choice, state, or recovery.
4. Keep product policy choices in the PRD; leave component/library implementation to design.

When no interface exists, describe only the visible product contract needed to bound the bet. Do not turn the PRD into a complete design system exercise.

## Outcome-based splitting

Keep one PRD when one product outcome and boundary can be approved together. Split only when a child outcome is independently valuable, reviewable, and releasable with its own proof.

When splitting, never split by package, component, or architecture layer. Those are implementation structures, not product outcomes.

A useful parent/child relationship is:

```text
Parent outcome → approved child outcome → child proof and boundary
```

Link child PRDs rather than duplicating their detail.

## Quality gate

Before finishing:

- [ ] The opening names a real moment, friction, bounded bet, proof, and boundary without repetition.
- [ ] Every claim is sourced, explicitly assumed, or left as an owned question.
- [ ] The artifact contains no invented product behavior or implementation prescription.
- [ ] Flow, rules, and proof are observable and only as detailed as the decision requires.
- [ ] Scope and non-goals are meaningful, not generic disclaimers.
- [ ] Optional artifacts pass the linchpin gate and have a text equivalent.
- [ ] Existing UI evidence was inspected when visible behavior changes.
- [ ] The PRD is concise enough for the size of the bet.
- [ ] Stable review IDs are attached to consequential claims, not decorative layout.
- [ ] Generated HTML passes the shared validator and remains self-contained.

## Handoff

After approval:

- use `design-solution` when architecture is non-obvious or a durable design is useful;
- pass the approved product promise, proof, constraints, decisions, and boundaries—not a required section inventory;
- use `simple-tasks` for execution slices when splitting or delegation helps;
- use `feedback-loop` for task-level verification.

The absence of optional UI, domain, story, or diagram sections is not a blocker for design. Unresolved product behavior is.

## Output

End with:

```text
PRD updated: docs/features/{feature}/prd.html {opened/reviewed | not opened + reason}
Status: {Draft | Review | Approved | Blocked}
Product bet: {one sentence}
Sources reviewed: {paths/docs/chat | user request only}
Open decisions: {none | IDs + owner/blocker state}
Optional artifacts: {none | artifact + question unlocked}
Validation: {passed | not run + reason | failed + key issue}
Ready for design: {yes | no + blockers}
Next: {review PRD | resolve decision | create design | define task feedback loop}
```
