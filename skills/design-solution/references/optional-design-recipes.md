# Design Detail Recipes

Use the System shape impact map and architecture slice outline for every durable design. Load the other recipes when a changed row needs deeper treatment. These are architecture composition aids, not task plans.

## Evidence ledger

Before writing the proposal, record evidence and confidence:

```text
Need/acceptance or bounded technical outcome: {source}
Current entry points: {route | command | event | job | public function | UI}
Current owners: {domain types/entities, handlers, services, repositories, adapters, schemas}
Current behavior: {tests, transitions, persistence effects, failures, runtime signals}
Architecture constraints: {ADRs, dependency direction, compatibility, deployment, security, scale}
External evidence: {source/pattern, claim supported, applicability, deliberately excluded ideas}
Unknowns: {assumption, impact, owner, validation path}
```

The design must distinguish observed repository facts, approved product truth, external pattern evidence, proposed choices, and unresolved assumptions.

## System shape impact map

Cover every surface with one status and evidence:

```text
Surface | Changed | Unchanged | Not applicable
Architecture/modules | {current and proposed units, ownership, collaboration}
API and contracts | {callers, shape, outcomes, compatibility}
Domain model | {concepts, policy, invariants, transitions}
Data and persistence | {schema, transaction, migration, recovery}
Delivery and interface | {entry, components/adapters, states, recovery}
Integrations | {dependency, protocol, timeout/retry/idempotency}
Operations and rollout | {observability, deployment, flag, rollback, owner}
Verification shape | {acceptance boundary, seams, fixtures, regressions}
```

Use exactly one of **Changed | Unchanged | Not applicable** per row. For a changed row, name existing and proposed units, location, responsibility, inputs/outputs, state, dependencies, failure behavior, and non-responsibilities. Include complete contract shapes for changed seams and a concrete example when multiple units collaborate. For an unchanged or not-applicable row, cite why the approved behavior and chosen seam do not require a change.

## Solution overview and reference design

Every durable design must include both levels:

- **Solution overview:** explain the proposed system as if it already exists. Name the changed/new elements, show how they collaborate, and walk one concrete input/event through to the observable result.
- **Reference design:** define changed-surface contracts, state unions/transitions, persistence/API consequences, failure ownership, and algorithms or decision tables where implementation could otherwise diverge.

Use code blocks for durable shapes and pseudocode, not file-edit checklists. A top-level model stub is insufficient when nested states or fields affect ownership, compatibility, ordering, provenance, retry, or recovery.

## Domain and mechanism map

For every relevant flow, fill the direct implementation chain:

```text
Need/outcome → domain concepts/entities → relationship/ownership
→ trigger mechanism (API | event | command | job | UI)
→ controller/handler → application service/use case
→ domain policy/state transition → repository/adapter/gateway
→ database/external effect → result/event/UI
```

For each named unit state its responsibility, input/output contract, owned state, dependency direction, failure behavior, and explicit non-responsibilities. Describe entity relationships and invariants; do not list nouns without explaining how they collaborate.

### API-driven flow

State route/command shape, auth, validation, success/error contract, timeout, idempotency, versioning, and downstream effects.

### Event-driven flow

State event schema, producer, consumer, delivery semantics, ordering, deduplication/idempotency, retry/dead-letter behavior, eventual-consistency consequence, and recovery owner.

### Persistence and scale

State records, transaction/consistency boundary, migration/backfill/retention, indexing or partitioning pressure, concurrency behavior, expected growth, bottleneck, and the mechanism that scales or fails safely over time.

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

For each warranted contract, state. A changed contract is not complete until its success, failure, compatibility, and ownership consequences are explicit:

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

Use for every durable design. An architecture slice is an observable vertical outcome, not a task brief or package/layer phase. One slice is sufficient only when it covers the complete approved outcome and every changed shape row.

```text
ARCH-SLICE-001 — {observable outcome}
External need: {caller} needs {capability} to observe {result}.
Entry point: {UI action | route | command | event | public function}.
Acceptance boundary: {BDD/API/CLI/browser/contract observation}.
Outcome authority: {Approved PRD scenario/AC IDs for product-backed work | bounded technical request/contract IDs for technical-evidence-backed work}.
Participating units: {existing and proposed units from the shape map}.
Contract/state delta: {new or changed inputs, outputs, states, invariants, and ownership}
Path:
  1. Approved product/interface consequence, if relevant.
  2. Entry/delivery contract and visible errors.
  3. Application/module/service seam.
  4. Policy/state transition and invariant.
  5. Port/adapter/persistence handoff only when needed.
Material failure/recovery: {observable failure and owning recovery boundary}.
Proof strategy: {what evidence would make the slice credible}.
Build implication: {units/contracts/fixtures that must exist, without file-edit sequence or task commands}.
Depends on: {other architecture slices or none}.
Escalate if: {unknown that should not be mixed with delivery}.
```

Keep task commands, implementation steps, and actual results in the task packet.

## Traceability

Requirement traceability is mandatory for every durable design. Walk every approved BDD scenario, acceptance criterion, user story, API specification, event specification, invariant, or other explicit requirement through the proposed solution. Use one row/block per stable requirement or a compact matrix when the set is large.

A useful traceability row answers:

```text
Requirement ID/short statement
→ fit status
→ entry/trigger and participating elements
→ ordered calls/events/state transitions
→ contract/data/persistence consequence
→ observable result and failure/recovery
→ proof strategy
→ owning slice/ADR
→ mismatch and user-owned escalation, if any
```

A requirement with no honest fit is not coverage. Mark it unresolved or blocked, state the competing solution and consequence, name the decision owner, and request user input before changing the requirement or claiming the architecture is complete. Do not silently drop requirements, weaken acceptance, or invent a hidden workaround.

Do not reproduce the full PRD, task board, or file inventory.
