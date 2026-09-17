---
name: simple-tasks
description: "Create and manage small project-local task briefs when work needs sequencing, delegation, looping, or resumption. Triggers on: create tasks, list tasks, task status, task briefs."
---

# Simple Tasks

Use a task only when work needs sequencing, delegation, looping, or resumption. Store task state under `.features/{feature}/tasks/`; keep durable product truth in `docs/`.

## Task lifecycle

- `draft`: not authorized for execution.
- `ready`: explicitly authorized and executable.
- `blocked`: execution stopped with a recorded blocker and owner.
- `done`: implementation finished with a recorded result.

Do not infer authorization from completeness, passing tests, or a status edit. A ready task requires `authorized_by`, `authorized_at`, `authorization_basis`, and the validator-generated `authorization_fingerprint`.

Use `approved-design: path/to/design.document.json` for non-trivial work or `user-request: bounded request` for a tiny clear change. Changed binding behavior, scope, constraints, or invariants requires renewed authorization.

## Task shape

```markdown
---
id: TASK-001
status: draft
order: 1
created: YYYY-MM-DD
authorized_by: "human"
authorized_at: YYYY-MM-DD
authorization_basis: "user-request: bounded request"
authorization_fingerprint: "sha256:..."
---

# TASK-001 — {verb + object}

## Brief
- Goal: {outcome}
- Change: {smallest slice}
- Done: {observable result}

## Context
- Sources: `{path#heading}`; `{path:Symbol}`
- Decisions/facts: {execution-critical facts}
- Depends: {none | TASK-...}

## Execute
- Required behavior: {observable behavior}
- In scope: {surfaces}
- Out of scope: {adjacent behavior}
- Invariants: {must remain true}
- May decide: {safe local choices}

## Feedback loop
- Setup/repro: {starting state}
- Fast: `{command}` → {expected result}
- User/system: {action} → {expected observation}
- Edge: {failure/boundary} → {expected result}
- Gate: `{command}` → {expected result}
- Result: record actual actions, observations, evidence, and blockers

## Escalate if
- {decision or condition requiring the user, environment, or upstream owner}
```

Keep the brief executable without chat history. Split only independent behaviors. Use `feedback-loop` for proof detail and `implement-task` for execution.

## Active board

For multi-task work, maintain `.features/{feature}/tasks/_active.md` with the goal, task statuses, current/next task, and blockers. Update it whenever a task is added, blocked, or completed.

## Validation

After authorization and after writing a result:

```bash
node "<simple-tasks-dir>/scripts/validate-task.mjs" --fingerprint \
  .features/{feature}/tasks/NNN-title.md
node "<simple-tasks-dir>/scripts/validate-task.mjs" \
  .features/{feature}/tasks/NNN-title.md \
  .features/{feature}/tasks/_active.md
```

Do not mark `done` without a result and feedback-loop evidence. If authority, required behavior, or the desired state is unclear, keep the task `draft` and name the owner.
