---
name: loop
description: "Autonomous task execution loop. Triggers on: run the loop, start the loop, loop, run loop, run the loop with crafter. Picks ready tasks from .features/{feature}/tasks/, executes them one at a time using Understand → Plan → Code → Review → Finalize, commits, and repeats."
---

# Loop - Autonomous Task Execution

Executes tasks from `.features/{feature}/tasks/` one at a time in dependency order.
Each iteration: pick a ready task, implement it, update progress, then start the next task in a fresh context.

Uses **simple-tasks** for task management and **implement-task** for execution.

---

## Prerequisites

Before running the loop:
- `.features/{feature}/tasks/` exists with task files
- tasks have proper `depends` relationships
- `_active.md` exists if the feature is being tracked that way

Optional but useful:
- `docs/features/{feature}/prd.md`
- `docs/features/{feature}/design.md`
- relevant `docs/playbooks/`

Do **not** block the loop just because PRD/design docs are missing. Tasks are the execution source of truth.

If multiple features have open tasks, ask the user which one to work on.

---

## Execution Modes

The loop should run **one task per context window**.

| Mode | Mechanism | When to use |
|------|-----------|-------------|
| Interactive | handoff/new session after each task | normal guided usage |
| Background | `loop.sh` spawns a fresh agent process per iteration | hands-off execution |

---

## Loop Workflow

### 1. Check context

For the selected feature:
- read `.features/{feature}/tasks/_active.md` if present
- read `scripts/loop/progress-{feature}.txt` if present
- read feature docs only if they exist and the task context needs them
- load relevant playbooks on demand

### 2. Find ready tasks

A task is **ready** when:
- `status: open`
- all IDs in `depends` have `status: done`
- the task is implementation-ready (context, research, patterns, verify)

If an open task is missing the needed research/patterns, treat it as not ready and fix the task first.

### 3. No ready tasks?

- If all tasks are done, report `Loop complete`
- If some tasks are blocked, report which ones and why
- If tasks are open but underspecified, enrich them before continuing

### 4. Execute one task

Pick the lowest-numbered ready task unless there is a clear reason to stay in the same area of the codebase.

Execution steps:
1. Read the progress file for discovered patterns
2. Load `implement-task`
3. Implement exactly one task
4. Append progress notes to `scripts/loop/progress-{feature}.txt`
5. Mark the task done and update `_active.md`

### 5. Fresh context for the next iteration

**Never** continue to the next task in the same session.

#### Interactive mode

Create a handoff/new session with a goal like:

```text
Continue the loop for feature "{feature}".
Completed: task {id} — {title}
What changed: {brief summary}
Patterns discovered: {summary or none}
Next step: pick the next ready task from .features/{feature}/tasks/
Context to load: _active.md, progress file, and any relevant playbooks/docs if present.
```

#### Background mode

Exit after finalizing the task. `loop.sh` will start the next iteration in a fresh process.

---

## Progress File

Use `scripts/loop/progress-{feature}.txt` as lightweight memory between sessions.

Suggested shape:

```markdown
# Loop Progress Log

Started: [date]
Feature: [feature]

## Codebase Patterns
- reusable pattern 1

---

## [date] - [task title]
- What was implemented
- Files changed
- Verification result
- Patterns or gotchas
```

Rules:
- append, don’t rewrite history
- keep it concise and reusable
- do not dump raw logs

---

## Archive

When all tasks for a feature are complete:
- archive or remove `.features/{feature}/` according to repo conventions
- archive `scripts/loop/progress-{feature}.txt` if the repo keeps progress history
- keep durable docs under `docs/features/` only if they still matter

---

## Quality Requirements

Before marking a task complete:
- task verify command passes
- any clearly relevant repo verification passes
- review is done at the appropriate depth
- progress is logged
- task status is updated

Commits/pushes should follow repo workflow and user intent; do not assume they are always required.

---

## Important

- **One task per context window**
- Tasks, not PRDs, are the execution source of truth
- Prefer the lightest workflow that keeps the loop reliable
- If not confident, stop and surface the blocker instead of guessing
