---
name: loop
description: "Autonomous execution loop over ready project-local tasks in .features/{feature}/tasks/. Triggers on: run the loop, start the loop, task loop, run task loop."
disable-model-invocation: true
---

# Loop - Autonomous Task Execution

Execute one ready task per iteration. Do not create continuation artifacts.

```text
.features/{feature}/tasks/      # source
.features/{feature}/execution/  # evidence
```

Use `simple-tasks` for state conventions and `implement-task` for execution.

## Start gate

- `.features/{feature}/tasks/` exists.
- At least one task has `status: ready` or legacy `status: open`.
- Dependencies are satisfied.
- Task brief is executable or locally fixable: `Brief`, `Execute`, `Feedback loop`, `Escalate if`.

If multiple features have ready work, ask which one to run.

## Modes

- Interactive: execute one task, report, ask before continuing.
- Background: `loop.sh` spawns a fresh agent per iteration until complete/blocked/max iterations.
- `loop.sh --task TASK-001`: execute only that task.

## Steps

1. Read task state: `.features/{feature}/tasks/` and existing `.features/{feature}/execution/`.
2. Pick the target or next executable ready/open task.
3. Load `implement-task` and execute exactly one task.
4. Record feedback-loop evidence in `.features/{feature}/execution/`.
5. Mark report complete and task done only after evidence and review.
6. Report iteration status.

Ready/open task is executable when:

- dependencies are done,
- task-level `Execute` details are sufficient or locally fixable,
- feedback loop is present/executable or locally fixable,
- no user-owned product/architecture/API/schema/auth/persistence/rollout blocker exists.

If no task is executable, stop and report the blocker.

## Iteration output

```text
Loop iteration complete: TASK-XXX — {title}
Report: .features/{feature}/execution/...
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
- run final regression gate if required by task feedback loops,
- update durable docs only for reusable architecture/product lessons,
- do not commit/push unless explicitly expected.
