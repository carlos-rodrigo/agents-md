---
id: TASK-002
status: done
order: 2
created: 2026-07-31
---

# TASK-002 — Complete the synthetic behavior

## Brief
- Goal: Synthetic user observes the completed behavior
- Change: Add one synthetic behavior
- Done: Public synthetic output is present

## Context
- Sources: approved-plan.md#Build order
- Facts / decisions: The exact task was authorized
- Depends: none

## Execute
- Required behavior: Public synthetic output is present
- In scope: synthetic adapter and test
- Out of scope: adjacent behavior
- Invariants: existing errors remain

## Feedback loop
- State: Public output is observable
- Contract: Goal, Change, Done, and Execute are satisfied
- Setup / repro: focused check failed before implementation
- Fast: `node test.mjs` → passed
- User/system: run CLI → output present
- Edge: invalid input → existing error unchanged
- Gate: `npm test` → passed
- Result: actual evidence is recorded below

## Escalate if
- Approval required: none beyond repository gates
- Blocked when: public contract must change

## Result

- Status: done
- Changed: src/example.js
- TDD: acceptance red → green
- Task contract: binding instructions checked → satisfied
- Feedback loop: focused and user checks → passed
- Gate: npm test → passed
- Review: self Are You Proud → no findings
- Follow-up applied to next task: TASK-003
