---
name: implement-task
description: "Execute one approved task from .features/{feature}/tasks/ using Understand → Plan → Code → Review → Report. Triggers on: implement task, execute task, code task."
allowed-tools: Bash Read Edit Write
---

# Implement Task

Implement exactly one approved task.

Source of truth:

```text
.features/{feature}/tasks/NNN-title.md  # execution contract
.features/{feature}/tasks/_active.md    # feature/loop progress board
```

The task brief is the execution contract; `_active.md` is the navigation/status board for looped or resumable work.

Context, when linked/relevant:

```text
docs/features/{feature}/strategy.md
docs/features/{feature}/prd.md
docs/features/{feature}/system-model.md
docs/adrs/{architecture,api,web}.md
```

## Start gate

Proceed only if:

- task status is `ready` (`open` only for executable legacy tasks),
- dependencies are satisfied,
- `## Brief`, `## Execute`, `## Feedback loop`, and `## Escalate if` exist,
- the feedback loop is executable,
- for looped or multi-task work, `_active.md` exists or can be refreshed from task files.

Stop on `draft`, `blocked`, missing context, or user-owned ambiguity.

---

## 1. Understand

Read in this order:

1. `_active.md` when present or when running as part of a loop,
2. task brief,
3. linked strategy/PRD/system-model/ADRs only as needed,
4. targeted code anchors from `## Execute`.

Capture: goal, files, risks, agent-owned choices, feedback loop, escalation triggers.

Avoid broad repo wandering. Do not invent product or architecture behavior.

## 2. Tighten task if needed

If missing details are local and agent-owned, update the task before coding.

Allowed local fixes:

- stale file/function anchors,
- missing/stale `_active.md` checklist/current/next lines,
- test file placement,
- local helper names/interfaces,
- clearer fast checks or regression gate,
- extra edge checks that strengthen verification.

Escalate instead if the gap affects product behavior, high-level architecture, API/schema, auth/privacy, persistence/migration, rollout, or an unexecutable feedback loop.

## 3. Plan

State briefly:

- files to edit/create,
- tests/checks to add or run,
- pattern to mirror,
- order of work,
- feedback-loop commands/actions,
- escalation status.

## 4. Code

Use small increments.

- Prefer TDD for behavior changes.
- Run the narrowest feedback-loop check after meaningful changes.
- Match nearby patterns; avoid unrelated refactors.
- If a check reveals a local task gap, update the task and continue.
- If a check reveals a user-owned decision, stop as blocked.

## 5. Review

Self-review small/local changes. Use oracle/deep review for large, risky, auth/security/payment, schema/API, persistence, or cross-cutting changes.

Check: scope, architecture/ADR consistency, edge cases, tests, feedback-loop evidence.

## 6. Report / finalize

Write evidence to:

```text
.features/{feature}/execution/NNN-title.md
```

Minimum report:

```markdown
---
id: ER-001
workTask: TASK-001
status: complete
created: YYYY-MM-DD
---

# ER-001 — TASK-001

- Changed: `path`, `path`
- Feedback loop: `command/action` → result
- Review: self/oracle; findings resolved
- Deviations: none | ...
- Follow-up: none | ...
```

After evidence is recorded:

1. Mark task `status: done`.
2. Update `_active.md`: check off the completed task, record or point to the execution report, set `Current` to `none`, and set `Next` to the next ready task, `complete`, or `blocked`.
3. If `_active.md` is missing for a looped or multi-task feature, create it from the task files before reporting completion.

Do not mark the task `done` until implementation, review, and feedback-loop evidence are recorded.

Refresh semantic index after code/doc changes when available; record skipped/running/fresh status.

## Final response

```text
✅ Execution complete: TASK-XXX
- Changed: ...
- Feedback loop: ...
- Report: .features/.../execution/...
- Active board: .features/.../tasks/_active.md updated | not used
- Review: ...
- Semantic index: ...
- Follow-up: ...
```
