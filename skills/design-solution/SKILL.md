---
name: design-solution
description: "Model a feature's high-level system design from approved strategy/PRD: current flow, intended flow, decisions, proof, and optional work orders. Triggers on: create design, design this, system model, plan phases, break down strategy, tracer bullets."
---

# Feature System Model / Design

Use this skill when implementation needs a durable system model or decision record before coding.

Default durable artifacts:

```text
docs/features/{feature}/strategy.md     # product direction source
docs/features/{feature}/prd.md          # product definition / BDD requirements when needed
docs/features/{feature}/system-model.md # high-level architecture and principal workflows
docs/features/{feature}/decisions.md
docs/features/{feature}/proof.md
```

Optional execution units live outside docs:

```text
.features/{feature}/tasks/   # gitignored
```

A standalone `design.md` is now optional/legacy. Create it only when the user explicitly asks for a design doc or the repo already uses that artifact.

## Design granularity

Default to one collective `system-model.md` for the feature. It should describe the stack/architecture shape, principal workflows, shared invariants, boundaries, rollout, and major tradeoffs.

Do **not** put low-level implementation design in `system-model.md`. Task-level design belongs in the Work Order that implements one vertical slice.

Design should not invent product behavior. If the PRD/user stories are too vague for architecture, pause and update the PRD with clearer BDD requirements before designing.

## When to use

Use this skill when:
- current vs intended behavior is not obvious,
- approved PRD requirements need high-level architecture/workflow modeling,
- multiple implementation approaches exist,
- domain concepts/states/rules need naming,
- API/schema/auth/migration boundaries matter,
- rollout/rollback/observability concerns matter,
- execution should be split into Work Orders with task-level design.

Skip durable design when the change is small, the strategy/proof are clear, and implementation can proceed directly.

## Process

### 1. Read approved strategy and PRD

Prefer:
1. `docs/features/{feature}/strategy.md`
2. `docs/features/{feature}/prd.md` when product definition / BDD requirements exist
3. an approved feature brief in chat

If PRD behavior is still ambiguous, use `prd` to clarify BDD requirements before designing. If strategic decisions are missing, ask or update `decisions.md` before designing around assumptions.

Design gate:
- PRD/user stories are clear enough to identify principal workflows and architecture boundaries.
- Open product questions stay in the PRD/decisions; do not convert them into design assumptions silently.
- Task-level unknowns may be deferred to Work Orders if they do not change high-level architecture or product behavior.

### 2. Inspect the system

Read/search enough code to anchor the model:
- actors/triggers,
- current components/functions/routes/jobs,
- data/state ownership,
- boundaries and contracts,
- PRD BDD requirements and acceptance criteria,
- tests/verification surfaces.

Do not create exhaustive file inventories. Capture only anchors that matter for execution.

### 3. Write the system model

Use `system-model.md`:

```markdown
# System Model: {Feature Name}

## Current flow

Actor/input → current components/functions → current behavior/output.

## Intended flow

Actor/input → changed components/functions → intended behavior/output.

## Key concepts

- Concept: meaning, states, rules.

## Invariants

- Rules that must remain true.

## Boundaries

- Module/service/process/API boundaries and ownership.

## Requirement coverage

| PRD story / requirement | High-level design response | Proof hook | Status |
| --- | --- | --- | --- |
| `prd.md#...` | workflow/boundary/component response | `proof.md#...` | planned |

## Requirement gaps / questions

- Product behavior that must be clarified before implementation.
- Task-level details that can safely be deferred to Work Orders.

## Alternatives considered

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| ... | ... | ... | ... |

## Rollout / rollback

- Rollout:
- Rollback:
- Migration/backfill:
- Compatibility or feature flag plan:

## Operational concerns

- Observability:
- Security/privacy:
- Performance:
- Accessibility:

## Code anchors

- `{file/function}` — why it matters.

## Diagram candidates

- `current-flow.html`
- `intended-flow.html`
- `code-flow.html`
- `domain-model.html`
```

Use the `system-diagram` skill for diagrams under `docs/features/{feature}/diagrams/` when a visual model will help the user retain the system.

### 4. Record decisions

Update `decisions.md`:

```markdown
| ID | Status | Decision | Why | Owner | Date |
| --- | --- | --- | --- | --- | --- |
| D-001 | decided | ... | ... | user | YYYY-MM-DD |
```

Mark unresolved items as `proposed` or `open`; do not let them silently become implementation assumptions.

Treat accepted architecture-significant decisions as append-only. If direction changes, add a new row that supersedes the earlier decision instead of rewriting history.

### 5. Define proof

Update `proof.md` with acceptance evidence linked to PRD scenarios and high-level design risks. Every non-trivial PRD story should have at least one targeted check or an explicit test exception, plus the final regression gate.

### 6. Create execution units only when useful

Use tasks/Work Orders when execution should be approved, split, delegated, or resumed later. Put them under ignored `.features/{feature}/tasks/`, not `docs/features/`.

Each execution unit should include:
- mission,
- strategic/PRD context,
- task-level low-level design,
- decisions to preserve or make locally,
- agent-owned choices,
- escalation triggers,
- proof required,
- execution report expectation.

Small approved features may skip tasks/Work Orders and execute directly from strategy/model/decisions/proof.

## Output

End with:

```text
Design gate: {satisfied | blocked pending PRD/decision clarification}
Design mode: high-level system model; task-level design deferred to Work Orders
System model updated: docs/features/{feature}/system-model.md
Decisions updated: docs/features/{feature}/decisions.md
Proof updated: docs/features/{feature}/proof.md
Execution units: {none | .features/{feature}/tasks/...}
Next: {execute directly | create/review Work Orders | resolve decisions | define proof}
```
