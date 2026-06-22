---
name: implement-task
description: "Execute one approved task from .features/{feature}/tasks/ using Understand → Tighten → Plan → Outside-In TDD → Review → Result. Triggers on: implement task, execute task, code task."
allowed-tools: Bash Read Edit Write
---

# Implement Task

Implement exactly one approved task.

Source of truth:

```text
.features/{feature}/tasks/NNN-title.md  # task contract and result
.features/{feature}/tasks/_active.md    # feature/loop progress board
```

The task brief is the task contract; `_active.md` is the navigation/status board for looped or resumable work.

Context, when linked/relevant:

```text
docs/features/{feature}/prd.html
docs/features/{feature}/design.html
docs/adrs/{architecture,api,web}.md
```

## Start gate

Proceed only if:

- task status is `ready` (`open` only for executable legacy tasks),
- dependencies are satisfied,
- `## Brief`, `## Execute`, `## Feedback loop`, and `## Escalate if` exist or are locally fixable,
- the feedback loop is executable or locally fixable,
- for looped or multi-task work, `_active.md` exists or can be refreshed from task files.

Stop on `draft`, user-owned `blocked`, missing unfixable context, or user-owned ambiguity.

---

## Outside-In TDD contract

For behavior-changing code, default to Outside-In TDD:

- start from the external need: user interaction, API/CLI command, message/job, webhook, or public module call;
- write or update an acceptance/feature/contract test first, asserting observable behavior or side effects at the boundary;
- run it and confirm it fails for the right reason before implementation;
- park the failing acceptance test, then use inner-loop unit tests to grow collaborators;
- write only enough code to satisfy the current external need; avoid speculative domain, database, or framework work;
- do not add query methods, public APIs, or test seams only for tests; test behavior through observable effects;
- treat uncontrollable/external systems such as clocks, consoles, databases, queues, APIs, files, and browsers as boundaries with ports/fakes/mocks as appropriate;
- use integration/adapter tests for concrete external adapters when the slice reaches them;
- separate technical/architecture/macro-design uncertainty into a spike or blocker instead of mixing it into feature delivery.

Exceptions: docs-only edits, pure test-maintenance, mechanical refactors with no behavior change, or emergency fixes may use the task feedback loop directly. Record the exception in `## Result`.

## 1. Understand

Read in this order:

1. `_active.md` when present or when running as part of a loop,
2. task brief,
3. linked PRD/design/ADRs only as needed,
4. targeted code anchors from `## Execute`.

Capture: goal, external need, entry point, acceptance boundary, observable side effect, files, risks, agent-owned choices, feedback loop, escalation triggers.

Avoid broad repo wandering. Do not invent product or architecture behavior.

## 2. Tighten task if needed

If missing details are local and agent-owned, update the task before coding.

Allowed local fixes:

- stale file/function anchors,
- missing/stale `_active.md` checklist/current/next lines,
- test file placement,
- local helper names/interfaces,
- clearer fast checks or regression gate,
- extra edge checks that strengthen verification.

Escalate instead if the gap affects product behavior, high-level architecture, API/schema, auth/privacy, persistence/migration, rollout, or an unexecutable feedback loop.

## 3. Plan

State briefly:

- external entry point and observable side effect,
- acceptance/feature/contract test to write or run first,
- inner-loop unit tests likely needed,
- files to edit/create,
- pattern to mirror,
- order of work,
- feedback-loop commands/actions,
- escalation status.

## 4. Outside-In TDD/check/fix loop

Use small increments. Complete one outside-in feedback loop before widening scope.

For bug/regression/failing-test tasks, run the failing `Fast` or repro check once before editing and record the observed failure.

Outer loop — acceptance first:

1. Identify the slice's external boundary and side effect: UI result, HTTP response, CLI output, message emitted, DB write through public behavior, file output, console output, or public module collaboration.
2. Write or update the smallest acceptance/feature/contract test that proves the behavior from that boundary. If the task already provides this test, run it before editing.
3. Run the acceptance test and confirm it fails for the right reason. If it passes before implementation, tighten the test or task because it is not proving the requested change.
4. Park the failing acceptance test; it becomes the north star for the slice.

Inner loop — red/green/refactor:

1. Follow the acceptance-test failure to the next missing behavior or collaborator.
2. Write the simplest unit test for that collaborator or seam. Prefer behavior/side-effect assertions over state queries.
3. Make the unit test fail for the right reason.
4. Implement the smallest useful code to make it pass.
5. Refactor while tests are green: improve names, remove duplication, balance abstraction levels, and keep responsibilities cohesive.
6. Rerun the parked acceptance test. If it now fails at the next missing collaborator, repeat the inner loop. If it passes, continue to task feedback checks.

Design while testing:

