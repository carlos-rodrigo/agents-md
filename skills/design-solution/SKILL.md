---
name: design-solution
description: "Model a feature's high-level system design from approved strategy/PRD: current flow, intended flow, architecture state, ADRs when needed, and optional work orders. Triggers on: create design, design this, system model, plan phases, break down strategy, tracer bullets."
---

# Feature System Model / Design

Use this skill when implementation needs a durable high-level system model before coding.

Default durable artifacts:

```text
docs/features/{feature}/strategy.md     # product direction source
docs/features/{feature}/prd.md          # product definition / BDD requirements when needed
docs/features/{feature}/system-model.md # current intended architecture and principal workflows
docs/adrs/                              # optional system-level ADRs by architectural area
```

Optional execution units live outside docs:

```text
.features/{feature}/tasks/   # gitignored task briefs with task-level design and feedback loops
```

A standalone `design.md` is optional/legacy. Create it only when the user explicitly asks for a design doc or the repo already uses that artifact.

Do **not** create generic `decisions.md` or `proof.md` files by default. The current desired architecture belongs in `system-model.md`; durable rationale for architecture-significant changes belongs in ADRs; task verification belongs in each task's feedback loop.

## Design granularity

Default to one collective `system-model.md` for the feature. It should describe the stack/architecture shape, principal workflows, shared invariants, boundaries, rollout, and major tradeoffs as the **current intended state**.

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
- execution should be split into Work Orders with task-level design and feedback loops.

Skip durable design when the change is small, the strategy and feedback loop are clear, and implementation can proceed directly.

## Process

### 1. Read approved strategy and PRD

Prefer:
1. `docs/features/{feature}/strategy.md`
2. `docs/features/{feature}/prd.md` when product definition / BDD requirements exist
3. an approved feature brief in chat

If PRD behavior is still ambiguous, use `prd` to clarify BDD requirements before designing. If an architecture-significant choice is missing, ask the user or capture an explicit ADR instead of designing around a hidden assumption.

Design gate:
- PRD/user stories are clear enough to identify principal workflows and architecture boundaries.
- Open product questions stay in the PRD; do not convert them into design assumptions silently.
- Architecture-significant open questions are called out in `system-model.md` and resolved by ADR when needed.
- Task-level unknowns may be deferred to Work Orders if they do not change high-level architecture or product behavior.

### 2. Inspect the system

Read/search enough code to anchor the model:
- actors/triggers,
- current components/functions/routes/jobs,
- data/state ownership,
- boundaries and contracts,
- PRD BDD requirements and acceptance criteria,
- verification surfaces that tasks can use for feedback loops.

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

| PRD story / requirement | High-level design response | Task feedback-loop hook | Status |
| --- | --- | --- | --- |
| `prd.md#...` | workflow/boundary/component response | `.features/{feature}/tasks/...#feedback-loop` or `TBD` | planned |

## Requirement gaps / questions

- Product behavior that must be clarified before implementation.
- Architecture-significant questions that need an ADR before implementation.
- Task-level details that can safely be deferred to Work Orders.

## Alternatives considered

| Option | Pros | Cons | Outcome |
| --- | --- | --- | --- |
| ... | ... | ... | chosen / rejected / needs ADR |

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

## ADRs

- `docs/adrs/architecture.md` — whole-system architecture decisions.
- `docs/adrs/api.md` — API boundary/contract decisions, when needed.
- `docs/adrs/web.md` — web/client architecture decisions, when needed.

## Diagram candidates

- `current-flow.html`
- `intended-flow.html`
- `code-flow.html`
- `domain-model.html`
```

Use the `system-diagram` skill for diagrams under `docs/features/{feature}/diagrams/` when a visual model will help the user retain the system.

### 4. Record ADRs only when needed

Create or update a system-level ADR only for architecture-significant decisions where durable rationale matters, such as API/schema boundaries, auth/security/privacy, persistence/migration, rollout strategy, cross-service ownership, or major module boundaries.

Use ADR files by architectural area, created when needed:

```text
docs/adrs/architecture.md # whole-system architecture
docs/adrs/api.md          # API boundaries/contracts
docs/adrs/web.md          # web/client architecture
```

Suggested ADR section shape inside the relevant file:

```markdown
## {Decision title}

Status: Proposed | Accepted | Superseded by {section/link}
Date: YYYY-MM-DD

### Context

What architectural state or constraint forced this choice?

### Decision

The chosen architecture direction.

### Consequences

- Positive consequences.
- Tradeoffs / risks.
- Follow-up required.
```

Do not use ADRs as a running conversation log or feature-local task history. ADRs are system-level architecture records grouped by architectural area. When architecture changes, update the relevant architecture/system model to the new intended state and update the relevant ADR file only if the rationale must be preserved.

### 5. Defer verification to task feedback loops

Do not create a default feature-level `proof.md`. Verification is task-local by default.

Each task/work order should include a compact `## Feedback loop` from the `feedback-loop` skill: desired state, fastest check, user/system check, edge case, gate, and evidence path.

If a feature has cross-task release acceptance that cannot fit inside individual tasks, capture it in the relevant task or ask before creating a separate release checklist.

### 6. Create execution units only when useful

Use tasks/Work Orders when execution should be approved, split, delegated, or resumed later. Put them under ignored `.features/{feature}/tasks/`, not `docs/features/`.

Execution units should follow `simple-tasks`: compact, agent-readable, and progressively disclosed. Include only execution-critical goal/context/files/risks/feedback loop up front; link human-oriented strategy/PRD/system-model/ADRs instead of copying them.

Small approved features may skip tasks/Work Orders and execute directly from strategy/model plus an inline feedback loop.

## Output

End with:

```text
Design gate: {satisfied | blocked pending PRD/architecture clarification}
Design mode: high-level system model; task-level design and feedback loops deferred to Work Orders
System model updated: docs/features/{feature}/system-model.md
ADRs: {none | docs/adrs/architecture.md | docs/adrs/api.md | docs/adrs/web.md}
Execution units: {none | .features/{feature}/tasks/...}
Next: {execute directly | create/review Work Orders | resolve PRD/architecture questions | define task feedback loops}
```
