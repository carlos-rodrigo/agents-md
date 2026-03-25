---
name: implement-task
description: "Implement a single task using Context → Code → Review → Compound. Use when implementing a task from .features/{feature}/tasks/. Triggers on: implement task, implement this, code this task, start implementation, work on task."
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
---

# Implement Task

Implements a single task from `.features/{feature}/tasks/` through four phases: **Context → Code → Review → Compound**.

Each phase must complete before moving to the next. Announce transitions clearly.

> **Context budget principle:** Tool calls are expensive — they consume context window. Read only what you need, when you need it. Prefer targeted reads over full-file reads. A task file that includes inline patterns and context should be sufficient for most of the work.

---

## Prerequisites

Before starting:

- A task file exists in `.features/{feature}/tasks/NNN-task-name.md` with `status: open`
- All task dependencies (`depends` field) have `status: done`

If any prerequisite is missing, stop and tell the user.

---

## Phase 1: Context

**Goal:** Understand what to build and plan the implementation. Minimize file reads.

### 1.1 Read the task file

```bash
cat .features/{feature}/tasks/NNN-task-name.md
```

The task file should be **self-contained** with:
- **Context** — the relevant design excerpt (not "go read design.md")
- **What to do** — concrete steps
- **Patterns to follow** — code snippets showing the existing pattern to replicate
- **Acceptance criteria** — definition of done
- **Files** — where to create/modify
- **Verify** — command to run

**If the task file has a "Context" section and "Patterns to follow" section, you should NOT need to read the PRD or full design.** The task creator already extracted the relevant parts.

### 1.2 Targeted reads (only if needed)

Only read additional files when the task file is insufficient:

| What you need | What to do |
|--------------|------------|
| Task references a file to modify | Read that specific file (use `offset`/`limit` for large files) |
| Task says "follow pattern in X" but doesn't show the snippet | Read only that file |
| Need to understand an interface you're implementing | `grep` for the interface name, read only the definition |
| Design reference is missing from task | Read only the relevant phase section from `design.md`, not the whole file |

**Do NOT read:**
- The full PRD (the task already has what you need)
- The full design (read only if the task lacks a Context section)
- LEARNINGS.md upfront (consult only when debugging a specific issue)
- Convention docs upfront (consult only when unsure about a specific convention)
- Unrelated source files "for context"

### 1.3 Build the plan

State clearly:

1. **Files to create** — new files this task needs
2. **Files to modify** — existing files and what changes
3. **Test files** — where tests go
4. **Patterns to follow** — from the task file's "Patterns to follow" section
5. **Order of operations** — which steps to take and in what sequence

**Do NOT start coding until the plan is clear.** If something is ambiguous, ask the user — don't read 10 files hoping to find the answer.

---

## Phase 2: Code

**Goal:** Implement the task using strict TDD on every step.

### The TDD Loop (Every Step)

```
┌─────────────────────────────────┐
│  1. RED    → Write a failing test │
│  2. GREEN  → Write minimal code   │
│             to make it pass       │
│  3. REFACTOR → Clean up while     │
│               tests stay green    │
└─────────────────────────────────┘
```

**Every behavioral change gets a test first.**

### How to execute

For each step in your plan:

#### Step N.1 — RED: Write the failing test

- Write a test that describes the expected behavior
- Run it to confirm it fails for the right reason:

```bash
# Run only the specific test
go test ./path/to/package -run TestName
# or
npx tsx path/to/test.ts
```

#### Step N.2 — GREEN: Make it pass

- Write the **minimum** code to make the test pass
- No extra functionality, optimizations, or "nice to haves"

#### Step N.3 — REFACTOR: Clean up

- Improve naming, reduce duplication, improve structure
- Run **all related tests** to ensure nothing breaks

#### Step N.4 — Commit

```bash
git add -A
git commit -m "feat({scope}): {what this step achieved}"
```

### Rules

- **Never write production code without a failing test first**
- **Run tests constantly** — after every change
- **Keep steps small** — if a step feels big, break it into smaller TDD cycles
- **Read files on-demand during coding** — if you need to check an import path or a type, read it then. Don't front-load all reads.

### When all steps are done

Run the verify command from the task file:

```bash
{verify_command_from_task}
```