- Ask responsibility questions before adding collaborators: “Should this object know this detail, or should another collaborator own it?”
- Defer details downward only when it clarifies responsibility; do not create speculative generic abstractions.
- Do not test one operation through another unrelated operation at unit level just because it exposes state.
- Do not expose new public methods only to make assertions easier.
- Introduce ports for external systems you cannot control, such as time, console, network, persistence, queues, files, or browser APIs.
- Use mocks/fakes at system boundaries; use adapter/integration tests for real implementations when they are part of the slice.
- Prefer tiny steps. Experienced just-in-time design is allowed, but never skip proving red before green for behavior changes.

After outside-in TDD passes:

1. Run the `Fast` check from `## Feedback loop`.
2. If the fast check passes, run the practical `User/system` and `Edge` checks.
3. If a check fails, diagnose the smallest in-scope cause, fix it, and rerun the same failing check before moving on.
4. After required task checks pass, run the `Gate` command from `## Feedback loop`.
5. If the gate fails because of this task's scope, fix and rerun the failing command, then rerun the gate.

Retry rules:

- Default max: 3 fix attempts per distinct failure before stopping as blocked.
- If the same failure repeats twice with no new information, stop and ask oracle/deep review or record a blocked result.
- If a check reveals a local task gap, update the task and continue.
- If a check reveals a user-owned decision, unrelated regression, missing environment/data, or out-of-scope architecture/API/schema/auth/persistence concern, stop as blocked.
- Use context-efficient output (`scripts/run_silent.sh` or equivalent) for noisy commands; keep success terse and preserve failure details.
- Do not mark the task done while any required check fails or is skipped without an explicit reason.
- If the task is behavior-changing and no acceptance/feature/contract test can be written or run, stop as blocked unless the task explicitly grants a test exception.

## 5. Review

Self-review small/local changes. Use oracle/deep review for large, risky, auth/security/payment, schema/API, persistence, repeated loop failure, or cross-cutting changes.

Before finalizing a completed implementation, run an Oracle **Are You Proud?** validation unless the change is docs-only, task-only, or explicitly too small to justify a background review. Ask Oracle to use the five-topic validation: correctness/intent, simplicity/YAGNI/overengineering, naming/readability, SOLID/design fit, and tests/verification. Resolve must-fix findings before marking the task done; record skipped Oracle validation with the reason.

Check: scope, architecture/ADR consistency, Outside-In TDD evidence, edge cases, tests, feedback-loop results, Oracle findings when used, and whether the final gate passed after the last fix.

## 6. Result / finalize

Record the outcome in the task file itself. Do not create separate report files for task results.

Append or update a compact `## Result` section.

Minimum complete result:

```markdown
## Result

- Status: done
- Changed: `path`, `path`
- TDD: acceptance/feature/contract red → inner-loop unit red/green/refactor → acceptance green, or explicit exception
- Feedback loop: `command/action` → result, including failed attempts/fixes when relevant
- Gate: `command` → passed
- Review: self/oracle/Are You Proud validation; findings resolved or skipped with reason
- Follow-up applied to next task: none | `TASK-002`
```

Minimum blocked result:

```markdown
## Result

- Status: blocked
- Changed: `path`, `path` | none
- Last failing check: `command/action` → failure summary
- Attempts: count and what changed or why no safe local fix was possible
- TDD state: no acceptance boundary | acceptance red | unit red/green | acceptance still failing | exception
- Blocker owner: user | oracle | environment | upstream
- Gate: skipped because ...
- Needed to unblock: ...
```

If the next task needs context from this work, update that next task directly before marking this task done. Put the note where the future agent will read it: `## Context`, `## Execute`, `## Feedback loop`, `## Escalate if`, or `## Notes`.

After complete result is recorded:

1. Mark task `status: done`.
2. Update the next task with any handoff context it needs.
3. Update `_active.md`: check off the completed task, set `Current` to `none`, and set `Next` to the next ready task, `complete`, or `blocked`.
4. If `_active.md` is missing for a looped or multi-task feature, create it from the task files before reporting completion.

After blocked result is recorded:

1. Mark task `status: blocked`.
2. Update `_active.md`: leave the task unchecked, set `Current` to `none`, and set `Next` to `blocked` with blocker owner and the last failing command/action summary.
3. Do not mark done.

Do not mark the task `done` until implementation, review, and feedback-loop results are recorded in the task file.

Refresh semantic index after code/doc changes when available; record skipped/running/fresh status.

## Final response

```text
✅ Task complete: TASK-XXX
- Changed: ...
- TDD: ...
- Feedback loop: ...
- Result: task file updated
- Next task context: updated TASK-YYY | none
- Active board: .features/.../tasks/_active.md updated | not used
- Review: self/oracle/Are You Proud validation; findings resolved or skipped with reason
- Semantic index: ...
- Follow-up: ...
```

```text
⛔ Task blocked: TASK-XXX
- Last failing check: ...
- Blocker owner: user | oracle | environment | upstream
- Result: task file updated
- Active board: .features/.../tasks/_active.md updated | not used
- Needed to unblock: ...
```
