# Interaction and States

Design the complete path, not one polished screenshot.

## Interaction story

```text
Arrival — where did the user come from and what state is visible?
Intent — what goal or decision is recognizable?
Action — what is the smallest useful next action?
Feedback — how does the interface acknowledge input?
Progress — what changed and what remains?
Completion — what observable result proves success?
Recovery — how are failure, conflict, cancellation, or correction handled?
```

Keep action names stable through the flow: `Publish` → `Publishing…` → `Published`. State is communicated with text/semantics as well as color or animation.

## Product-authority guard

Before adding a required control, field, role, category, validation/completion rule, storage behavior, export, or interaction capability, cite its approved requirement or existing implementation. If no source exists, do not silently add it: keep the slot generic, label the proposal conditional, or ask when the answer changes the flow. Treat quantities in prompts as scale examples unless they are explicitly limits. Do not fill missing domain structure with plausible categories or workflow steps.

## State matrix

Include only states the product can encounter, but do not omit a relevant state because it complicates the mockup.

| State | Questions |
| --- | --- |
| Initial | Is the current status and first action clear? |
| Loading/pending | Is work acknowledged? Can duplicate action occur? |
| Partial/stale | What is present, missing, or outdated? |
| Empty | Why is it empty and what useful action comes first? |
| Success | What changed, where is the result, what comes next? |
| Validation/error | What happened, which input/state is affected, how is it fixed? |
| Conflict | What changed elsewhere and what can be preserved or retried? |
| Disabled | Why unavailable and how can it become available? |
| Permission | Is lack of authority distinct from missing data or system failure? |
| Offline | What is local, queued, unavailable, or at risk? |
| Unsaved changes | What is preserved, discarded, or recoverable on navigation? |

## Forms

- Use explicit labels, appropriate types/input modes, autocomplete, and preserved input.
- Keep submit available until work starts; expose pending state and prevent accidental duplicate submissions.
- Place errors near the field and provide a summary/focus strategy when several fail.
- Do not block paste. Use examples as help, not labels.
- Destructive actions need clear consequence, confirmation when irrecoverable, or an undo window.

## Navigation and disclosure

- Use links for navigation and buttons for actions.
- Reflect shareable/reloadable state in the URL when users expect it.
- Keep current location and back behavior predictable.
- Use progressive disclosure for secondary detail, not to hide prerequisites, warnings, or recovery.
- Restore focus after dialogs, drawers, and temporary surfaces close.

## Purposeful interface motion

Motion is behavior, not polish applied afterward. Use it only to clarify feedback, state, continuity, causal order, or spatial origin.

- Feedback should begin within `100–160ms`; routine state changes use `160–260ms`; consequential layout/overlay changes use `260–420ms`.
- Prefer natural deceleration such as `cubic-bezier(.16, 1, .3, 1)` and small `8–12px` spatial cues.
- Preserve object identity across transitions instead of replacing it with unrelated entrance animation.
- Keep motion interruptible: newer input, navigation, server state, or cancellation wins safely.
- Never use page-wide stagger, perpetual decoration, or hover movement as the only affordance.
- Reduced motion removes continuous spatial/opacity choreography and delay while preserving feedback, state, focus, and completion.
- CSS/native project primitives come before a dependency; add a library only when repeated timelines, gestures, or shared-layout cleanup materially justify it.

## Content resilience

Test short, representative, and very long values; missing labels; multiline errors; localized expansion; RTL where supported; and unbroken identifiers. Do not solve overflow by hiding essential meaning.

At narrow widths, RTL, text resize, or 400% reflow, semantic rails, connectors, markers, and reading order must participate in intrinsic layout. Do not retain absolute positioning for a meaningful timeline rail or connector when variable-height content can overlap or detach it. Prefer per-item logical borders/grid tracks or remove a purely decorative connector while preserving text order and state.

## App-like offline artifacts

When a browser artifact filters, compares, selects, or exports a substantial dataset:

- keep filters, selection, comparison state, failures, and export consequences explicit;
- evaluate native controls against a suitable bundled accessible UI library rather than assuming either answer;
- preserve a printable/static summary that remains understandable without the interactive runtime;
- verify offline loading, keyboard completion, import/export round trips, responsive reflow, and representative dataset-scale latency.
