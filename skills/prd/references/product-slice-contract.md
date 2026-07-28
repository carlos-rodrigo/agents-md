# Product Slice Contract

Load this reference when composing a substantive PRD slice. The PRD skill owns whether the slice exists; this recipe keeps each included slice product-complete.

Each `slice` block must include:

1. **Outcome and boundary** — independently understandable value, entry condition, resulting product state, and nearest excluded behavior.
2. **Primary story** — a sourced human or system actor, capability, and outcome. Do not invent a persona.
3. **Main scenario** — Given starting context, When action/trigger, Then stakeholder-observable result.
4. **Material exceptions** — only edge, empty, error, recovery, or permission behavior that changes trust or scope.
5. **Observable sequence** — for visual behavior, one storyboard step per product-visible state; for non-visual behavior, actor → trigger/action → stakeholder-observable effect.
6. **Acceptance** — stable lowercase source IDs (`ac-001`, `ac-002`, …; rendered as `AC-*`) proving outcome, recovery, and boundary without implementation commands.
7. **After this slice** — 1–2 sentences stating what the actor can now do or understand.

Maintain stable conceptual traceability:

```text
slice-* → story-* → ex-* → ac-*
```

A storyboard step records:

```text
Context/state → action → visible response → next decision/outcome
```

Reuse an existing product shell, terminology, density, navigation, and controls when product UI exists. Show only the material delta. Do not manufacture UI alternatives; compare alternatives only for a real unresolved product decision.
