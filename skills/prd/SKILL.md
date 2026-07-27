---
name: prd
description: "Create or update a product-complete feature PRD that explains what is being built, why it matters, and how it works through end-to-end product slices, user stories, Given/When/Then scenarios, storyboards, and observable acceptance. Use before design or implementation when product intent, scope, workflows, or acceptance behavior are unclear. Triggers on: create a prd, write prd, prd.html, product requirements, plan feature."
---

# Product Requirements Document

Use this skill to answer three product questions:

> What product change are we building, why is it worth building, and how should it work for the people or systems that use it?

Default artifact:

```text
docs/features/{feature}/prd.html
```

## Content ownership and report shell

This skill owns all PRD substance and its reading order. `html-report-designer` supplies only the self-contained HTML shell, visual components, accessibility, and validation workflow.

Use:

```text
skills/html-report-designer/resources/prd-template.html
```

The template exposes `{{PRD_TOC}}`, `{{PRD_ARTIFACT_LINKS}}`, `{{PRD_HEADER_SUPPORT}}`, and `{{COMPOSED_PRD_CONTENT}}` composition slots. Compose the sourced PRD content before fitting it to the report shell. Generate navigation from the sections that actually exist. Use artifact links only for real related documents; an empty string is valid. The template must not add, remove, reorder, or multiply product requirements, stories, slices, scenarios, decisions, or visuals.

Keep the template's embedded style block and visual component classes. Replace all placeholders, add `reveal` to top-level composed sections, preserve semantic HTML and stable review IDs, and leave no unresolved placeholders. Never invent content to fill a component or sample shape.

## Product narrative

Build the shortest complete product story with this spine:

> product and user → problem and consequence → bounded outcome → product slices and behavior → observable proof → meaningful boundary

A reader should be able to answer, without consulting design or implementation documents:

1. What product capability will exist?
2. Who encounters it, where, and for what job?
3. Why is the current state worth changing?
4. What happens from entry through success or recovery?
5. What proves the intended outcome and what remains unchanged?

A small change may use one compact slice, but it must still answer all five questions.

## Process

1. Read the request and the smallest amount of product/repository evidence needed to avoid guessing.
2. Inspect the existing product interface before describing or changing a visible workflow.
3. Draft **What**, **Why**, and the ordered product slices in plain text before generating HTML.
4. For each slice, write its story, scenarios, visible steps or non-visual interactions, rules, acceptance, and final user-perspective “After this slice” summary.
5. Create one product-behavior diagram that explains the end-to-end flow across actors, slices, states, or recovery, or record `Diagram not applicable` with a concrete reason.
6. Ask up to 3 focused questions when missing answers change scope, trust, behavior, or the coherence of the product promise.
7. Mark unresolved consequential behavior as blocking; do not omit or invent it to complete the document.
8. Compose the approved/sourced content into the content-neutral PRD report shell.
9. Validate facts, traceability, links, accessibility, HTML, storyboards, and diagram quality.
10. Stop before architecture, APIs, schemas, component libraries, tasks, rollout mechanics, or task-level test commands.

## Source and truth rules

- Do not invent users, workflow steps, business rules, limits, roles, validation, metrics, or acceptance behavior.
- Distinguish facts, assumptions, recommendations, and unresolved decisions near the claims they affect.
- A recommended flow is not an approved flow. Label its status and owner.
- Existing UI, screenshots, product language, support evidence, research, and analytics are product evidence. Cite consequential claims near their source.
- Product-visible constraints may name an external contract. Files, classes, endpoints, migrations, packages, and storage choices belong in design.
- If evidence does not support a requested metric, describe the observable outcome and record metric selection as an open decision.

## What we are building

State the product definition explicitly. Include:

- **User or actor:** who encounters the capability.
- **Job and moment:** what they are trying to accomplish and where the need appears.
- **Product capability:** what new or changed behavior will exist.
- **Entry point:** how the actor reaches or triggers it.
- **Resulting state:** what the actor can observe or do afterward.
- **Boundary:** the nearest adjacent behavior intentionally unchanged.

Use one direct product statement:

```text
For {user/actor} who needs to {job} during {moment}, the product will {capability}
through {entry point}, resulting in {observable state}; it will not {boundary}.
```

