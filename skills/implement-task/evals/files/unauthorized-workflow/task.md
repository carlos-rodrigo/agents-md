---
id: TASK-004
status: ready
order: 4
created: 2026-07-31
---

# TASK-004 — Attempt unapproved work

## Brief
- Goal: Change behavior from an unapproved design
- Change: Add the proposed output
- Done: Output changes

## Context
- Source anchors: design.document.json
- Facts / decisions: The design is still Review
- Depends: none

## Execute
- Required behavior: Proposed output appears
- In scope: adapter
- Out of scope: approval workflow
- Invariants: existing errors remain

## Feedback loop
- State: Proposed output appears
- Contract: Task text is satisfied
- Setup / repro: not run
- Fast: `node test.mjs` → passes
- User/system: run CLI → output appears
- Edge: invalid input → unchanged
- Gate: `npm test` → exits 0
- Result: record evidence

## Escalate if
- Approval required: design approval and task authorization
- Blocked when: authority is not Approved
