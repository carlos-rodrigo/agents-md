---
name: implement-task
description: "Implement a single task using Understand → Plan → Code → Review → Finalize. Use when implementing a task from .features/{feature}/tasks/. Triggers on: implement task, implement this, code this task, start implementation, work on task."
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
---

# Implement Task

Implements a single task from `.features/{feature}/tasks/` through five phases: **Understand → Plan → Code → Review → Finalize**.

Each phase must complete before moving to the next.

> **Context budget:** Read the task first. Prefer targeted reads over broad exploration. If the task is underspecified, fix the task or ask — do not compensate with random repo wandering.

---

## Prerequisites

Before starting:
- A task file exists at `.features/{feature}/tasks/NNN-task-name.md`
- Its `status` is `open`
- All dependencies in `depends` are `done`
- The task is implementation-ready: it includes concrete context, repo research, likely files, acceptance criteria, and verify steps

If any prerequisite is missing, stop and tell the user.

---

## Phase 1: Understand

**Goal:** Understand what to build with minimal noise.

### 1.1 Read the task file

The task file is the primary source of truth.
It should already contain:
- `Context`
- `What to do`
- `Codebase research`
- `Patterns to follow`
- `Acceptance criteria`
- `Files`
- `Verify`

### 1.2 Do only targeted follow-up reads

Read additional files only when the task file clearly points to them:
- a file that must be edited,
- the prior-art file named in `Patterns to follow`,
- a specific interface/type/contract the task mentions.

**Do not** read the full PRD or design by default.
If the task lacks enough context to proceed, call that out and enrich the task first.

---

## Phase 2: Plan

**Goal:** State the implementation plan before coding.

Write down:
1. **Files to create/modify**
2. **Tests to add/update**
3. **Patterns to mirror**
4. **Order of operations**
5. **Verification steps**

If the plan is still ambiguous after targeted reads, stop and ask.

---

## Phase 3: Code

**Goal:** Implement with tight feedback loops.

### TDD loop for every behavior change

```text
RED → write a failing test
GREEN → write the minimum code to pass
REFACTOR → clean up while tests stay green
```

### Backpressure rules

- Run the narrowest test that proves the current step
- Prefer fail-fast modes when available
- If `scripts/run_silent.sh` exists, use it for noisy commands
- Do not flood context with passing test output

Examples:

```bash
# narrow test first
npm test -- --runInBand path/to/test

# if available
source scripts/run_silent.sh
run_silent "unit tests" npm test
```

### Coding rules

- Keep steps small
- Match existing patterns before inventing new ones
- No unrelated refactors
- Re-run verification after meaningful changes

---

## Phase 4: Review

**Goal:** Review proportional to risk.

### Choose review depth

| Condition | Review type |
|-----------|-------------|
| ≤ 150 changed lines, ≤ 3 files, no auth/security/payment logic | Self-review |
| Everything else | Deep review |

### Self-review

Check your diff for:
- naming consistency,
- missing edge-case tests,
- error handling gaps,
- accidental scope creep.

### Deep review

If an oracle/subagent reviewer is available, use it for larger or higher-risk diffs.
Otherwise do a slower manual review over the changed files and tests.

After review, fix issues and re-run verification.

---

## Phase 5: Finalize

**Goal:** Leave clean execution state.

1. Mark the task `status: done`
2. Update `.features/{feature}/tasks/_active.md` if present
3. Run the task verify command and any repo-level verification that clearly applies
4. Update docs **only if** the work changed durable guidance or verification workflows
5. Commit if the user or repo workflow expects commits
6. Push only when explicitly requested or clearly part of the workflow

### Report

```text
✅ Task {id} complete: {title}
- Verification: {what passed}
- Review: {self-review | deep review}
- Docs: {updated | none}
```

---

## Important

- The task file should do most of the context-loading work
- Read on demand, not upfront
- TDD and verification are non-negotiable for behavior changes
- One task per session is preferred
