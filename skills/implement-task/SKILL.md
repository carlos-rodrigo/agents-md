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

---

## Prerequisites

Before starting:

- A task file exists in `.features/{feature}/tasks/NNN-task-name.md` with `status: open`
- `.features/{feature}/prd.md` and `.features/{feature}/design.md` exist
- All task dependencies (`depends` field) have `status: done`

If any prerequisite is missing, stop and tell the user.

---

## Phase 1: Context

**Goal:** Build a complete understanding of what needs to change before writing any code.

### 1.1 Read the task

```bash
cat .features/{feature}/tasks/NNN-task-name.md
```

Understand:
- What needs to be done (the "What to do" section)
- Acceptance criteria (the checklist that defines "done")
- BDD spec (Given/When/Then)
- Dependencies (what tasks completed before this one)
- Files listed as relevant

### 1.2 Read the PRD and Design

```bash
cat .features/{feature}/prd.md
cat .features/{feature}/design.md
```

From the PRD, extract:
- The user story this task belongs to
- The acceptance criteria at the story level
- Non-goals (to avoid scope creep)

From the Design, extract:
- The architectural approach for this area
- Reusable components, hooks, services identified
- Data model, API contracts, integration points
- Patterns to follow

### 1.3 Search the codebase

Find the files and patterns relevant to this task:

```bash
# Find files mentioned in the task
find . -path "*/path/from/task*" -type f

# Search for related patterns
rg "keyword_from_task" --type-add 'code:*.{ts,tsx,js,jsx,go,py,rs}' -t code -l

# Find similar implementations to follow
rg "pattern_from_design" --type-add 'code:*.{ts,tsx,js,jsx,go,py,rs}' -t code -l

# Check existing tests for patterns
find . -name "*.test.*" -o -name "*.spec.*" -o -name "*_test.*" | xargs grep -l "related_keyword"

# Look at recent changes in relevant areas
git log --oneline -10 -- path/to/relevant/area
```

### 1.4 Build the plan

Before writing any code, state clearly:

1. **Files to create** — new files this task needs
2. **Files to modify** — existing files and what changes
3. **Test files** — where tests will go (existing test files to extend or new ones)
4. **Patterns to follow** — specific code patterns found in the codebase to replicate
5. **Order of operations** — which steps to take and in what sequence

**Do NOT start coding until the plan is clear.** If something is ambiguous, re-read the design or ask the user.

---

## Phase 2: Code

**Goal:** Implement the task using strict TDD on every step.

### The TDD Loop (Every Step)

Every implementation step follows this loop — no exceptions:

```
┌─────────────────────────────────┐
│  1. RED    → Write a failing test │
│  2. GREEN  → Write minimal code   │
│             to make it pass       │
│  3. REFACTOR → Clean up while     │
│               tests stay green    │
└─────────────────────────────────┘
```

**"Every step" means every step.** Not once at the end. Not just for complex logic. Every behavioral change gets a test first.

### How to execute

For each step in your plan:

#### Step N.1 — RED: Write the failing test

- Write a test that describes the expected behavior
- The test MUST fail (if it passes, either the behavior already exists or the test is wrong)
- Run the test to confirm it fails:

```bash
# Run only the specific test (adapt to your test runner)
npm test -- --grep "test name"
# or
go test ./path/to/package -run TestName
# or
pytest path/to/test.py -k "test_name"
```

- **Confirm the failure message makes sense** — it should fail for the right reason

#### Step N.2 — GREEN: Make it pass

- Write the **minimum** code needed to make the test pass
- Do NOT add extra functionality, optimizations, or "nice to haves"
- Run the test to confirm it passes:

```bash
npm test -- --grep "test name"
```

- If it fails, fix the implementation (not the test) until green

#### Step N.3 — REFACTOR: Clean up

- Improve code quality: naming, duplication, structure
- Run **all related tests** to ensure nothing breaks:

```bash
npm test
# or
go test ./...
```

- If any test breaks during refactor, undo and try a smaller refactor

#### Step N.4 — Commit

After each meaningful TDD cycle (or small group of related cycles):

```bash
git add -A
git commit -m "feat({scope}): {what this step achieved}"
```

**Commit often.** Small commits are easier to review and revert.

### Rules

- **Never write production code without a failing test first**
- **Never skip the refactor step** — even if it's just "nothing to refactor"
- **Run tests constantly** — after every change, not just at the end
- **Keep steps small** — if a step feels big, break it into smaller TDD cycles
- If you get stuck, re-read the design doc for guidance
- If a test is hard to write, the design might need rethinking — note it as a learning

### When all steps are done

Run the full verification from the task file:

```bash
# Run the verify command from the task's "Verify" section
{verify_command_from_task}
```

Check every acceptance criterion from the task. If any fails, add more TDD cycles until all pass.

---

## Phase 3: Review

**Goal:** Four independent reviewers check the implementation, each fixing issues they find.

### Setup: Spawn 4 review agents via tmux

Use tmux to run 4 parallel pi instances, each focused on one review dimension.

First, create a diff of all changes for the reviewers to examine:

```bash
# Generate the diff for review
git diff main --stat
git diff main > /tmp/review-diff.txt
```

Then spawn the 4 reviewers:

