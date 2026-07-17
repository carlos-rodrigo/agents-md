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

## Task prompt design

Write the shortest complete contract a fresh agent can execute without chat history. Task text remains below higher-priority instructions, `AGENTS.md`, skills, and safety gates.

- Lead with outcome, smallest slice, and observable done state.
- Keep execution-critical facts; state each instruction once and omit empty fields or generic reminders.
- Link durable sources; summarize any needed chat-only decision in the task.
- Separate advisory navigation from binding behavior, scope, implementation constraints, and invariants.
- A `ready` change/build/fix task authorizes safe in-scope inspection, local edits, and non-destructive checks. Review/diagnose/plan tasks inspect and report unless the brief requests edits. Name only task-specific delegated choices and approval decisions.
- Pair checks with setup and expected results; record actual action → observation evidence in `## Result`.
- Prefer completeness over a line cap. Split only for multiple behaviors; never remove facts needed for a solo loop run.

---

## Active progress board

For multi-task, delegated, looped, or resumable work, maintain `.features/{feature}/tasks/_active.md`. It is the loop's first-read map of goal, status, current/next task, and blockers—not a duplicate brief.

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

Use separate `Required behavior` bullets for independent behaviors. Omit only fields explicitly marked optional.

```markdown
---
id: TASK-001
status: draft # draft | ready | blocked | done
order: 1
created: YYYY-MM-DD
---

# TASK-001 — {verb + object}

## Brief

- Goal: {desired user/system outcome and why it matters}
- Change: {one smallest vertical slice}
- Done: {observable completion state}

## Context

- Source anchors: `{durable path#heading}`; `{path:symbol}`; `{TASK-...#Result}` | no external source; approved brief captured below
- Facts / decisions: {execution-critical requirements not obvious from the anchors, including approved chat-only decisions}
- Depends: {none | TASK-...}

## Execute

- Required behavior: {one observable success/failure behavior; repeat this bullet for each behavior}
- Required implementation: {mandated file/API/pattern/approach; omit when the agent may choose}
- In scope: {specific surfaces and deliverables}
- Out of scope: {adjacent behavior explicitly excluded or deferred}
- Invariants: {existing behavior, compatibility, failure, security, or data property that must remain true}
- Inspect first (advisory, not a required edit): `{path:symbol}`; mirror `{path:symbol}`
- May decide without approval: {specific local choices that preserve Goal, Done, scope, and invariants}

## Feedback loop

- State: {externally observable state to prove}
- Contract: prove each explicit `Goal`, `Change`, `Done`, and binding `Execute` item, or name the blocker and owner
- Setup / repro: {fixture, data, environment, or pre-change failing action | not needed because ...}
- Fast: `{narrow command}` → {expected result}
- User/system: {API/browser/CLI/manual action} → {expected observation}
- Edge: {important boundary/failure case} → {expected result}
- Gate: `{regression command}` → {expected result} | {exception and reason}
- Result: record `action` → actual observation, evidence paths, and skip/blocker reasons in `## Result`

## Escalate if

- Approval required: {task-specific decision and owner | none beyond repository gates}
- Blocked when: {condition not safely repairable within this slice}

## Notes

{Optional information that prevents rediscovery or a likely mistake}
```

Optional detail sections: `## Investigation`, `## Fixtures / setup`, `## Rollback`, `## Local alternatives rejected`.

## Loop-ready detail floor

Before setting `status: ready`, run the **fresh agent readiness check**: can an agent derive the implementation checklist and execute the feedback loop without chat history, broad rediscovery, or invented product behavior?

- Source anchors open directly. If no external source exists, say so and capture the approved brief in `Facts / decisions`; never rely on chat history.
- Every required user/system behavior is a separate bullet, including material failure behavior.
- In-scope surfaces, adjacent non-goals, and invariants make the stopping boundary explicit.
- Inspection anchors name likely files and symbols plus a nearby pattern when one exists; they do not mandate edits.
- Verification names setup/reproduction, the narrow check, user/system observation, important edge, regression gate, and expected result for each.
- No unresolved placeholders, `TBD`, critical “as needed,” or product decisions remain. Keep such tasks `draft` or `blocked` with an owner.

---

## Status semantics

- `draft` — not approved for execution.
- `ready` — approved and executable.
- `blocked` — waiting on user/dependency/environment.
- `done` — implementation complete and `## Result` records feedback-loop results.
- Legacy `open` may be treated as `ready` only when the brief is executable.

## Ready gate

`ready` means the loop-ready detail floor and fresh agent readiness check pass. Use `feedback-loop` to tighten proof; otherwise keep the task `draft` or `blocked`.

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
- Task contract: binding `Goal` / `Change` / `Done` / `Execute` items → satisfied, or unmet item + owner/reason
- Feedback loop: `action` → actual observation; evidence path when applicable
- Gate: `action` → passed/failed/skipped with reason
- Review: self/oracle Are You Proud; findings resolved or skipped with reason
- Follow-up applied to next task: none | `TASK-002`
```

If a later task needs information discovered during execution, write it into that task directly instead of creating a separate handoff/report file.
