---
name: loop
description: "Autonomous execution loop over ready project-local tasks in .features/{feature}/tasks/. Triggers on: run the loop, start the loop, task loop, run task loop."
disable-model-invocation: true
---

# Loop - Autonomous Task Execution

Execute one ready task per iteration. Do not create continuation artifacts.

```text
.features/{feature}/tasks/_active.md    # first-read progress board
.features/{feature}/tasks/NNN-title.md  # source task briefs and task-local results
```

Use `simple-tasks` for state conventions and `implement-task` for execution.

## Start gate

- `.features/{feature}/tasks/` exists.
- `.features/{feature}/tasks/_active.md` exists or can be created/refreshed from task files before execution.
- At least one task has `status: ready`, legacy `status: open`, or `status: blocked` with a clearly agent-owned/local blocker.
- Dependencies are satisfied.
- Task brief is executable or locally fixable: `Brief`, `Execute`, `Feedback loop`, `Escalate if`.

If multiple features have ready work, ask which one to run.

## Modes

- Interactive: execute one task, summarize, ask before continuing.
- Background: `loop.sh` spawns a fresh agent per iteration until complete/blocked/max iterations.
- `loop.sh --task TASK-001`: execute only that task.

## Steps

1. Read `_active.md` and task briefs in `.features/{feature}/tasks/`, including any existing `## Result` sections.
2. If `_active.md` is missing or stale, create/refresh it from task frontmatter before selecting work.
3. Pick the target or next executable task using both `_active.md` and task frontmatter.
4. Resolve agent-owned blockers before declaring blocked: stale task metadata, missing `_active.md`, stale anchors, missing local feedback-loop commands, result/status drift, or in-scope check failures.
5. If a blocked task's blocker is agent-owned/local, document the unblock action, set it back to `status: ready`, refresh `_active.md`, then execute it. Keep user-owned blocked tasks blocked.
6. Load `implement-task` and execute exactly one task.
7. Record feedback-loop results in the task's `## Result` section.
8. If the next task needs context from this iteration, update that next task directly.
9. Mark task done and update `_active.md` only after results and review.
10. Report iteration status.

Ready/open/locally-blocked task is executable when:

- dependencies are done,
- `_active.md` points to the task or can be refreshed to do so,
- task-level `Execute` details are sufficient or locally fixable,
- feedback loop is present/executable or locally fixable,
- no user-owned product/architecture/API/schema/auth/persistence/rollout blocker exists.

If no task is executable, first try to make one executable when the blocker is local and agent-owned. Stop only for user-owned blockers or an exhausted local unblock/fix loop.

## Iteration output

```text
Loop iteration complete: TASK-XXX — {title}
Result: .features/{feature}/tasks/NNN-title.md updated
Active board: .features/{feature}/tasks/_active.md updated
Feedback loop: {summary}
Next: {continue | blocked | complete}
```

Blocked output:

```text
Loop blocked: user-owned — {specific blocker and owner}
Loop blocked: exhausted — {local blocker/failure after retry budget}
```

Do not use `Loop blocked:` for a blocker you can fix locally. Fix it, update task/_active/result state as needed, and either complete the task or end with `Loop iteration complete:` so the harness continues.

## Completion

When targeted work is done:

- ensure completed/blocked tasks have current `## Result` sections,
- ensure any next-task handoff context was written directly into the next task,
- ensure `_active.md` shows all completed tasks checked off or the next blocker,
- run final regression gate if required by task feedback loops,
- update durable docs only for reusable architecture/product lessons,
- do not commit/push unless explicitly expected.
