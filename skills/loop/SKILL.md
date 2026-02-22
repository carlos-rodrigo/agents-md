---
name: loop
description: "Autonomous task execution loop. Triggers on: run the loop, start the loop, loop, run loop. Picks ready tasks from .features/{feature}/tasks/, executes them one at a time using Work → Review → Compound from AGENTS.md, commits, and repeats."
---

# Loop - Autonomous Task Execution

Executes tasks from `.features/{feature}/tasks/` one at a time in dependency order. Each iteration: pick a ready task, implement it, commit, repeat.

Uses **simple-tasks** for task management. Uses **AGENTS.md** for the Work → Review → Compound methodology.

---

## Prerequisites

Before running the loop:

- `.features/{feature}/tasks/` folder exists with task files (created by Phase 3: Create Tasks)
- `.features/{feature}/tasks/_active.md` has the feature context and progress checklist
- `.features/{feature}/prd.md` and `.features/{feature}/design.md` exist (for context)
- Tasks have proper `depends` relationships

If prerequisites are missing, tell the user to run planning first.

**Feature discovery:** List feature folders with `ls -d .features/*/`. If multiple features exist, ask the user which one to work on.

---

## Execution Modes

The loop runs **one task per context window**. There are two ways to get a fresh context between tasks:

| Mode            | Mechanism                                           | When to use                               |
| --------------- | --------------------------------------------------- | ----------------------------------------- |
| **Interactive** | `handoff` tool creates a new session after each task | You're in a pi interactive session        |
| **Background**  | `loop.sh` spawns a fresh agent process per iteration | You want autonomous execution (hands-off) |

**How to choose:**

