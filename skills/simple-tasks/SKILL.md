---
name: simple-tasks
description: "Project-local task management in .features/{feature}/tasks/. Use when creating, listing, or updating compact agent-readable task briefs with feedback loops. Triggers on: create tasks, list tasks, task status, task briefs."
---

# Simple Tasks

Use tasks only when work needs sequencing, delegation, looping, or resumption. `.features/` is execution state, not durable product documentation.

```text
.features/{feature}/tasks/_active.md    # loop progress board and next-task pointer
.features/{feature}/tasks/NNN-title.md  # task briefs optimized for agents
.features/{feature}/execution/          # evidence after execution
.features/{feature}/artifacts/          # run artifacts, screenshots, logs
```

Durable context stays outside tasks:

```text
docs/features/{feature}/strategy.md
docs/features/{feature}/prd.md
docs/features/{feature}/system-model.md
docs/adrs/{architecture,api,web}.md
```

## Progressive disclosure rule

Task files are for agents. Keep the top-level brief small, actionable, and scannable.

- Put the execution-critical facts first: goal, files, risks, feedback loop, blockers.
- Link to strategy/PRD/system-model/ADRs instead of copying long context.
- Use terse bullets, paths, commands, and expected results.
- Add optional detail sections only when the agent must know them to execute.
- Target one screen / ~80 lines for normal tasks. Split the task if the brief needs much more.

---

## Active progress board

For any feature with more than one task, delegation, looping, or resumption, create and maintain:

```text
.features/{feature}/tasks/_active.md
```

`_active.md` is the loop's first read: it lists the feature goal, task checklist/status, current/next task, and blockers. It is a map, not a duplicate task brief.

Minimum shape:

```markdown
# Current Feature: {name}

Started: YYYY-MM-DD

## Goal
- {one sentence}

## Progress
- [ ] TASK-001 — {title} ({status})
- [ ] TASK-002 — {title} ({status})

## Current / Next
- Current: {TASK-... | none}
- Next: {TASK-... | complete | blocked}
- Blockers: {none | ...}
```

Update `_active.md` whenever a task is added, blocked, or completed. Check off a task only after its execution report records feedback-loop evidence.

---

## Task template

```markdown
---
id: TASK-001
status: draft # draft | ready | blocked | done
order: 1
created: YYYY-MM-DD
---

# TASK-001 — {verb + object}

## Brief

- Goal: {desired user/system outcome}
- Change: {smallest vertical slice}
- Done: {observable completion signal}

## Context

- Source: {chat | strategy/prd link | user-approved brief}
- Architecture: {system-model link or none}
- ADRs: {docs/adrs/... or none}
- Depends: {none | TASK-...}

## Execute

- Touch: `{file/function}`; `{file/test}`
- Pattern: {nearby pattern to mirror or new local pattern}
- Risk: {edge/error/permission/data concern or none}
- Agent may decide: {local choices only}

## Feedback loop

- State: {what must be true}
- Fast: `{command}` → {expected}
- User/system: {action/API/browser/manual check} → {expected}
- Edge: {case} → {expected}
- Gate: `{regression command}` → {expected}
- Evidence: `.features/{feature}/execution/001-title.md`

## Escalate if

- {product/architecture/API/schema/auth/persistence/rollout ambiguity}
- Feedback loop cannot be executed
- Scope no longer fits this task

## Notes

Optional. Only include details that prevent rediscovery or mistakes.
```

### Optional detail sections

Add after `## Notes` only when needed:

```markdown
## Investigation
## Fixtures / setup
## Rollback
## Local alternatives rejected
```

---

## Status semantics

- `draft` — not approved for execution.
- `ready` — approved and executable.
- `blocked` — waiting on user/dependency/environment.
- `done` — implementation complete and execution evidence recorded.
- Legacy `open` may be treated as `ready` only when the brief is executable.

## Ready gate

A task can be `ready` only when:

- one goal / one vertical slice,
- context links are enough to avoid broad rediscovery,
- `Execute` names likely files or planned new files,
- feedback loop is concrete and executable,
- escalation triggers are clear.

Use the `feedback-loop` skill to fill or tighten `## Feedback loop` before marking a task ready.

---

## Operations

```bash
# List task briefs
ls -1 .features/{feature}/tasks/*.md 2>/dev/null | grep -Ev '(_active|README)'

# Find executable task briefs
grep -El "status: (ready|open)" .features/{feature}/tasks/*.md 2>/dev/null | grep -v '/_active\.md$'
```

Create the next task as:

```text
.features/{feature}/tasks/NNN-short-title.md
```

Then add/update the matching line in `.features/{feature}/tasks/_active.md` with its status and checklist state.

Create the matching evidence report as:

```text
.features/{feature}/execution/NNN-short-title.md
```

## Execution report minimum

```markdown
---
id: ER-001
workTask: TASK-001
status: complete
created: YYYY-MM-DD
---

# ER-001 — TASK-001

- Changed: `path`, `path`
- Feedback loop: passed/failed/skipped with reason
- Evidence: command/action → result
- Review: self/oracle + findings
- Follow-up: none | ...
```

## Principles

1. Agent-first: commands, files, constraints, expected results.
2. Progressive disclosure: brief first, links/details only as needed.
3. One task = one behavior.
4. Feedback loop lives in the task.
5. `_active.md` is first-class loop state.
6. No `done` without evidence.
