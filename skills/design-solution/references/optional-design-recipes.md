# Optional Design Recipes

Load only the recipe that answers the current architecture question. These are composition aids, not required sections or a fixed order.

## Interface consequences

Use when approved visible behavior forces implementation choices.

Capture only:

- existing surface/component and entry point,
- visible state transitions and recovery states,
- accessibility/responsiveness constraints,
- library/style/motion choices that materially affect delivery or risk,
- the boundary between product behavior and implementation discretion.

Reuse approved PRD evidence. Do not create alternative product directions or redraw sufficient mockups.

## Contracts, domain, data, and persistence

Use when a boundary owns an important contract, invariant, state transition, migration, or recovery concern.

For each warranted contract, state:

```text
Owner and callers
Input/event shape
Success and failure result
Compatibility/versioning rule
Invariant or authorization rule
Persistence/transaction boundary, if any
Migration/recovery consequence, if any
```

Show domain concepts only when they pull architecture: owner → action/verb → target state/effect → invariant. Prefer conceptual shapes and links to canonical schemas over field inventories.

## Operations, rollout, and risk

Use when deployment or runtime behavior can change safety or user-visible outcomes.

Capture the smallest useful set:

- failure signal and owner,
- observability needed to distinguish healthy, empty, degraded, and failed states,
- rollout/feature-flag/compatibility sequence,
- rollback or recovery boundary,
- security/privacy/data-retention concern,
- unresolved risk and escalation owner.

Omit this role for local deterministic changes with no operational consequence.

## Outside-in architecture slice outline

Use when architecture review benefits from sequencing, delegation, approval, or tracer bullets. An architecture slice is an observable vertical outcome, not a task brief or package/layer phase.

```text
ARCH-SLICE-001 — {observable outcome}
External need: {caller} needs {capability} to observe {result}.
Entry point: {UI action | route | command | event | public function}.
Acceptance boundary: {BDD/API/CLI/browser/contract observation}.
Path:
  1. Approved product/interface consequence, if relevant.
  2. Entry/delivery contract and visible errors.
  3. Application/module/service seam.
  4. Policy/state transition and invariant.
  5. Port/adapter/persistence handoff only when needed.
Proof strategy: {what evidence would make the slice credible}.
Escalate if: {unknown that should not be mixed with delivery}.
```

Keep task commands, implementation steps, and actual results in the task packet.

## Traceability

Prefer links from architecture claims to PRD acceptance IDs, ADRs, symbols, and tests. Add a matrix only when reviewers cannot otherwise see coverage across multiple independently varying contracts or slices.

A useful traceability row answers:

```text
Approved outcome/AC → architecture seam → observable path/proof → owning slice or ADR
```

Do not reproduce the full PRD, task board, or file inventory.
