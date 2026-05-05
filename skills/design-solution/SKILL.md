---
name: design-solution
description: "Turn an approved brief or PRD into a concise implementation design when a separate design doc is actually useful. Triggers on: create design, design this, plan phases, break down prd, tracer bullets."
---

# Design Solution

Use this skill when a separate design doc will reduce execution risk.

## First decide if a design doc is warranted

Write `docs/features/{feature}/design.md` when:
- the change is cross-cutting or multi-day,
- there are multiple reasonable technical approaches,
- schema/API/auth/migration decisions matter,
- or the user explicitly asks for design.

Skip the design doc and recommend direct task creation or implementation when:
- the change is bounded and the approach is obvious,
- there are no durable technical tradeoffs,
- or a short chat plan is enough.

If you skip it, say so explicitly and recommend the lighter path.

---

## Process

### 1. Read the approved context

Prefer, in order:
1. `docs/features/{feature}/prd.md`
2. an approved brief in chat
3. the user prompt

If none exist, ask for the missing context.

### 2. Explore the codebase

Understand current architecture, patterns, seams, and verification surfaces.
Capture only the findings that execution will actually need:
- existing modules/components/handlers to mirror,
- likely integration points,
- tests and verification surfaces,
- contracts or constraints that must be preserved.

### 3. Identify durable decisions

Focus on decisions unlikely to change during implementation:
- route or workflow shape,
- schema/API boundaries,
- data ownership,
- third-party integration boundaries,
- migration/rollback approach.

### 4. Slice the work only as far as needed

If this work benefits from tasking, break it into thin vertical slices:
- each slice should be independently verifiable,
- prefer a few thin slices over a giant phase plan,
- do not force phases for a one-step change.

### 5. Check granularity with the user

Present the proposed slices/decisions and ask:
- too coarse?
- too fine?
- any decision that still needs input?

Iterate until approved.

### 6. Write the design

Save to `docs/features/{feature}/design.md`.

---

## Template

```markdown
# Design: {Feature Name}

> Context: docs/features/{feature}/prd.md or approved brief

## Goal

One short paragraph on the technical outcome this design enables.

## Key Decisions

- **Decision 1**: what we chose and why
- **Decision 2**: what we chose and why

## Implementation Slices

### Slice 1: {Title}
- Outcome:
- Main changes:
- Verification:

### Slice 2: {Title}
- Outcome:
- Main changes:
- Verification:

## Risks / Open Questions

- Risk or unresolved tradeoff
```

---

## Guidelines

- **Minimum durable design** — record only decisions that matter later
- **No architecture essay** — keep it concise and execution-oriented
- **Verification in every slice** — each slice should say how it will be checked
- **No file inventories for their own sake** — mention likely seams, not exhaustive paths
- **Use tasks only when they help** — don’t force decomposition for small work

---

## Next Step

After design approval:
- If the work should be split, say **"create tasks"**
- If the work is still small enough to do directly, implement without forcing task files
