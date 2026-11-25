---
name: feedback-loop
description: "Build the verification loop a task's implementer runs to prove the work does what it should: setup, failing reproduction, tests, AI evals, browser workflows with agent-browser, API calls, scripted routines, expected observations, evidence, and Oracle review rounds; and, when the checks cannot be written yet, the diagnosis, proof context, and harness that make them possible. Use when writing or refining a task's Feedback loop, or when asked how to verify a change. Product behavior belongs in the `plan`; this skill covers implementation proof. Triggers on: feedback loop, how to verify, how to test, verification plan, define testing, task checks, diagnose, flaky, cannot reproduce."
---

# Feedback Loop

A feedback loop tells the agent implementing a task how to prove the implementation does what it is supposed to do, how to iterate until it does, and when to stop trying. Write it when the task is created, before implementation. A fresh agent must be able to run it without chat history.

It lives in the task file:

```text
.features/{feature}/tasks/NNN-title.md#feedback-loop   # the plan
.features/{feature}/tasks/NNN-title.md#result          # what actually happened
.features/{feature}/artifacts/TASK-NNN/                # screenshots, logs, scripts, raw output
```

## Build it

1. **Start from the outcome.** Take each `Done` and `Required behavior` item and ask: how would a user or calling system notice it works, or notice it doesn't?
2. **Choose proof at the real boundary.** Prove user-visible behavior where the user meets it. Unit tests give fast feedback and support that proof but do not replace it.

   | Behavior | Proof |
   |---|---|
   | Logic, data rules, edge cases | Test: `{command}` |
   | Prompt, guidance, classifier, or other AI step | Eval: `{command}` over fixed cases, several trials each |
   | UI workflow | Browser: `agent-browser` steps through the flow and reads the page |
   | HTTP API | API: `curl` with expected status and body fields |
   | CLI, job, or multi-step routine | Script: a runnable script that drives the routine and prints the observation |
   | Nothing above can observe it | Manual: exact steps and what to look at, with the reason automation is impractical |

3. **Write observations that can fail.** Each check is `action → expected observation`, specific enough to fail when the behavior is missing: `201 and body.id present`, not `API works`; `badge "High" visible without reload`, not `UI updates`.
4. **Reproduce first.** For bugs and new behavior, the check must fail on the base before it passes on the change, for the expected reason. If it cannot fail, it proves nothing. If it already passes on the base, find out whether the behavior already exists or the check is weak: record an evidence-backed no-op, or strengthen the check from the agreed behavior. Never invent behavior to force a failure.
5. **Prove the check discriminates** when it could pass without the fix: a weak assertion, an AI check, or a check written after the code. Plant a wrong version and show the check fails on it.
6. **Make setup explicit.** State how to reach the starting state: start command, URL, seed data, and which test account or environment variable to use (by name, never the secret). State cleanup if the check leaves state behind. Redact fixtures built from production data before committing them.
7. **Cover one important failure.** Invalid input, missing permission, empty state, or network error. Pick what this change could break.
8. **Guard what already works** when the area has a fixed regression set (eval cases, replay fixtures, snapshots): record the pass count before and after; no previously passing case may fail.
9. **End with the regression gate.** The repository's normal test or build command.

Use only the proof types that apply. Write a script when a check takes several steps or will be re-run in every review round. Save it under `.features/{feature}/artifacts/TASK-NNN/`, or under the repository's tests if it has lasting value.

For browser checks, run `agent-browser skills get core` for the current commands. A typical flow: `open {url}`, `snapshot` to get element refs, `click @ref` or `fill @ref {text}`, `get text {selector}` or `snapshot` to read the result, `screenshot {artifact path}`, then `close`.

An AI check passes only when every trial of every case passes. A case that passes sometimes is a failure.

