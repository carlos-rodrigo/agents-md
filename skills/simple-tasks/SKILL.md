---
name: simple-tasks
description: "Create and manage small project-local task briefs when work needs sequencing, delegation, looping, or resumption. Triggers on: create tasks, list tasks, task status, task briefs."
---

# Simple Tasks

Use a task only when work needs sequencing, delegation, looping, or resumption. Create tasks from the build order in `.features/{feature}/plan.md` (see the `plan` skill), or from the user's request for small work. Store task state under `.features/{feature}/tasks/`.

## Task lifecycle

- `todo`: work to be done.
- `in-progress`: work started, but not finished.
- `blocked`: execution stopped with a recorded blocker and owner.
- `done`: implementation finished with a recorded result.

## Task shape

```markdown
---
id: TASK-001
status: todo
order: 1
created: YYYY-MM-DD
---

# TASK-001 — {verb + object}

## Brief

- Goal: {outcome}
- Change: {smallest slice}
- Done: {observable result}

## Context

- Sources: `{plan.md#heading}`; `{path:Symbol}`
- Files: `{paths expected to change}` (a starting point, not a mandate)
- Decisions/facts: {execution-critical facts}
- Depends: {none | TASK-...}

## Execute

- Required behavior: {observable behavior}
- In scope: {surfaces}
- Out of scope: {adjacent behavior}
- Invariants: {must remain true}
- May decide: {safe local choices}

## Feedback loop

{built with the `feedback-loop` skill: setup, reproduction, proof checks with expected observations, edge case, gate, Oracle review rounds}

## Escalate if

- {decision or condition requiring the user, environment, or upstream owner}
```

Keep the brief executable without chat history. Split only independent behaviors. Write each task's `## Feedback loop` with the `feedback-loop` skill when you create the task; a task without one is not ready to implement. The implementer adds `## Result` using the same skill. Execute the task brief directly, following `AGENTS.md` and its feedback loop.

## Review the tasks

After writing or changing tasks, review the task set with `are-you-proud` against the plan or request. Look for:

- contradictions between tasks, or with the plan;
- ambiguous Goal, Done, or scope;
- plan outcomes no task covers, and tasks that overlap;
- Done items the feedback loop cannot prove;
- dependencies in the wrong order.

Iterate until proud, as `are-you-proud` defines: fix and review again until a round has no must-fix and no should-fix findings. A question only the user can answer becomes a blocker on that task, with the owner and the question; it is not a finding.

## Active board

For multi-task work, maintain `.features/{feature}/tasks/_active.md` with the goal, task statuses, current/next task, and blockers. Update it whenever a task is added, blocked, or completed.

Do not mark `done` without a result and feedback-loop evidence. A task does not grant permission beyond the user's request. If permission, required behavior, or the desired state is unclear, mark the task `blocked` and record the owner and next action.
