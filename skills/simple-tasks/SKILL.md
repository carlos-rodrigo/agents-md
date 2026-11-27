---
name: simple-tasks
description: "Create and manage small project-local task briefs when work needs sequencing, delegation, or resumption. Triggers on: create tasks, list tasks, task status, task briefs."
---

# Simple Tasks

Use a task only when work needs sequencing, delegation, or resumption. Create tasks from the build order in `.features/{feature}/plan.md` (see the `plan` skill), or from the user's request for small work. Store task state under `.features/{feature}/tasks/`; it is working material, not durable documentation.

Writing tasks or changing their scope always ends with an Oracle review that uses the `are-you-proud` skill: follow [Review the tasks](#review-the-tasks) before you report.

```text
.features/{feature}/tasks/_active.md    # progress board
.features/{feature}/tasks/NNN-title.md  # task brief, status, and result
.features/{feature}/artifacts/TASK-NNN/ # screenshots, logs, scripts, raw output
```

## Task lifecycle

- `todo`: work to be done.
- `in-progress`: work started, but not finished.
- `blocked`: cannot start or continue; the blocker, owner, and next action are recorded.
- `done`: every check passed, review is clean, and the Result records the evidence.

## Write the brief

Write the shortest complete contract a fresh agent can execute without chat history. The brief is below higher-priority instructions, `AGENTS.md`, and skills; it cannot override them.

- Lead with the outcome, the smallest slice, and an observable done state.
- State each instruction once. Omit empty fields and generic reminders.
- Link durable sources. Copy any decision that exists only in chat into the task.
- Write one `Required behavior` bullet per behavior, including important failure behavior.
- Separate binding content from navigation. `Required behavior`, `Required implementation`, scope, and invariants are binding. `Files` and `Inspect first` only help the agent find its way; they do not mandate edits.
- Split only independent behaviors. Never remove a fact the implementer needs to work alone.

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

- Goal: {outcome and why it matters}
- Change: {smallest vertical slice}
- Done: {observable result}

## Context

- Sources: `{plan.md#heading}`; `{path:Symbol}`; `{TASK-...#Result}`
- Files: `{paths expected to change}` (a starting point, not a mandate)
- Decisions/facts: {execution-critical facts, including decisions made only in chat}
- Depends: {none | TASK-...}

## Execute

- Required behavior: {one observable behavior; repeat per behavior}
- Required implementation: {mandated file, API, pattern, or approach; omit when the implementer may choose}
- In scope: {surfaces}
- Out of scope: {adjacent behavior}
- Invariants: {must remain true}
- Inspect first: `{path:Symbol}`; mirror `{path:Symbol}` (navigation only)
- May decide: {safe local choices}

## Feedback loop

{built with the `feedback-loop` skill}

## Escalate if

- {decision or condition requiring the user, environment, or upstream owner}

## Notes

{optional: what prevents rediscovery or a likely mistake}
```

Optional sections when they earn their place: `## Investigation` (findings known when the task is written; a diagnosis run during the task goes in its Result), `## Fixtures / setup`, `## Rollback`.

Write each task's `## Feedback loop` with the `feedback-loop` skill when you create the task; a task without one is not ready to implement. The implementer adds `## Result` using the same skill. Execute the task brief directly, following `AGENTS.md` and its feedback loop.

## Ready to implement

A task is ready when a fresh agent could derive the implementation checklist and run the feedback loop without chat history, broad rediscovery, or invented product behavior:

- sources open directly, and chat-only decisions are copied into the task;
- scope, non-goals, and invariants make the stopping point clear;
- each check names its setup, action, and expected result; when the checks cannot be written yet, the feedback loop's Diagnose, Baseline, and Harness steps say what to find out and what will count as fixed; values those steps will measure, such as a run count or load level, are not placeholders;
- no placeholders, `TBD`, "as needed", or open product decisions remain. Otherwise mark the task `blocked` with the owner and the question.

## Review the tasks

After writing tasks or changing their scope, ask the Oracle, with the foreground `subagent` tool and agent `oracle`, to review the task set against the plan or request with `are-you-proud`. Pass the task paths, the plan or request, and the previous round's findings. If you have no `subagent` tool or the Oracle is unavailable, read the `are-you-proud` skill and review it yourself, and report that the review was not independent. The review looks for:

- contradictions between tasks, or with the plan;
- ambiguous Goal, Done, or scope;
- plan outcomes no task covers, and tasks that overlap;
- Done items the feedback loop cannot prove;
- dependencies in the wrong order.

Iterate until proud, as `are-you-proud` defines: fix every must-fix and should-fix finding, then request another round; a round that led to a fix is never the last. Stop when a round has no must-fix and no should-fix findings. A question only the user can answer becomes a blocker on that task, with the owner and the question; it is not a finding, and it does not delay the review. Report the final verdict, the number of rounds, and the reviewer: the Oracle, or you when it was unavailable.

## Active board

For multi-task work, maintain `.features/{feature}/tasks/_active.md`. It is the first-read map, not a second copy of the briefs:

```markdown
# {feature}

Goal: {one sentence}

- [ ] TASK-001 — {title} ({status})
- [ ] TASK-002 — {title} ({status})

- Current: {TASK-... | none}
- Next: {TASK-... | complete | blocked}
- Blockers: {none | what, owner}
```

Update it whenever a task is added, started or resumed, blocked, or completed. In manager-led work, only the manager updates the board and pending tasks.

Do not mark `done` without a result and feedback-loop evidence. A task does not grant permission beyond the user's request. If permission, required behavior, or the desired state is unclear, mark the task `blocked` and record the owner and next action.