Do not substitute a feature inventory, project codename, architecture summary, or generic vision statement.

## Why we are building it

Explain the rationale as a causal argument:

- **Current behavior:** what happens today.
- **Friction:** what fails, takes effort, creates risk, or blocks progress.
- **Consequence:** why that friction matters to the user or product.
- **Evidence:** what supports the claim.
- **Expected outcome:** what observable change makes the bet worthwhile.
- **Why now:** include only when timing is sourced and decision-relevant.

Do not invent quantitative targets. If the desired outcome is qualitative, say exactly what users or reviewers should be able to observe.

## How it should work: product slices

A product slice is:

> An ordered, end-to-end increment of user value that can be understood and accepted from the product perspective; it is not an implementation layer, package, component, endpoint, or delivery task.

Use one slice for a tiny coherent change. Use multiple slices when value is introduced in meaningful stages or when different outcomes can be reviewed independently. Order slices by the product experience, not the code plan.

Each substantive `SLICE-*` contains the following compact contract.

### 1. Slice outcome and boundary

State the independently understandable value this slice adds, its entry condition, resulting product state, and what it does not yet provide.

### 2. Primary story

Include at least one sourced user or system story:

```text
STORY-*: As a {actor}, I want {capability}, so that {outcome}.
```

If there is no human actor, name the system actor or trigger and the stakeholder who observes the result. Do not invent a persona merely to satisfy the format.

### 3. Behavioral specifications

Include one main scenario per slice and only the important sourced edge, empty, error, recovery, or permission scenarios that affect trust or scope:

```text
EX-* Main scenario
**Given** {starting context}
**When** {actor action or trigger}
**Then** {observable result}
```

A `Then` must describe product-visible or stakeholder-observable behavior, not an internal call, record, event, or implementation mechanism.

### 4. Product-visible steps and storyboard

For every user-facing slice, show the intended experience from entry to outcome. Include one compact storyboard panel for every product-visible step:

1. **Context/state:** what the user sees before acting.
2. **Action:** what the user does.
3. **Visible response:** feedback, changed state, or recovery shown by the product.
4. **Next decision/outcome:** what the user can do or understand next.

A panel can be a small semantic HTML/CSS wireframe, a faithful existing screenshot with annotations, or a compact before/after state when that fully explains the step. Panels are explanatory product storyboards, not polished design specifications.

When an existing interface exists, preserve its shell, terminology, density, navigation, and controls. Show only the material product delta. Include representative copy and important loading, empty, error, success, or permission states when they change the scenario.

For a non-visual slice, replace the storyboard with a compact actor → trigger/action → observable state/effect strip and state why UI is not applicable. Never fabricate a screen for a background or API-only behavior.

Show multiple UI alternatives only when an unresolved product decision requires comparison. Alternatives are not a substitute for the intended-flow storyboard.

### 5. Acceptance

Give each observable criterion an `AC-*` ID. Acceptance must prove the slice outcome and relevant trust/recovery behavior without prescribing task-level commands.

Maintain lightweight traceability:

```text
SLICE-* → STORY-* → EX-* → AC-*
```

Keep IDs stable across revisions. Storyboard steps may use `STEP-*` IDs when reviewers need to discuss individual states.

### 6. After this slice

End every slice with a visually distinct, 1–2 sentence summary in plain user language. State the new capability or understood outcome—not the implementation, requirements, or test mechanics.

```text
After this slice, {actor} can {new capability or understood outcome}.
{Optional: They still cannot {nearest meaningful boundary}.}
```

Use the actor named by the slice. Keep it concrete enough that a reviewer can explain the value without rereading the story or scenarios. Do not repeat the step sequence. In HTML, render it as a compact success callout at the end of the slice with a stable review anchor such as `slice-001.after`.

## Cross-slice product rules

Use 3–7 outcome-protecting rules when authority, policy, vocabulary, invariants, trust, or recovery applies across slices. Write observable behavior:

```text
When {condition}, {actor} can observe {result}.
The product must not {harmful or out-of-scope behavior}.
```

Keep a rule inside one slice when it does not apply elsewhere.

## Product-behavior diagram expectation

A substantive PRD normally includes one product-behavior diagram. Use `system-diagram` with the exact product question the figure must answer.

Prefer a compact causal or state path that shows how the product works across the most important transition:

