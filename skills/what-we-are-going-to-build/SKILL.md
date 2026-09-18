---
name: what-we-are-going-to-build
description: "Clarify a feature's behavior, domain, UX, and review mockup before architecture or implementation. Produce a concise Grokking specification in Markdown. Triggers on: what are we going to build, clarify this feature, define the feature, product behavior, feature UX proposal."
---

# What We Are Going to Build

Turn a requirement or technical feature into a shared product definition. Make the behavior concrete before deciding how to implement it.

This skill defines product behavior and review evidence; it does not approve architecture or write application code.

Save the final result after the pride gate at:

```text
.features/{feature}/what-we-are-going-to-build.md
.features/{feature}/what-we-are-going-to-build.mockup.html
```

Use the existing feature folder when one exists. If the feature name is unclear, ask for a slug before writing the files.

## Method

1. **Introduce the feature**
   State the problem, audience if known, desired observable outcome, technical boundary, scope, and non-goals.

2. **Define conditions**
   Describe testable entry, completion, validation, permission, safety, failure, and recovery conditions. Include loading, empty, pending, offline, conflict, or unsaved states when applicable. Name the owner and observable proof. Mark unknowns instead of guessing.

3. **Name the vocabulary**
   Identify the main users/actors, concepts, actions, states, and results. Reuse existing product terminology. Note collisions or proposed terms.

4. **Describe domain interaction**
   For each important concept, state what it owns. Describe actions, allowed state transitions, relationships, ordering, lifecycle, external effects, and failure behavior. Use the smallest model that explains the goal; do not invent classes, tables, endpoints, or events without evidence.

5. **Describe UX/UI**
   Choose one mode: **Operate**, **Read**, **Persuade**, or **Experience**. Define the user's primary job, first action, hierarchy, controls, feedback, progress, confirmation/undo, and relevant states. Cover keyboard/focus, accessible meaning, contrast, responsive layout, long content, and reduced motion.

   Inspect nearby UI and preserve its language. Create one evidence-grounded direction, not a gallery of concepts. Produce a self-contained mockup labeled **Proposed / not approved**; label invented records **Illustrative**. Use `frontend-design` and the repository's existing visual system.

6. **Write the Grokking specification**
   Use concrete Given / When / Then examples for the happy path and material failure/recovery paths. Map each scenario to conditions, concepts, actions, and visible results.

## Deliverables

Use the paths above unless the repository already has a feature-folder convention. The Markdown is the canonical review document. The mockup is evidence, not product truth. Keep the Markdown useful without the mockup.

## Markdown shape

```markdown
# What We Are Going to Build

## Introduction
{problem, audience, outcome, boundary}

## Conditions
{entry, completion, validation, failure/recovery, applicable states}

## Vocabulary
{actors, concepts, actions, states/results}

## Domain interaction
{ownership, transitions, relationships, causal flow}

## UX/UI
- Mode:
- Primary job:
- Main path:
- Material states:
- Accessibility/responsive notes:
- Mockup: `{path}`

## Grokking specification
### Scenario: {outcome}
- Given ...
- When ...
- Then ...

## Decisions and unknowns
- {owner}: {decision and why it matters}

## Review boundary
This document defines product behavior and review evidence. It does not approve architecture or authorize implementation.
```

## Pride gate

Before presenting or saving the specification or mockup, run `are-you-proud` against the requirement, scenarios, domain model, UX/UI, accessibility, and mockup evidence. Fix every finding, rerun the review, and iterate until the verdict is **Proud**. Save only the final Proud result to `.features/{feature}/what-we-are-going-to-build.md` and its mockup beside it. Do not present or save a plan with unresolved findings; escalate only decisions that require the user's authority.

Omit empty sections. Keep facts, proposals, decisions, and unknowns distinct. Remove repeated conclusions and generic filler.
