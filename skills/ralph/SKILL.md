---
name: ralph
description: "Autonomous feature development - setup and execution. Triggers on: ralph, set up ralph, run ralph, run the loop, implement tasks. Two phases: (1) Setup - chat through feature, create tasks with dependencies (2) Loop - pick ready tasks, implement, commit, repeat until done."
---

# Ralph Feature Setup

Interactive feature planning that creates ralph-ready tasks with dependencies.

Uses **simple-tasks** - markdown files in `.tasks/` folder. No external dependencies.

---

## The Job

**Two modes:**

### Mode 1: New Feature

1. Chat through the feature - Ask clarifying questions
2. Break into small tasks - Each completable in one iteration
3. Create task files - In `.tasks/` with `depends` relationships
4. Set up ralph files - Create `_active.md`, reset progress.txt

### Mode 2: Existing Tasks

1. Find existing tasks - Read `.tasks/` folder
2. Verify structure - Check tasks have proper `depends`
3. Set up ralph files - Create/update `_active.md`
4. Show status - Which tasks are ready, completed, blocked

**Ask the user which mode they need:**

```
Are you:
1. Starting a new feature (I'll help you plan and create tasks)
2. Using existing tasks (I'll set up Ralph to run them)
```

---

## Step 1: Understand the Feature

Start by asking the user about their feature. Don't assume - ASK:

```
What feature are you building?
```

Then ask clarifying questions:

- What's the user-facing goal?
- What parts of the codebase will this touch? (database, UI, API, etc.)
- Are there any existing patterns to follow?
- What should it look like when done?

**Keep asking until you have enough detail to break it into tasks.**

---

## Step 2: Break Into Tasks

**Each task must be completable in ONE Ralph iteration (~one context window).**

Ralph spawns a fresh Amp instance per iteration with no memory of previous work. If a task is too big, the LLM runs out of context before finishing.

### Right-sized tasks:

- Add a database column + migration
- Create a single UI component
- Implement one server action
- Add a filter to an existing list
- Write tests for one module

### Too big (split these):

- "Build the entire dashboard" → Split into: schema, queries, components, filters
- "Add authentication" → Split into: schema, middleware, login UI, session handling
- "Refactor the API" → Split into one task per endpoint

**Rule of thumb:** If you can't describe the change in 2-3 sentences, it's too big.

---

## Step 3: Order by Dependencies

Tasks execute based on `depends`. Earlier tasks must complete before dependent ones start.

**Typical order (each task includes its own test):**

1. Schema/database changes (with migration test)
2. Server actions / backend logic (with unit tests)
3. UI components (with integration tests, verify using agent-browser skill)

Use `depends` to express this:

```
Task 001: Schema (no dependencies)
Task 002: Server action (depends: [001])
Task 003: UI component (depends: [002])
Task 004: Tests (depends: [003])
```

Parallel tasks that don't depend on each other can share the same dependency.

---

## Step 4: Create Tasks

### First, create the `.tasks/` folder:

```bash
mkdir -p .tasks
```

### Create each task as a markdown file:

File naming: `NNN-kebab-case-title.md` (zero-padded for sorting)

```markdown
---
id: 001
status: open
depends: []
created: 2025-02-05
---

# Task title - action-oriented

Detailed description - see format below
```

### Task description format:

Write descriptions that a future Ralph iteration can pick up without context:

```markdown
---
id: 002
status: open
depends: [001]
created: 2025-02-05
---

# Implement category name to ID mapping

Implement category name to ID mapping for expenses.

## BDD Spec

- Given: A category name like "rent" and expense type (family/child)
- When: mapExpenseCategoryNameToId(name, isChildExpense) is called
- Then: Returns the matching category ID or null if not found

## What to do

- Create function mapExpenseCategoryNameToId(name, isChildExpense)
- Query item_category table with category_type filter
- Add alias mapping for common synonyms (rent → Rent or Mortgage)

## Test plan

- Add unit test in workflows/tools/__tests__/upsert-expense.test.ts
- Test valid category → returns ID
- Test unknown category → returns null

## Files

- workflows/tools/upsert-expense.ts

## Verify

```bash
npm run typecheck && npm test -- upsert-expense
```

## Notes

- Follow pattern from upsert-income.ts
- EXPENSE type for family, CHILD_EXPENSE for child
```

---

## Step 5: Set Up Ralph Files

After creating all tasks:

1. Create/update `.tasks/_active.md`:

```markdown
# Current Feature: [Feature Name]

Started: [today's date]

## Progress

- [ ] 001 - [Task 1 title]
- [ ] 002 - [Task 2 title]
- [ ] 003 - [Task 3 title]

## Patterns Discovered

(Updated during implementation)
```

2. Create/reset `scripts/ralph/progress.txt`:

```bash
mkdir -p scripts/ralph
```

```markdown
# Build Progress Log

Started: [today's date]
Feature: [feature name]

## Codebase Patterns

(Patterns discovered during this feature build)

---
```

---

## Step 6: Confirm Setup

Show the user what was created:

```
✅ Ralph is ready!

**Feature:** [title]

**Tasks:**
1. [Task 1 title] - no dependencies
2. [Task 2 title] - depends on #1
3. [Task 3 title] - depends on #2
...

**To start Ralph:** Say "run ralph" or "start the loop"
```

---

## Mode 2: Setting Up Existing Tasks

If the user already has tasks created, help them set up Ralph to run them.

