---
name: implement-task
description: "Execute one approved task/work order from ignored .features/{feature}/tasks/ using Understand → Plan → Code → Review → Report. Triggers on: implement task, execute work order, code task."
allowed-tools: Bash Read Edit Write
---

# Execute Task / Work Order

Implement exactly one approved execution unit.

Execution source of truth:

```text
.features/{feature}/tasks/NNN-title.md
```

Durable context may live in `docs/features/{feature}/` (`strategy.md`, `system-model.md`, `decisions.md`, `proof.md`), but tasks/work orders and execution reports stay under ignored `.features/`.

## Prerequisites

Before starting:
- task/work-order file exists under `.features/{feature}/tasks/`,
- frontmatter status is `ready` (`open` is acceptable for legacy tasks),
- dependencies are done or irrelevant,
- proof required is specific enough to run,
- escalation triggers are understood.

Do **not** execute `draft` or `blocked` units. Stop and tell the user the next required action.

---

## Phase 1: Understand

Read the execution unit first.

Then read only relevant durable context when present or linked:
- `docs/features/{feature}/strategy.md` for intent,
- `docs/features/{feature}/system-model.md` for flow and code anchors,
- `docs/features/{feature}/decisions.md` for decisions to preserve,
- `docs/features/{feature}/proof.md` for verification,
- classic `prd.md` / `design.md` only if explicitly linked or used by the repo.

Do targeted code reads/searches from the execution unit and docs. Avoid broad repo wandering.

Capture:
- mission,
- decisions to preserve,
- agent-owned choices,
- escalation triggers,
- proof required,
- likely files/tests.

If product/system ambiguity appears, stop and escalate instead of inventing behavior.

---

## Phase 1.5: Work Order design sufficiency gate

Before planning code, call `verification_plan` unless the Work Order and linked `proof.md` already contain an explicit, executable proof contract. Use the Work Order path and any likely changed paths known so far.

Then verify that the Work Order's task-level design is sufficient for this execution slice.

Required design sufficiency checks:
- Mission is one behavior or one vertical slice.
- Task-level design identifies files/modules to create or modify. For greenfield or missing-file work, planned new files/modules are acceptable substitutes for existing anchors.
- Local contracts/interfaces, data/state ownership, edge/error/permission handling, and tests/proof are clear enough to implement without inventing product or system behavior.
- Existing-code anchors still match reality when files exist. If anchors are stale, re-read/search narrowly and correct the Work Order before coding.
- Patterns to mirror or intentionally introduce are stated. In greenfield work, name the initial local pattern explicitly.
- Agent-owned choices and escalation triggers are explicit.
- Design is consistent with `system-model.md`, `decisions.md`, and `proof.md` when present.

If design is insufficient but the missing choices are local to this Work Order, complete or correct the `## Task-level design`, `## Likely code anchors`, `## Agent-owned choices`, `## Escalation triggers`, and `## Proof required` sections before coding. Mark the update as task-level design completion; do not promote local implementation details to durable docs.

Local choices the agent may complete:
- file/function/component names within the slice,
- internal module boundaries that do not affect other Work Orders,
- helper interfaces used only by this slice,
- test file placement and narrow proof commands,
- adaptation to stale anchors when behavior and architecture are unchanged.

Stop and escalate instead of completing the design when the gap affects:
- product behavior or acceptance criteria,
- high-level architecture or cross-task boundaries,
- public API/schema contracts,
- auth/security/privacy/permissions,
- persistence/migration/backfill decisions,
- rollout/rollback strategy,
- proof that cannot be made executable.

For greenfield tasks with no existing code anchors, the Work Order must define the first local architecture for the slice: planned files/modules, responsibilities, local contracts, test approach, and what is intentionally deferred. Lack of existing files is not a blocker; lack of task-level design is.

---

## Phase 2: Plan

Before coding, state:
1. files to create/modify,
2. tests to add/update,
3. patterns to mirror or introduce,
4. order of operations,
5. proof commands/manual checks from `verification_plan` and the Work Order,
6. whether any decision needs escalation,
7. whether the Work Order design was already sufficient, locally completed, corrected for stale anchors, or blocked.

---

## Phase 3: Code

Use tight feedback loops.

For behavior changes, prefer TDD:

```text
RED → write failing test
GREEN → minimal implementation
REFACTOR → clean up while green
```

Rules:
- keep steps small,
- match nearby patterns,
- no unrelated refactors,
- run the narrowest proof first,
- use `scripts/run_silent.sh` when available,
- rerun relevant verification after meaningful changes.

---

## Phase 4: Review

Review proportional to risk.

Self-review small/local changes. Use oracle/deep review for larger, risky, auth/security/payment, schema/API, or cross-cutting changes.

Check:
- decisions preserved,
- no scope creep,
- tests cover behavior,
- edge cases handled,
- proof matches the task/work order and `proof.md` when present.

Fix review findings and rerun verification.

---

## Phase 5: Report / Finalize

1. Write or update an execution report under:

```text
.features/{feature}/execution/NNN-wo-XXX.md
```

2. Include:
- mission executed,
- linked task/work-order id,
- repo-relative files changed,
- decisions preserved,
- deviations from plan,
- proof commands and results,
- follow-up.

3. Mark report `status: complete` only after proof evidence is recorded.
4. Mark task/work order `status: done` only after implementation and report exist.
5. Refresh the semantic-search index after code/doc changes so future agents can find the new design and implementation context. Prefer checking index freshness first; if a rebuild is already running, do not start a duplicate. Record the index action/status in the execution report or final response.

### Final response

```text
✅ Execution complete: {task/work order}
- Changed: {repo-relative files}
- Proof: {commands/checks passed}
- Report: {.features/.../execution/...}
- Review: {self-review | deep review}
- Semantic index: {refreshed | already fresh | rebuild already running | skipped: reason}
- Follow-up: {none | decision/proof suggestion}
```

## Important

- One execution unit per session is preferred.
- Work Orders are optional; do not create them for tiny direct work unless they help.
- Do not mark done without proof.
- Use repo-relative paths in execution reports.
