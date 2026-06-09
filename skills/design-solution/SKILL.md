---
name: design-solution
description: "Model a feature's system design from approved strategy: current flow, intended flow, decisions, proof, and optional work orders. Triggers on: create design, design this, system model, plan phases, break down strategy, tracer bullets."
---

# Feature System Model / Design

Use this skill when implementation needs a durable system model or decision record before coding.

Default durable artifacts:

```text
docs/features/{feature}/system-model.md
docs/features/{feature}/decisions.md
docs/features/{feature}/proof.md
```

Optional execution units live outside docs:

```text
.features/{feature}/tasks/   # gitignored
```

A standalone `design.md` is now optional/legacy. Create it only when the user explicitly asks for a design doc or the repo already uses that artifact.

## When to use

Use this skill when:
- current vs intended behavior is not obvious,
- multiple implementation approaches exist,
- domain concepts/states/rules need naming,
- API/schema/auth/migration boundaries matter,
- execution should be split into Work Orders.

Skip durable design when the change is small, the strategy/proof are clear, and implementation can proceed directly.

## Process

### 1. Read approved strategy

Prefer:
1. `docs/features/{feature}/strategy.md`
2. an approved feature brief in chat
3. a classic `prd.md` only if that is the available source

If strategic decisions are missing, ask or update `decisions.md` before designing around assumptions.

### 2. Inspect the system

Read/search enough code to anchor the model:
- actors/triggers,
- current components/functions/routes/jobs,
- data/state ownership,
- boundaries and contracts,
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

### 5. Define proof

Update `proof.md` with acceptance evidence, targeted checks, manual/E2E checks, and final regression gate.

### 6. Create execution units only when useful

Use tasks/Work Orders when execution should be approved, split, delegated, or resumed later. Put them under ignored `.features/{feature}/tasks/`, not `docs/features/`.

Each execution unit should include:
- mission,
- strategic context,
- decisions to preserve,
- agent-owned choices,
- escalation triggers,
- proof required,
- execution report expectation.

Small approved features may skip tasks/Work Orders and execute directly from strategy/model/decisions/proof.

## Output

End with:

```text
System model updated: docs/features/{feature}/system-model.md
Decisions updated: docs/features/{feature}/decisions.md
Proof updated: docs/features/{feature}/proof.md
Execution units: {none | .features/{feature}/tasks/...}
Next: {execute directly | review task/work order | resolve decisions | define proof}
```
