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

## 4. Implement/check/fix loop

Use small increments. Complete one feedback loop before widening scope.

Loop:

1. Implement the smallest in-scope change that can move the task toward the desired state.
2. Run the `Fast` check from `## Feedback loop` after each meaningful change.
3. If the fast check passes, run the practical `User/system` and `Edge` checks.
4. If a check fails, diagnose the smallest in-scope cause, fix it, and rerun the same failing check before moving on.
5. After required task checks pass, run the `Gate` command from `## Feedback loop`.
6. If the gate fails because of this task's scope, fix and rerun the failing command, then rerun the gate.

Retry rules:

- Default max: 3 fix attempts per distinct failure before stopping as blocked.
- If the same failure repeats twice with no new information, stop and ask oracle/deep review or report blocked.
- If a check reveals a local task gap, update the task and continue.
- If a check reveals a user-owned decision, unrelated regression, missing environment/data, or out-of-scope architecture/API/schema/auth/persistence concern, stop as blocked.
- Use context-efficient output (`scripts/run_silent.sh` or equivalent) for noisy commands; keep success terse and preserve failure details.
- Do not mark the task done while any required check fails or is skipped without an explicit reason.

## 5. Review

Self-review small/local changes. Use oracle/deep review for large, risky, auth/security/payment, schema/API, persistence, repeated loop failure, or cross-cutting changes.

Check: scope, architecture/ADR consistency, edge cases, tests, feedback-loop evidence, and whether the final gate passed after the last fix.

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
- Feedback loop: `command/action` → result, including failed attempts/fixes when relevant
- Gate: `command` → passed/failed/skipped with reason
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
