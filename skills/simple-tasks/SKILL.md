---
name: simple-tasks
description: "Project-local task management in .features/{feature}/tasks/. Use when creating, listing, or updating compact agent-readable task briefs with feedback loops. Triggers on: create tasks, list tasks, task status, task briefs."
---

# Simple Tasks

Use tasks only when work needs sequencing, delegation, looping, or resumption. `.features/` is task-loop state, not durable product documentation.

```text
.features/{feature}/tasks/_active.md    # loop progress board and next-task pointer
.features/{feature}/tasks/NNN-title.md  # task brief, lifecycle state, and result
.features/{feature}/artifacts/          # large run artifacts, screenshots, logs when needed
```

Durable context stays outside tasks:

```text
docs/features/{feature}/prd.html
docs/features/{feature}/design.html
docs/adrs/{architecture,api,web}.md
```

## Progressive disclosure rule

Task files are for agents. Keep the top-level brief small, actionable, and scannable.

- Put the execution-critical facts first: goal, files, risks, feedback loop, blockers.
- Link to PRD/design/ADRs instead of copying long context.
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

Update `_active.md` whenever a task is added, blocked, or completed. Check off a task only after the task's `## Result` records feedback-loop results.

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

- Source: {chat | prd link | user-approved brief}
- Design: {design.html link or none}
- ADRs: {docs/adrs/... or none}
- Depends: {none | TASK-...}

## Execute

- Touch: `{file/function}`; `{file/test}`
- Pattern: {nearby pattern to mirror or new local pattern}
- Risk: {edge/error/permission/data concern or none}
- Agent may decide: {local choices only}

## Feedback loop

- State: {what must be true}
- Contract: all explicit `Goal` / `Done` / `Execute` instructions are satisfied by the implementation or recorded as blocked with owner
- Fast: `{command}` → {expected}
- User/system: {action/API/browser/manual check} → {expected}
- Edge: {case} → {expected}
- Gate: `{regression command}` → {expected}
- Result: update this task's `## Result` section before marking done

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
- `done` — implementation complete and `## Result` records feedback-loop results.
- Legacy `open` may be treated as `ready` only when the brief is executable.

## Ready gate

A task can be `ready` only when:

- one goal / one vertical slice,
- context links are enough to avoid broad rediscovery,
- `Execute` names likely files or planned new files,
- feedback loop is concrete and executable,
- task contract is checkable from explicit Goal/Done/Execute language,
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

Append or update the task result as:

```markdown
## Result

- Status: done | blocked
- Changed: `path`, `path` | none
- Task contract: explicit instructions checked → satisfied, or unmet item + owner/reason
- Feedback loop: passed/failed/skipped with reason
- Gate: passed/failed/skipped with reason
- Review: self/oracle Are You Proud validation; findings resolved or skipped with reason
- Follow-up applied to next task: none | `TASK-002`
```

If a later task needs information discovered during execution, write that information into the later task directly instead of creating a separate handoff/report file.

## Principles

1. Agent-first: commands, files, constraints, expected results.
2. Progressive disclosure: brief first, links/details only as needed.
3. One task = one behavior.
4. Feedback loop lives in the task.
5. `_active.md` is first-class loop state.
6. No `done` without a task-local `## Result`.
7. No `done` until explicit task instructions are audited against the diff and feedback-loop evidence.
