---
name: feedback-loop
description: "Build the verification loop a task's implementer runs to prove the work does what it should: setup, reproduction, tests, browser workflows with agent-browser, API calls, scripted routines, expected observations, evidence, and Oracle review rounds. Use when writing or refining a task's Feedback loop, or when asked how to verify a change. Triggers on: feedback loop, how to verify, how to test, verification plan, define testing, task checks."
---

# Feedback Loop

A feedback loop tells the agent implementing a task how to prove the implementation does what it is supposed to do, and how to iterate until it does. Write it when the task is created, before implementation. A fresh agent must be able to run it without chat history.

It lives in the task file:

```text
.features/{feature}/tasks/NNN-title.md#feedback-loop   # the plan
.features/{feature}/tasks/NNN-title.md#result          # what actually happened
.features/{feature}/artifacts/TASK-NNN/                # screenshots, logs, scripts, raw output
```

## Build it

1. **Start from the outcome.** Take each `Done` and `Required behavior` item and ask: how would a user or calling system notice it works, or notice it doesn't?
2. **Choose proof at the real boundary.** Prove user-visible behavior where the user meets it. Unit tests support that proof but do not replace it.

   | Behavior | Proof |
   |---|---|
   | Logic, data rules, edge cases | Test: `{command}` |
   | UI workflow | Browser: `agent-browser` steps through the flow and reads the page |
   | HTTP API | API: `curl` with expected status and body fields |
   | CLI, job, or multi-step routine | Script: a runnable script that drives the routine and prints the observation |
   | Nothing above can observe it | Manual: exact steps and what to look at, with the reason automation is impractical |

3. **Write observations that can fail.** Each check is `action → expected observation`, specific enough to fail when the behavior is missing: `201 and body.id present`, not `API works`; `badge "High" visible without reload`, not `UI updates`.
4. **Reproduce first.** For bugs and new behavior, include an action that shows the gap before the change. If the reproduction cannot fail, the check proves nothing.
5. **Make setup explicit.** State how to reach the starting state: start command, URL, seed data, and which test account or environment variable to use (by name, never the secret). State cleanup if the check leaves state behind.
6. **Cover one important failure.** Invalid input, missing permission, empty state, or network error. Pick what this change could break.
7. **End with the regression gate.** The repository's normal test or build command.

Use only the proof types that apply. Write a script when a check takes several steps or will be re-run in every review round. Save it under `.features/{feature}/artifacts/TASK-NNN/`, or under the repository's tests if it has lasting value.

For browser checks, run `agent-browser skills get core` for the current commands. A typical flow: `open {url}`, `snapshot` to get element refs, `click @ref` or `fill @ref {text}`, `get text {selector}` or `snapshot` to read the result, `screenshot {artifact path}`, then `close`.

## Review rounds

Passing checks prove behavior. Oracle review checks everything else: scope, edge cases, simplicity, and whether the checks really prove the outcome.

In manager-led work, the builder runs checks and records evidence; the manager summons Oracle, routes repairs to the builder, records review results, and accepts completion. The builder leaves the task `in-progress` while awaiting review and reports future-task discoveries without editing those tasks. The manager alone updates the active board and pending tasks. The review cycle below is coordinated by the manager, not dispatched by the builder.

1. Run the full loop. Fix in-scope failures before review.
2. Ask the Oracle, with the foreground `subagent` tool and agent `oracle`, to review the diff and the evidence against the task's Goal, Done, and Execute using `are-you-proud`. For a manager-led review, the manager may instead use `agent_job_start` with `mode: "review"` and `followUp: false` to capture the diff snapshot, then explicitly poll to completion and read the result. Shell-loop iterations use the foreground tool.
3. Fix every must-fix and should-fix finding.
4. Re-run the checks the fixes affect, plus the gate. Ask the Oracle to review again.
5. Iterate until proud, as `are-you-proud` defines: stop when a round has no must-fix and no should-fix findings. A finding that needs a user decision becomes a blocker with its owner and next action; mark the task `blocked` if it stops the work.

If the Oracle is unavailable in manager-led work, keep the task incomplete and report the review blocker; self-review is not independent approval. Outside manager-led work, apply `are-you-proud` yourself and record that the Oracle review did not run.

The implementer may add checks. Removing or weakening an expected observation changes the agreed outcome and needs the user.

## Task section

```markdown
## Feedback loop

- Setup: {start command, URL, seed data, account/env var by name, cleanup}
- Repro: {action} → {observation showing the gap} | not applicable: {reason}
- Test: `{command}` → {expected result}
- Browser: agent-browser open `{url}`; {steps} → {expected visible result}; screenshot `{artifact path}`
- API: `curl {method} {url} {payload}` → {status and body fields}
- Script: `{path}` → {expected output}
- Edge: {failure or boundary action} → {expected result}
- Gate: `{regression command}` → exits 0
- Review: Oracle with are-you-proud on diff and evidence; iterate until no must-fix or should-fix findings
```

Delete the proof lines that don't apply. Keep Setup, Gate, and Review.

## Result section

Record what actually happened, not what was planned:

```markdown
## Result

- Status: in-progress (awaiting review) | done | blocked
- Changed: `{paths}`
- Proof: {check} → {actual observation}; evidence `{path}`  (one line per check)
- Gate: `{command}` → {result}
- Review: round {N} → {verdict}; fixed: {findings}; not fixed: {finding + reason}
- Blocker: none | {what, owner, next action}
```

A task is `done` only when every check passed and the last review round had no must-fix or should-fix findings. A skipped check needs a reason, and the Result must say what it leaves unproven.

## Ask the user when

- the expected outcome cannot be stated as an observation,
- the environment, data, or account needed for proof is unavailable,
- proving the behavior would require product, API, schema, auth, persistence, or rollout decisions.
