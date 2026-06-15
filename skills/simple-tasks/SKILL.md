---
name: simple-tasks
description: "Project-local task management in .features/{feature}/tasks/. Use when creating, listing, or updating compact agent-readable task briefs with feedback loops. Triggers on: create tasks, list tasks, task status, task briefs."
---

# Simple Tasks

Use tasks only when work needs sequencing, delegation, looping, or resumption. `.features/` is execution state, not durable product documentation.

```text
.features/{feature}/tasks/      # task briefs optimized for agents
.features/{feature}/execution/  # evidence after execution
.features/{feature}/artifacts/  # run artifacts, screenshots, logs
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
# List tasks
ls -1 .features/{feature}/tasks/*.md 2>/dev/null | grep -v README

# Find executable tasks
grep -El "status: (ready|open)" .features/{feature}/tasks/*.md 2>/dev/null
```

Create the next task as:

```text
.features/{feature}/tasks/NNN-short-title.md
```

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
5. No `done` without evidence.
