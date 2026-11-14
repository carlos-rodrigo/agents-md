---
id: TASK-003
status: todo
order: 3
created: 2026-07-31
---

# TASK-003 — Execute the next synthetic behavior

## Brief
- Goal: Synthetic user observes the next behavior
- Change: Add the next bounded behavior
- Done: Public output includes the next field

## Context
- Sources: TASK-002#Result
- Facts / decisions: Preserve relevant completed-task discovery here
- Depends: TASK-002

## Execute
- Required behavior: Public output includes the next field
- In scope: next adapter behavior and focused test
- Out of scope: unrelated fields
- Invariants: completed behavior remains unchanged

## Feedback loop
- State: Next public output is observable
- Contract: Goal, Change, Done, and Execute are satisfied
- Setup / repro: next focused check fails before implementation
- Fast: `node test-next.mjs` → passes
- User/system: run CLI → next field appears
- Edge: prior input → prior behavior unchanged
- Gate: `npm test` → exits 0
- Result: record actual evidence below

## Escalate if
- Approval required: any behavior beyond this next field
- Blocked when: dependency TASK-002 is not done