```bash
# Code Quality reviewer
tmux new-window -n "review-quality" -d
tmux send-keys -t "review-quality" "echo 'Review this diff for CODE QUALITY issues (patterns, naming, complexity, duplication, readability). Fix any issues you find by editing the files directly. When done, create /tmp/review-quality-done.txt with a summary of what you fixed or \"No issues found\".' | pi --yes-always --no-git" C-m

# Security reviewer
tmux new-window -n "review-security" -d
tmux send-keys -t "review-security" "echo 'Review this diff for SECURITY issues (secrets, input validation, data handling, auth, injection, XSS). Fix any issues you find by editing the files directly. When done, create /tmp/review-security-done.txt with a summary of what you fixed or \"No issues found\".' | pi --yes-always --no-git" C-m

# Performance reviewer
tmux new-window -n "review-perf" -d
tmux send-keys -t "review-perf" "echo 'Review this diff for PERFORMANCE issues (N+1 queries, missing indexes, unnecessary re-renders, large bundles, caching opportunities, bottlenecks). Fix any issues you find by editing the files directly. When done, create /tmp/review-perf-done.txt with a summary of what you fixed or \"No issues found\".' | pi --yes-always --no-git" C-m

# Testing reviewer
tmux new-window -n "review-testing" -d
tmux send-keys -t "review-testing" "echo 'Review this diff for TESTING issues (missing coverage, edge cases, brittle tests, missing assertions, test quality). Fix any issues you find by editing the files directly. When done, create /tmp/review-testing-done.txt with a summary of what you fixed or \"No issues found\".' | pi --yes-always --no-git" C-m
```

### Wait for reviewers to complete

Poll for completion:

```bash
# Check if all 4 reviewers are done
ls /tmp/review-quality-done.txt /tmp/review-security-done.txt /tmp/review-perf-done.txt /tmp/review-testing-done.txt 2>/dev/null | wc -l
```

Wait until all 4 files exist. Check every 30 seconds:

```bash
while [ $(ls /tmp/review-*-done.txt 2>/dev/null | wc -l) -lt 4 ]; do
  sleep 30
  echo "Waiting for reviewers... $(ls /tmp/review-*-done.txt 2>/dev/null | wc -l)/4 complete"
done
echo "All reviewers complete"
```

### Collect results

```bash
echo "=== Code Quality ===" && cat /tmp/review-quality-done.txt
echo "=== Security ===" && cat /tmp/review-security-done.txt
echo "=== Performance ===" && cat /tmp/review-perf-done.txt
echo "=== Testing ===" && cat /tmp/review-testing-done.txt
```

### Post-review

1. **Run the full test suite** — reviewers may have made changes that conflict:

```bash
{test_command}
```

2. **Fix any conflicts or broken tests** from reviewer changes
3. **Commit review fixes separately:**

```bash
git add -A
git commit -m "review: apply fixes from code review"
```

4. **Clean up:**

```bash
rm -f /tmp/review-*-done.txt /tmp/review-diff.txt
tmux kill-window -t "review-quality" 2>/dev/null
tmux kill-window -t "review-security" 2>/dev/null
tmux kill-window -t "review-perf" 2>/dev/null
tmux kill-window -t "review-testing" 2>/dev/null
```

---

## Phase 4: Compound

**Goal:** Capture learnings so future work is easier.

### Check for learnings

After the implementation and review, reflect on:

- **Patterns:** Reusable solutions discovered during this task
- **Decisions:** Why a particular approach was chosen over alternatives
- **Failures:** Bugs encountered and how they were fixed
- **Gotchas:** Non-obvious behavior, edge cases, surprising interactions

### Write to LEARNINGS.md

If there are learnings worth capturing, append to `LEARNINGS.md` in the project root:

```markdown
## [Category]: [Brief Title]

**Date:** YYYY-MM-DD
**Context:** [What were you trying to do?]
**Learning:** [What did you discover?]
**Applies to:** [Where else might this be relevant?]
```

### Show compound execution

Always show the compound markers:

```
<Starting Compound>
  Analyzing changes for learnings...
</Compound Complete>

I learned:
1. [First learning]
2. [Second learning]
3. [Third learning]
```

If no learnings worth capturing, state: **"No significant learnings from this task."**

---

## Finalize

After all 4 phases complete:

1. **Mark the task as done:**

```bash
# Edit the task file: status: open → status: done
```

2. **Update the active checklist:**

```bash
# Check off the task in .features/{feature}/tasks/_active.md
```

3. **Final commit and push:**

```bash
git add -A
git commit -m "feat: {task title}"
git push
```

4. **Report to user:**

```
✅ Task {id} complete: {title}
   Tests: all passing
   Review: 4/4 reviewers done
   Learnings: {count} captured
```

---

## Summary

```
Phase 1: Context    → Read task, PRD, design. Search codebase. Build plan.
Phase 2: Code       → TDD loop on every step: RED → GREEN → REFACTOR → commit.
Phase 3: Review     → 4 pi instances via tmux, each fixes one dimension.
Phase 4: Compound   → Capture learnings to LEARNINGS.md.
Finalize            → Mark done, commit, push, report.
```

---

## Important

- **Never skip Phase 1.** Jumping into code without context leads to rework.
- **TDD on every step is non-negotiable.** Not "write tests after". Not "tests at the end". Every step.
- **Reviewers fix, not report.** If a reviewer only reports issues, the review failed.
- **One task per session.** After completing a task, hand off to a fresh context for the next one.
