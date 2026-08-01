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

Use the required `story` object only as compact traceability metadata for actor, capability, and outcome. Do not add a second “As a / I want / so that” narrative. Add exception scenarios only when error, empty, recovery, or permission behavior changes trust or scope.

## Required slice content

1. **Outcome and boundary** — why the slice matters and its nearest exclusion; do not narrate the workflow here.
2. **BDD scenarios** — the interaction behavior: one main Scenario with Given/When/Then, plus only material exceptions.
3. **Observable sequence** — only state transitions that the BDD text cannot make visually or operationally clear.
4. **Acceptance** — stable lowercase source IDs (`ac-001`, `ac-002`, …; rendered as `AC-*`) proving outcome, recovery, and boundary without paraphrasing every Then or adding implementation commands.
5. **After this slice** — one short statement of the net-new capability, not another summary.

Maintain stable conceptual traceability:

```text
slice-* → story-* → ex-* → ac-*
```

A storyboard step records:

```text
Context/state → action → visible response → next decision/outcome
```

State each fact once across outcome, scenarios, sequence, acceptance, and after-slice text. Do not use tables or manufacture alternative approaches. Reuse the existing product shell, terminology, density, navigation, and controls; show only the material UI delta.