When further confirmation arrives only after deploy (production behavior, a metric), add an Outcome line. It is a follow-up outside the required checks and never blocks `done`. If an agreed Done item can only be observed after deploy, it stays a required check: keep the task `blocked` on it unless the user changes the requirement.

## When the loop cannot be written yet

Sometimes the checks cannot be written up front: the cause is unknown, the failure is intermittent, or nothing can drive the behavior repeatably. Then build the loop first, in three stages, and write in the task what each stage must find out. Do not guess the cause or the checks.

1. **Diagnose.** List the plausible explanations and run experiments that tell them apart: capture traces, replay real inputs, bisect. Do not start the fix yet. Instrument a scratch copy or worktree so diagnostic code never enters the change. The stage ends with one cause confirmed by evidence, or a blocker. Stop when two experiments in a row add no new information. Failing to reproduce is not a no-op: record a no-op only with evidence of what already fixed it.
2. **Baseline.** Collect the fixtures, recorded inputs, and environment the checks need. "Fixed" comes from the task's Done; if Done does not define it, ask the user rather than invent a threshold. The observation must show the diagnosed cause is gone, not only that the symptom stopped: a retry or a longer timeout can hide a race. If a fixed wait is the cause, wait for the observable condition instead of waiting longer.
3. **Harness.** Write the tools that make each iteration cheap and repeatable: a script that reproduces the failure on demand or at a measured rate, load or fault injection, a replay fixture, an eval set. It prints the observation. Trust it only after it shows the failure on the base, for the diagnosed reason and often enough that a clean run is conclusive: raise the load or inject faults until the base fails most runs. Record that run on the base as the Baseline.

Then iterate on the fix with the harness. When more than one fix is plausible, run each through the same harness and keep the simplest one that meets the expected observation; record the others and why they lost. Each candidate that misses the observation counts as a repair attempt under Stop. The harness becomes the Repro and Script checks. Keep it under the task's artifacts. Move only a deterministic form into the repository's tests, such as a forced interleaving or a fixed replay; a rate-based harness would be a flaky test.

If the diagnosis changes what the task must do, stop and report a blocker, with the diagnosis as the Result: the cause lies outside the task's scope, the fix needs a product, API, schema, auth, or persistence decision, or the fix is larger than the task. The user owns that decision. In manager-led work, the manager reports the blocker and creates or rescopes tasks only after the user approves.

Skip these stages when the checks can be written directly. A bug with a known reproduction goes straight to Repro.

## Run it

When the loop had to be built, do Diagnose → Baseline → Harness once. Then run in order: Repro → Test → Eval → Discriminates → Browser/API/Script → Edge → Guard → Gate. After a fix, rerun from the first check that failed or that the fix could affect. Run the Gate last, after the last fix.

**Stop** after 3 repair attempts on the same distinct failure, or sooner when the same failure repeats twice with no new information. Each review finding counts as one distinct failure. Also stop for owner decisions, a missing environment or data, unrelated regressions, or out-of-scope product, architecture, API, schema, auth, or persistence work. Stopping produces a `blocked` Result with the owner and next action, never `done`.

## Review rounds

Passing checks prove behavior. Oracle review checks everything else: scope, edge cases, simplicity, and whether the checks really prove the outcome. Every task gets reviewed, in a separate context from the one that wrote the change.

In manager-led work, the builder runs checks and records evidence; the manager summons Oracle, routes repairs to the builder, records review results, and accepts completion. The builder leaves the task `in-progress` while awaiting review and reports future-task discoveries without editing those tasks. The manager alone updates the active board and pending tasks. The review cycle below is coordinated by the manager, not dispatched by the builder.

