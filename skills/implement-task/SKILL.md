---
name: implement-task
description: "Implement one scoped change with tests, focused code, verification, and review. Triggers on: implement task, execute task, code task, implement this, fix this."
allowed-tools: Bash Read Edit Write
---

# Implement Task

Implement one coherent, authorized change. Inspect first, prove behavior, make the smallest change, and report evidence. A `task.md` file is optional.

## Entry

**Task-backed mode:** read the target task and `_active.md`; Load `simple-tasks`; run `scripts/validate-task.mjs`; proceed only when status, dependencies, authority, `authorized_by`, `authorized_at`, `authorization_basis`, and `authorization_fingerprint` pass. Record the Result and synchronize the board.

**Direct-request mode:** treat the user request as authority for its explicit scope. Inspect applicable instructions, product/design sources, ADRs, code, dependents, and tests. Do not create task artifacts unless requested.

In either mode, stop for unresolved product behavior, architecture, API/schema, auth, persistence, rollout, or other approval-gated decisions.

## Loop

1. Define goal, observable result, required behavior, non-goals, invariants, likely files, and checks; call `verification_plan` when available.
2. Identify the external boundary and run or write the smallest acceptance check.
3. Confirm the check can fail for the missing behavior.
4. Implement only the required code, using local patterns and ports/fakes for uncontrollable effects.
5. Run reproduction when applicable, focused checks, user/system checks, edge cases, and the repository gate.
6. Repair in scope, audit the diff, and review with `are-you-proud`.

If the acceptance check already passes, verify that it proves the sourced acceptance rather than incidental output. A true no-op is valid when behavior is already satisfied; do not force a red state. A non-discriminating check must be strengthened only from sourced acceptance. Do not invent product behavior.

Failed required checks cannot produce `done`. Record skipped checks and reasons. After two repeated failures with no new information, escalate or block.

## Result

Task-backed work uses the task's required `## Result` fields:

```markdown
## Result
- Status: done | blocked
- Changed: `paths` | none
- TDD: acceptance red → green | sourced no-op | exception + reason
- Task contract: binding Goal / Change / Done / Execute items → satisfied | blocker
- Feedback loop: action → observation; evidence path
- Gate: command → result
- Review: Are You Proud → no findings | blocker + owner
```

Direct requests report changed paths, TDD/no-op/exception state, acceptance and edge evidence, final gate, review, and remaining risks.
