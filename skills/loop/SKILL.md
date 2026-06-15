---
name: loop
description: "Autonomous execution loop over ready project-local tasks in .features/{feature}/tasks/. Triggers on: run the loop, start the loop, task loop, run task loop."
disable-model-invocation: true
---

# Loop - Autonomous Task Execution

Execute one ready task per iteration. Do not create continuation artifacts.

```text
.features/{feature}/tasks/_active.md    # first-read progress board
.features/{feature}/tasks/NNN-title.md  # source task briefs
.features/{feature}/execution/          # evidence
```

Use `simple-tasks` for state conventions and `implement-task` for execution.

## Start gate

- `.features/{feature}/tasks/` exists.
- `.features/{feature}/tasks/_active.md` exists or can be created/refreshed from task files before execution.
- At least one task has `status: ready` or legacy `status: open`.
- Dependencies are satisfied.
- Task brief is executable or locally fixable: `Brief`, `Execute`, `Feedback loop`, `Escalate if`.

If multiple features have ready work, ask which one to run.

## Modes

- Interactive: execute one task, report, ask before continuing.
- Background: `loop.sh` spawns a fresh agent per iteration until complete/blocked/max iterations.
- `loop.sh --task TASK-001`: execute only that task.

## Steps

1. Read `_active.md`, task briefs in `.features/{feature}/tasks/`, and existing `.features/{feature}/execution/`.
2. If `_active.md` is missing or stale, create/refresh it from task frontmatter before selecting work.
3. Pick the target or next executable ready/open task using both `_active.md` and task frontmatter.
4. Load `implement-task` and execute exactly one task.
5. Record feedback-loop evidence in `.features/{feature}/execution/`.
6. Mark report complete, mark task done, and update `_active.md` only after evidence and review.
7. Report iteration status.

Ready/open task is executable when:

- dependencies are done,
- `_active.md` points to the task or can be refreshed to do so,
- task-level `Execute` details are sufficient or locally fixable,
- feedback loop is present/executable or locally fixable,
- no user-owned product/architecture/API/schema/auth/persistence/rollout blocker exists.

If no task is executable, stop and report the blocker.

## Iteration output

```text
Loop iteration complete: TASK-XXX — {title}
Report: .features/{feature}/execution/...
Active board: .features/{feature}/tasks/_active.md updated
Feedback loop: {summary}
Next: {continue | blocked | complete}
```

Blocked output:

```text
Loop blocked: {specific blocker and owner}
```

## Completion

When targeted work is done:

- ensure reports are complete,
- ensure `_active.md` shows all completed tasks checked off or the next blocker,
- run final regression gate if required by task feedback loops,
- update durable docs only for reusable architecture/product lessons,
- do not commit/push unless explicitly expected.
