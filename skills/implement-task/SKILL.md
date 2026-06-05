---
name: implement-task
description: "Execute one approved Work Order v2 or legacy task using Understand → Plan → Code → Review → Report. Triggers on: implement task, execute work order, implement this, code this task, start implementation, work on task."
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
---

# Execute Work Order / Task

Implement exactly one approved execution unit.

Primary source of truth:

```text
docs/features/{feature}/work-orders/NNN-title.md
```

Legacy fallback:

```text
.features/{feature}/tasks/NNN-task-name.md
```

Prefer Work Order v2 for feature-flow work. Use legacy `.features/` tasks only when the repo or user explicitly chose that workflow.

## Prerequisites

### Work Order v2

Before starting:
- work order frontmatter has `status: ready`,
- strategy/model/decisions/proof are clear enough to execute,
- proof required is specific,
- escalation triggers are understood.

Do **not** execute `draft` or `blocked` work orders. Review or unblock them first.

### Legacy task

Before starting:
- task file exists at `.features/{feature}/tasks/NNN-task-name.md`,
- `status: open`,
- dependencies are done,
- task is implementation-ready.

If prerequisites are missing, stop and tell the user the next required action.

---

## Phase 1: Understand

Read the execution unit first.

Always try to find the relevant PRD and design before planning. Prefer:
- `docs/features/{feature}/prd.md`,
- `docs/features/{feature}/design.md`,
- `.features/{feature}/prd.md`,
- `.features/{feature}/design.md`,
- any PRD/design paths explicitly linked by the execution unit.

Read existing PRD/design docs for durable requirements, architecture decisions, boundaries, and verification expectations that affect the work. If they are missing, continue only if the execution unit is ready on its own; otherwise stop and ask for clarification or enrich it.

For Work Orders, also read only the relevant packet docs:
- `strategy.md` for intent,
- `system-model.md` for flow and code anchors,
- `decisions.md` for decisions to preserve,
- `proof.md` for verification.

Do targeted follow-up reads only when the execution unit, PRD, design, or packet docs point to them. Avoid broad repo wandering.

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
- proof matches `proof.md` / work-order requirements.

Fix review findings and rerun verification.

---

## Phase 5: Report / Finalize

### For Work Orders

1. Write or update an execution report under:

```text
docs/features/{feature}/execution/NNN-wo-XXX.md
```

2. Include:
- mission executed,
- linked work order id,
- repo-relative files changed,
- decisions preserved,
- deviations from plan,
- proof commands and results,
- strategic follow-up.

3. Mark execution report `status: complete` only after proof evidence is recorded.
4. Mark work order `status: done` only after implementation and report exist.
5. Regenerate/open the feature view if useful:

```text
/feature view {feature}
```

### For legacy tasks

1. Mark task `status: done`.
2. Update `_active.md` if present.
3. Update progress docs only if the repo uses them.

### Final response

```text
✅ Execution complete: {work order/task}
- Changed: {repo-relative files}
- Proof: {commands/checks passed}
- Report: {execution report path | legacy task status}
- Review: {self-review | deep review}
- Follow-up: {none | decision/proof/reown suggestion}
```

## Important

- One execution unit per session is preferred.
- Always try to find/read the relevant PRD and design, then do targeted follow-up reads on demand.
- Work Orders are optional; do not create them for tiny direct work unless they help.
- Do not mark done without proof.
- Use repo-relative paths in durable reports.