Check every acceptance criterion. If any fails, add more TDD cycles.

---

## Phase 3: Review

**Goal:** Review proportional to risk. Small tasks get self-review. Complex tasks get oracle reviews.

### Assess diff size

```bash
git diff main --stat
```

Count: **lines changed** and **files changed**.

### Route: Self-Review vs Oracle Review

| Condition | Review type |
|-----------|-------------|
| ≤ 150 lines changed AND ≤ 3 files AND no auth/security/payment logic | **Self-review** |
| Everything else | **Full oracle review** |

### Self-Review (small tasks)

Read your own diff and check for:
- Naming consistency with codebase conventions
- Missing error handling
- Missing test coverage for edge cases
- Hardcoded values that should be constants

Fix any issues, run tests, commit:

```bash
git diff main | head -200  # quick scan
# fix issues
git add -A && git commit -m "review: self-review fixes"
```

### Full Oracle Review (complex tasks)

```bash
git diff main > /tmp/review-diff.txt
```

Use the `subagent` tool in parallel mode:

```
subagent({ tasks: [
  {
    agent: "oracle",
    task: "Review for CODE QUALITY. Read /tmp/review-diff.txt, then read changed files. Focus: patterns, naming, complexity, duplication, readability. Report file path, line, problem, fix."
  },
  {
    agent: "oracle",
    task: "Review for SECURITY. Read /tmp/review-diff.txt, then read changed files. Focus: secrets, input validation, auth bypasses, injection. Report file path, line, problem, fix."
  },
  {
    agent: "oracle",
    task: "Review for PERFORMANCE. Read /tmp/review-diff.txt, then read changed files. Focus: N+1 queries, missing indexes, re-renders, caching. Report file path, line, problem, fix."
  },
  {
    agent: "oracle",
    task: "Review for TESTING. Read /tmp/review-diff.txt, then read changed files. Focus: missing coverage, edge cases, brittle tests, assertions. Report file path, line, problem, fix."
  }
]})
```

Apply fixes:

1. **Triage** — critical (must fix), warning (should fix), suggestion (consider)
2. **Apply critical and warning fixes**
3. **Run full test suite**
4. **Commit:**

```bash
git add -A
git commit -m "review: apply fixes from oracle code review"
rm -f /tmp/review-diff.txt
```

---

## Phase 4: Compound

**Goal:** Capture only genuinely reusable learnings.

### Reflect on

- **Patterns:** Reusable solutions that would prevent mistakes on future tasks
- **Gotchas:** Non-obvious behavior that will bite again
- **Decisions:** Architecture choices that affect future work

### Write to LEARNINGS.md

Only if the learning is genuinely reusable (would prevent a mistake on a different task):

```markdown
## [Category]: [Brief Title]
**Learning:** [What applies broadly?]
```

Skip one-time implementation notes, general CS knowledge, and task-specific debugging details.

If no learnings worth capturing: **"No significant learnings from this task."**

---

## Finalize

1. **Mark task as done** — edit frontmatter: `status: done`
2. **Update active checklist** — check off in `_active.md`
3. **Final commit and push:**

```bash
git add -A
git commit -m "feat: {task title}"
git push
```

4. **Report:**

```
✅ Task {id} complete: {title}
   Tests: all passing
   Review: {self-review | oracle 4/4}
   Learnings: {count} captured
```

---

## Summary

```
Phase 1: Context    → Read task file. Targeted reads only if task is insufficient. Plan.
Phase 2: Code       → TDD loop: RED → GREEN → REFACTOR → commit. Read files on-demand.
Phase 3: Review     → Adaptive: self-review for small low-risk diffs; oracle 4-way review for complex/high-risk diffs.
Phase 4: Compound   → Capture only reusable learnings.
Finalize            → Mark done, commit, push, report.
```

---

## Important

- **The task file is your primary source.** If it has Context + Patterns sections, you should rarely need other files.
- **Read on-demand, not upfront.** Don't front-load reading the PRD, design, LEARNINGS, and convention docs.
- **TDD on every step is non-negotiable.**
- **Adaptive review:** small low-risk diffs use self-review; complex/high-risk diffs use oracle reviews. Oracles are read-only.
- **One task per session.** Hand off to fresh context for the next one.