```text
actor/context → trigger/action → product response/state → next decision → outcome or recovery
```

The diagram complements stories, Given/When/Then scenarios, and screen storyboards; it does not duplicate them or introduce architecture. Use real product language, label every meaningful edge with an action or effect, distinguish uncertainty/recovery, and include a nearby ordered text walkthrough.

Use `Diagram not applicable` only when the PRD is truly too small or has no meaningful flow, handoff, state transition, relationship, or recovery behavior to visualize. Concise prose alone is not a reason to omit a useful explanatory figure.

Follow `system-diagram`'s evidence, semantic brief, spacing, arrow/label legibility, accessible inline SVG, responsive overflow, print, and validation contract. Preserve `.diagram-reveal` groups in reading order so the figure can progress when its section enters the viewport; the complete static figure must remain visible without JavaScript.

## Scope, decisions, and evidence

- State the smallest in-scope product outcome and adjacent non-goals.
- Include a decision block only for a real unresolved product choice. Name the question, evidence, options, impact, owner, blocker state, and resolution path.
- Keep assumptions and questions beside the affected slice or rule rather than collecting all uncertainty at the end.
- End with a compact source list.

## Outcome-based splitting

Keep one PRD when the product definition, rationale, slices, and boundary can be approved together. Create a child PRD only when a child outcome is independently valuable, reviewable, releasable, and needs its own product promise and proof.

Never split by package, component, API, persistence layer, or architecture boundary.

## Quality gate

Before finishing:

- [ ] **What** names the actor, job/moment, capability, entry point, resulting state, and boundary.
- [ ] **Why** connects current behavior to friction, consequence, evidence, and expected outcome.
- [ ] Each substantive slice is an end-to-end product outcome, not a delivery or architecture layer.
- [ ] Every slice has a sourced `STORY-*` and main Given/When/Then `EX-*` scenario.
- [ ] Every user-facing slice has one intended-flow storyboard panel per product-visible step.
- [ ] Every non-visual slice has an interaction/state strip and a truthful UI-not-applicable rationale.
- [ ] Important failure, empty, recovery, and permission behavior is specified where it changes trust or scope.
- [ ] `Then` statements and `AC-*` criteria are observable from the product or stakeholder perspective.
- [ ] Traceability is intact: `SLICE-* → STORY-* → EX-* → AC-*`.
- [ ] Every slice ends with a concise “After this slice” statement describing what its actor can now do or understand.
- [ ] One product-behavior diagram explains a named flow/state question, or `Diagram not applicable` gives a concrete rationale.
- [ ] The diagram is evidence-backed, labelled, accessible, paired with a walkthrough, and complete on mobile/print/no-JS/reduced-motion.
- [ ] Multiple UI alternatives appear only for a real unresolved product decision.
- [ ] Every consequential claim is sourced, assumed, recommended, or recorded as an owned question.
- [ ] The report shell reflects the composed content; it does not dictate sections or placeholder counts.
- [ ] The PRD contains no architecture or implementation prescription.
- [ ] Stable review IDs, links, accessibility, self-containment, and HTML validation pass.

## Handoff

After approval:

- use `design-solution` when architecture is non-obvious or a durable design is useful;
- pass the approved product definition, rationale, slices, after-slice user outcomes, stories, scenarios, storyboard states, rules, acceptance, decisions, and boundaries;
- use `simple-tasks` for implementation slices and delegation;
- use `feedback-loop` for task-level verification.

Unresolved consequential product behavior blocks design. Missing decorative visuals or implementation detail does not.

## Output

End with:

```text
PRD updated: docs/features/{feature}/prd.html {opened/reviewed | not opened + reason}
Status: {Draft | Review | Approved | Blocked}
Product: {what is being built, for whom}
Why: {problem and expected outcome}
Product slices: {SLICE IDs + names}
Traceability: {complete | gaps}
Sources reviewed: {paths/docs/chat | user request only}
Open decisions: {none | IDs + owner/blocker state}
Storyboards: {slice IDs covered | non-visual rationale | gaps}
Diagram: {section + question answered | not applicable + reason}
Validation: {passed | not run + reason | failed + key issue}
Ready for design: {yes | no + blockers}
Next: {review PRD | resolve decision | create design | define task feedback loop}
```
