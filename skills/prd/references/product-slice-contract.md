# Product Slice Contract

Load this reference when composing a substantive PRD slice. Keep each slice independently understandable, direct, and product-complete.

## BDD specification

Treat the slice as one bounded feature and explain its user story through behavior:

```text
Feature: {bounded actor outcome}
Scenario: {observable behavior}
Given {starting context or product state}
When {actor action or trigger}
Then {stakeholder-observable result}
```

Use the required `story` object only as compact traceability metadata for actor, capability, and outcome. Write `actor` as a noun phrase beginning with a lowercase common noun or determiner (`an establishment member`); write `capability` as a base-form verb phrase beginning lowercase without leading `can` or `to` (`see current readiness`); write `outcome` as a complete result clause beginning lowercase without leading `so that` (`the member knows whether to continue`). Preserve proper names and acronyms within each fragment and omit terminal punctuation. This keeps the renderer's `Feature: {actor} can {capability}; outcome: {outcome}.` line grammatical. Do not add a second “As a / I want / so that” narrative. Add exception scenarios only when error, empty, recovery, or permission behavior changes trust or scope.

## Required slice content

1. **Outcome and boundary** — why the slice matters and its nearest exclusion; do not narrate the workflow here.
2. **BDD scenarios** — the interaction behavior: one main Scenario with Given/When/Then, plus only material exceptions.
3. **Observable sequence** — the smallest schema-required projection of the main scenario into concrete visual or non-visual states. Use one step for simple behavior; add steps only for distinct ordering or transition detail.
4. **Acceptance** — stable lowercase source IDs (`ac-001`, `ac-002`, …; rendered as `AC-*`) defining independently testable pass/fail conditions for outcome, recovery, and boundary without paraphrasing every Then or adding implementation commands. One criterion may cover several scenario statements when the observable signal is the same.
5. **After this slice** — one short statement of the net-new capability, not another summary.

Maintain stable conceptual traceability:

```text
slice-* → story-* → ex-* → ac-*
```

A storyboard step records:

```text
Context/state → action → visible response → next decision/outcome
```

Label each Proposed recommendation, Assumption, or Open question in its nearest concise context; group adjacent Sourced facts or Approved product truth under one nearby citation.

## Duplication test

For each outcome, scenario, step, criterion, and after-slice statement, reduce it to `actor + trigger/action + state/result`. If that complete tuple already exists elsewhere in the slice, keep both only when the second adds information owned by its field; an authority label or citation alone does not make it new. Otherwise keep the field-owned occurrence using the highest-authority source and delete the paraphrase:

- scenarios own behavior;
- the schema-required storyboard owns the smallest concrete state transition;
- acceptance owns independently testable pass/fail conditions;
- after-slice owns only the net-new capability.

Do not paraphrase a `Then` as both a storyboard outcome and acceptance criterion. An acceptance criterion may trace to that `Then`, but it must add a stable, independently observable pass/fail signal or boundary. Do not use tables or manufacture alternative approaches. Reuse the existing product shell, terminology, density, navigation, and controls; show only the material UI delta.