- User says "run the loop" / "start the loop" → **Interactive mode**. Execute one task in this session, then call the `handoff` tool.
- User says "run the loop in the background" / "run the loop using tmux" → **Background mode**. Set up `loop.sh` via tmux (see [Running via tmux](#running-via-tmux-background--reporting)).
- User says "run loop in background using pi" (or amp/claude/opencode) → **Background mode** with explicit `--tool` set from the request (example: `--tool pi`).

Both modes use the same task execution steps (4. Execute Task). They only differ in how the next iteration starts.

---

## Loop Workflow

### 1. Check Context

Discover available features:

```bash
ls -d .features/*/ 2>/dev/null | grep -v archive
```

If multiple features have open tasks, ask the user which one to work on.

Once a feature is selected (e.g., `user-auth`):

- Read `.features/user-auth/prd.md` and `.features/user-auth/design.md` for feature context
- Read `.features/user-auth/tasks/_active.md` for progress
- Read `scripts/loop/progress-user-auth.txt` for patterns from previous iterations

### 2. Find Ready Tasks

A task is **ready** when:

- `status: open`
- All IDs in `depends` array have `status: done`

```bash
# List task files for selected feature
ls -1 .features/{feature}/tasks/*.md 2>/dev/null | grep -v _active

# Find open tasks
grep -l "status: open" .features/{feature}/tasks/*.md
```

Parse each task's frontmatter. Build a map of `id → status`. Find tasks where all dependencies are done.

### 3. No Ready Tasks?

Check completion:

```bash
grep -l "status: done" .features/{feature}/tasks/*.md 2>/dev/null | wc -l
grep -l "status: open" .features/{feature}/tasks/*.md 2>/dev/null | wc -l
```

- **All done** → Archive tasks and progress (see Archive section), then report "Loop complete - all tasks finished!"
- **Some blocked** → Report which tasks are blocked and why

### 4. Execute Task

Pick the lowest-numbered ready task (or one related to just-completed work).

1. Read `scripts/loop/progress-{feature}.txt` — check "Codebase Patterns" section for context from previous iterations
2. Load the `implement-task` skill
3. Pass the task file path: `.features/{feature}/tasks/NNN-task-name.md`

The skill handles Context → Code → Review → Compound.

Additionally, if you discovered a reusable pattern for THIS FEATURE, add it to "## Codebase Patterns" at the TOP of `scripts/loop/progress-{feature}.txt`.

#### Finalize

1. Commit all changes with message: `feat: [Task Title]`

2. Append to `scripts/loop/progress-{feature}.txt`:

```
## [Date] - [Task Title]

Task ID: [id]

- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered

---
```

3. Mark task as done — edit task file: `status: open` → `status: done`

4. Update `.features/{feature}/tasks/_active.md` — check off the completed task

### 5. Next Iteration

**CRITICAL: Do NOT continue to the next task in the same session.**

#### Interactive mode → handoff tool

Call the `handoff` tool with a goal that gives the new session everything it needs. Fill in the template with concrete values from the task you just completed:

```
goal: Continue the loop for feature "{feature}". I just completed task {id}: {title}. Key patterns/gotchas from this task: {1-2 sentence summary of learnings}. The next ready task should be picked from .features/{feature}/tasks/ — read _active.md for progress and scripts/loop/progress-{feature}.txt for codebase patterns discovered so far. Load the loop skill to continue.
```

**Example:**

```
goal: Continue the loop for feature "agentic-assistant". I just completed task 005: Memory system — Go backend domain with facts CRUD + frontend memory tools proxying to Go endpoints. Key patterns: all Firestore ops go through Go backend (no firebase-admin in frontend); use jsonSchema<T>() not Zod for AI SDK tool schemas. The next ready task should be picked from .features/agentic-assistant/tasks/ — read _active.md for progress and scripts/loop/progress-agentic-assistant.txt for codebase patterns discovered so far. Load the loop skill to continue.
```

The `handoff` tool uses this goal plus conversation history to generate a focused prompt, then creates a new session automatically.

#### Background mode → just exit

When running via `loop.sh`, the script handles iteration. After finalizing the task, just stop. The script will spawn a fresh agent process for the next iteration automatically.

If all tasks are done, output "Loop complete" so the script detects it and stops.

#### Why fresh context matters

- Prevents context degradation over many tasks
- Each task gets full context budget for implementation
- Progress file is the durable memory; the handoff goal (or script prompt) is the warm summary

---

## Progress File

Located at `scripts/loop/progress-{feature}.txt` in each project. Each feature gets its own progress file.

Initialize if missing:

```bash
mkdir -p scripts/loop
```

```markdown
# Loop Progress Log

Started: [date]
Feature: [feature name]

## Codebase Patterns

(Patterns discovered during this feature build — reusable only)

---
```

**Rules:**

- APPEND entries, never replace
- Codebase Patterns section is at the top for quick reference
- When a new feature starts, archive old progress and reset

---

## Archive

When all tasks for a feature complete:

```bash
DATE=$(date +%Y-%m-%d)
FEATURE="feature-name"

# Archive feature (PRD + design + tasks all together)
mkdir -p .features/archive/$DATE-$FEATURE
mv .features/$FEATURE/ .features/archive/$DATE-$FEATURE/

# Archive progress
mkdir -p scripts/loop/archive
mv scripts/loop/progress-$FEATURE.txt scripts/loop/archive/$DATE-$FEATURE-progress.txt
```

---

## Shell Script (Background Mode)

Used by **background mode** — each iteration spawns a fresh agent process with a clean context window.

The background assets now live **next to this skill** (global skill path):

- Script: `~/agents/skills/loop/loop.sh`
- Prompt template: `~/agents/skills/loop/prompt.md`

Prompt placeholders:

- `{{FEATURE}}`
- `{{PROGRESS_FILE}}`

Run it from any project by passing `--project-root` (or execute it while already `cd`'d into the project):

```bash
~/agents/skills/loop/loop.sh --feature {feature} --project-root "$PWD" --tool {tool} 20
```

Supported flags:

- `--feature <name>`
- `--project-root <path>`
- `--tool amp|claude|opencode|pi` (explicit; overrides auto-detect order)
- `--tool-order <csv>` (auto-detect priority, e.g. `pi,amp,claude,opencode`)
- `LOOP_TOOL_ORDER` env var (same as `--tool-order`; CLI flag wins)
- `--sleep <seconds>` delay between iterations (default: `2`)
- `--poll <seconds>` heartbeat interval while an iteration runs (default: `3`, set `0` to disable heartbeat logs)
- `LOOP_POLL_SECONDS` env var (same as `--poll`; CLI flag wins)
- positional `max_iterations` (default: 10)

Completion contract:

- Agent must output exactly: `Loop complete`
- Script also accepts legacy `<promise>COMPLETE</promise>` for backward compatibility

---

## Running via tmux (Background + Reporting)

When the user says **"run the loop using tmux"** or **"run the loop in the background"**:

### 1. Spawn the loop in a tmux window

```bash
tmux new-window -n "loop-{feature}" -d
tmux send-keys -t "loop-{feature}" "~/agents/skills/loop/loop.sh --feature {feature} --project-root $PWD --tool {tool}" C-m
```

If the user says **"run loop in background using pi"**, use `--tool pi` explicitly.

### 2. Monitor and report after each iteration

Stay interactive with the user. Poll for progress:

```bash
# Check latest tmux output
tmux capture-pane -p -t "loop-{feature}"

# Check progress file for completed tasks
cat scripts/loop/progress-{feature}.txt
```

**Polling pattern:**

```
loop:
  1. Sleep 30 seconds (or user-specified interval)
  2. Capture tmux output: tmux capture-pane -p -t "loop-{feature}"
  3. Read progress file: scripts/loop/progress-{feature}.txt
  4. Compare to last known state — detect new completed tasks
  5. Report to user:
     - Which task just completed
     - Key learnings from that iteration
     - How many tasks remain
  6. If "Loop complete" in tmux output → report final summary, stop polling
  7. If "Reached max iterations" → report and ask user what to do
  8. Otherwise → continue loop
```

### 3. Report format

After each iteration, tell the user:

```
Loop update ({feature}) — Iteration {n}
Completed: {task title}
Learnings: {brief summary from progress file}
Remaining: {count} tasks
```

When done:

```
Loop complete ({feature})
Completed {total} tasks in {n} iterations.
Summary: {list of what was built}
```

### 4. Multiple features in parallel

Can run multiple features simultaneously:

```bash
tmux new-window -n "loop-user-auth" -d
tmux send-keys -t "loop-user-auth" "~/agents/skills/loop/loop.sh --feature user-auth --project-root $PWD --tool {tool}" C-m

tmux new-window -n "loop-billing" -d
tmux send-keys -t "loop-billing" "~/agents/skills/loop/loop.sh --feature billing --project-root $PWD --tool {tool}" C-m
```

Monitor both by polling each window and progress file independently.

---

## Browser Verification (UI Tasks)

For tasks with UI changes:

1. Load the `agent-browser` skill
2. Navigate to relevant page
3. Verify changes work
4. Screenshot if helpful

UI task is NOT complete until browser verification passes.

---

## Quality Requirements

Before marking any task complete:

- Verify command from task must pass
- Changes committed and pushed
- Progress logged
- Task file updated to `status: done`
- `_active.md` checklist updated

---

## Important

- **ONE task per context window** — never implement multiple tasks in the same session
- **Interactive mode**: after completing a task, ALWAYS call the `handoff` tool to create a fresh session
- **Background mode**: after completing a task, just stop — `loop.sh` spawns the next iteration
- `scripts/loop/progress-{feature}.txt` is the memory between sessions — append learnings before handoff/exit
- Prefer tasks in the same area as just-completed work
- If not confident, stop and document uncertainty
