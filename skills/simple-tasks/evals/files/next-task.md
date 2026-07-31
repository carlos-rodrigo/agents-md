---
id: TASK-003
status: ready
order: 3
created: 2026-07-31
authorized_by: Eval Product Owner
authorized_at: 2026-07-31
authorization_basis: "user-request: synthetic next-task eval"
authorization_fingerprint: sha256:00be01012d49151f5e7515ebbc8d34d340aa2ad52c5723d9812f31067b466932
---

# TASK-003 — Execute the next synthetic behavior

## Brief
- Goal: Synthetic user observes the next behavior
- Change: Add the next bounded behavior
- Done: Public output includes the next field

## Context
- Source anchors: TASK-002#Result
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