### Find existing tasks:

```bash
ls -1 .tasks/*.md 2>/dev/null | grep -v _active
```

### Read task status:

For each task file, parse the frontmatter to get `id`, `status`, `depends`.

### Verify dependencies:

Check that all tasks have valid `depends` references (IDs exist).

### Create _active.md:

Generate the progress checklist from existing tasks.

---

## Final Setup Checklist

- [ ] `.tasks/` folder exists with task files
- [ ] Each task has `id`, `status`, `depends` in frontmatter
- [ ] `.tasks/_active.md` has progress checklist
- [ ] `scripts/ralph/progress.txt` is fresh (or archived if previous feature)

---

# Phase 2: The Execution Loop

Once setup is complete, Ralph runs the autonomous loop to implement tasks one by one.

---

## Loop Workflow

### 0. Check for active feature

Read `.tasks/_active.md` to understand current feature context.

If no `_active.md` exists, ask the user which feature to work on.

### 1. Find ready tasks

A task is **ready** when:
- `status: open`
- All IDs in `depends` array have `status: done`

```bash
# List all task files
ls -1 .tasks/*.md | grep -v _active

# For each file, check status and depends
```

Parse each task's frontmatter. Build a map of `id → status`. Then find tasks where:
- `status: open`
- All `depends` IDs have `status: done`

### 2. If no ready tasks

Check if all tasks are completed:

```bash
grep -l "status: done" .tasks/*.md | wc -l
grep -l "status: open" .tasks/*.md | wc -l
```

- If all tasks are `done`:
  1. Archive the feature:
     ```bash
     DATE=$(date +%Y-%m-%d)
     FEATURE="feature-name-here"
     mkdir -p .tasks/archive/$DATE-$FEATURE
     mv .tasks/*.md .tasks/archive/$DATE-$FEATURE/
     ```
  2. Archive progress.txt:
     ```bash
     mkdir -p scripts/ralph/archive/$DATE-$FEATURE
     mv scripts/ralph/progress.txt scripts/ralph/archive/$DATE-$FEATURE/
     ```
  3. Stop and report "✅ Build complete - all tasks finished!"

- If some are blocked: Report which tasks are blocked and why

### 3. If ready tasks exist

**Pick the next task:**

- Prefer tasks related to what was just completed (same module/area)
- If no prior context, pick the lowest-numbered ready task

**Execute the task:**

Use the `handoff` tool with this goal:

```
Implement and verify task [id]: [title].

[Read the full task file: .tasks/NNN-task-name.md]

FIRST: Read scripts/ralph/progress.txt - check the "Codebase Patterns" section for important context from previous iterations.

When complete:

1. Run quality checks from the task's "Verify" section
   - If checks fail, FIX THE ISSUES and re-run until they pass
   - Do NOT proceed until quality checks pass

2. Update AGENTS.md files if you learned something important:
   - Check for AGENTS.md in directories where you edited files
   - Add learnings that future developers/agents should know
   - This is LONG-TERM memory

3. Update progress.txt (APPEND, never replace):

## [Date] - [Task Title]

Thread: [current thread URL]
Task ID: [id]

- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered

---

4. If you discovered a reusable pattern for THIS FEATURE, add it to the `## Codebase Patterns` section at the TOP of progress.txt

5. Commit all changes with message: `feat: [Task Title]`

6. Mark task as completed - edit the task file:
   Change `status: open` to `status: done`

7. Update .tasks/_active.md - check off the completed task

8. Invoke the ralph skill to continue the loop
```

---

## Progress File Format

```markdown
# Build Progress Log

Started: [date]
Feature: [feature name]

## Codebase Patterns

(Patterns discovered during this feature build)

---

## [Date] - [Task Title]

Thread: https://ampcode.com/threads/[thread-id]
Task ID: [id]

- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered

---
```

**Note:** When a new feature starts, reset progress.txt completely. Long-term learnings belong in AGENTS.md files.

---

## Task Discovery

While working, **liberally create new tasks** when you discover:

- Failing tests or test gaps
- Code that needs refactoring
- Missing error handling
- Documentation gaps
- TODOs or FIXMEs in the code
- Build/lint warnings
- Performance issues

Create new task file immediately with appropriate `depends`.

---

## Browser Verification

For UI tasks, specify the right verification method:

**Functional testing** (checking behavior, not appearance):

```
Use agent-browser with snapshot -i to read page content
```

- `agent-browser snapshot -i` returns interactive elements with refs
- Use for: button exists, text appears, form works

**Visual testing** (checking appearance):

```
Use agent-browser screenshot to capture and verify visual appearance
```

- `agent-browser screenshot tmp/result.png` saves a screenshot
- Use for: layout, colors, styling

---

## Quality Requirements

Before marking any task complete:

- Verify command from task must pass
- Changes must be committed
- Progress must be logged
- Task file updated to `status: done`
- `_active.md` checklist updated

---

## Stop Condition

When no ready tasks remain AND all tasks are completed:

1. Output: "✅ Build complete - all tasks finished!"
2. Summarize what was accomplished
3. Archive tasks and progress

---

## Important Notes

- Each handoff runs in a fresh thread with clean context
- Progress.txt is the memory between iterations - keep it updated
- Prefer tasks in the same area as just-completed work for better context continuity
- The handoff goal MUST include instructions to update progress.txt, commit, and re-invoke this skill