1. Run the full loop. Fix in-scope failures before review.
2. Ask the Oracle, with the foreground `subagent` tool and agent `oracle`, to review the diff and the evidence against the task's Goal, Done, and Execute using `are-you-proud`. For a manager-led review, the manager may instead use `agent_job_start` with `mode: "review"` and `followUp: false` to capture the diff snapshot, then explicitly poll to completion and read the result. Add a project review skill when the repository has one.
3. Fix every must-fix and should-fix finding.
4. Re-run the checks the fixes affect, plus the gate. Ask the Oracle to review again.
5. Iterate until proud, as `are-you-proud` defines: stop when a round has no must-fix and no should-fix findings. A finding that needs a user decision becomes a blocker with its owner and next action; mark the task `blocked` if it stops the work.

If the Oracle is unavailable in manager-led work, keep the task incomplete and report the review blocker; self-review is not independent approval. Outside manager-led work, apply `are-you-proud` yourself and record that the Oracle review did not run.

The implementer may add checks. Removing or weakening an expected observation changes the agreed outcome and needs the user.

## Task section

```markdown
## Feedback loop

- Setup: {start command, URL, seed data, account/env var by name, cleanup}
- Diagnose: {hypotheses} → {experiments that separate them}; done when one cause is confirmed with evidence, else blocker
- Baseline: {measurement} under {conditions}; fixed means {observation from Done}
- Harness: {what it must reproduce and print}; trusted once it fails on base most runs, for the diagnosed reason
- Repro: `{command}` on base `{ref}` → {fails for the expected reason} | not applicable: {reason}
- Test: `{command}` → {expected result}
- Eval: `{command}` → {cases} × {trials} all pass on `{model}`
- Discriminates: {planted wrong version} → `{check}` fails
- Browser: agent-browser open `{url}`; {steps} → {expected visible result}; screenshot `{artifact path}`
- API: `curl {method} {url} {payload}` → {status and body fields}
- Script: `{path}` → {expected output}
- Edge: {failure or boundary action} → {expected result}
- Guard: `{command}` → before {n/N}, after {n/N}; no old case fails
- Gate: `{regression command}` → exits 0
- Review: Oracle with are-you-proud on diff and evidence; iterate until no must-fix or should-fix findings
- Outcome (after deploy, non-blocking): {production signal} → {expected}, checked by {who}
```

Delete the lines that don't apply. Always keep Setup, Edge, Gate, and Review. Keep Diagnose, Baseline, and Harness when the checks could not be written up front, Repro for bugs and new behavior, Eval whenever an AI step changes, Discriminates when the check could pass without the fix, and Guard when the area has a fixed regression set.

## Result section

Record what actually happened, not what was planned, so a later reader can compare runs. `@ {commit}` is the base commit; when the tested change is uncommitted, add `+ {diff artifact path}` capturing staged, unstaged, and new files.

```markdown
## Result

- Status: in-progress (awaiting review) | done | blocked
- Changed: `{paths}`
- Contract: every Goal, Done, and binding Execute item met | unmet: {item, owner, reason}
- Diagnosis: {cause} confirmed by `{evidence path}`; ruled out: {hypothesis → evidence}
- Baseline: {measurement} under {conditions}: before {value} → after {value}; harness `{path}`
- Candidates: {fix} → {observation} (one line each); chose {fix} because {reason}
- Proof: {check} `{command}` @ `{commit}` → {actual observation}; evidence `{path}`  (one line per check)
- Eval: `{command}` @ `{commit}`, model `{id}` → {passed}/{trials} per case
- Guard: before {n/N} → after {n/N}
- Gate: `{command}` @ `{commit}` → {result}
- Review: round {N} → {verdict}; fixed: {findings}; not fixed: {finding + reason}
- Outcome follow-up: {signal, who checks it} | not applicable
- Blocker: none | {what, owner, next action}
```

A task is `done` only when every check passed and the last review round had no must-fix or should-fix findings. A skipped check needs a reason, and the Result must say what it leaves unproven.

## Ask the user when

- the expected outcome cannot be stated as an observation,
- the environment, data, or account needed for proof is unavailable,
- a Stop limit is reached,
- proving the behavior would require product, API, schema, auth, persistence, or rollout decisions.
