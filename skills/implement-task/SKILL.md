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

## Phase 2: Plan

Before coding, state:
1. files to create/modify,
2. tests to add/update,
3. patterns to mirror,
4. order of operations,
5. proof commands/manual checks,
6. whether any decision needs escalation.

For behavior changes, prefer `verification_plan` before editing unless the proof contract is already explicit.

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

### Final response

```text
✅ Execution complete: {task/work order}
- Changed: {repo-relative files}
- Proof: {commands/checks passed}
- Report: {.features/.../execution/...}
- Review: {self-review | deep review}
- Follow-up: {none | decision/proof suggestion}
```

## Important

- One execution unit per session is preferred.
- Work Orders are optional; do not create them for tiny direct work unless they help.
- Do not mark done without proof.
- Use repo-relative paths in execution reports.
