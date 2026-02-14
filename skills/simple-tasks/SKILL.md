---
name: simple-tasks
description: "File-based task management for agents. No CLI, no MCP - just markdown files agents can read/write directly. Triggers on: create tasks, list tasks, show tasks, task status, manage tasks."
---

# Simple Tasks

Lightweight task management using markdown files. Agents read and write tasks directly - no external dependencies.

---

## Structure

Tasks live inside the feature folder under `.features/`, alongside the PRD and design:

```
.features/
├── user-auth/                    # Feature folder
│   ├── prd.md                    # Product requirements
│   ├── design.md                 # Technical design
│   └── tasks/                    # Implementable tasks
│       ├── _active.md            # Feature context and progress checklist
│       ├── 001-setup-schema.md
│       ├── 002-add-api.md
│       └── 003-build-ui.md
├── billing/                      # Another feature (can run in parallel)
│   ├── prd.md
│   ├── design.md
│   └── tasks/
│       ├── _active.md
│       ├── 001-stripe-setup.md
│       └── 002-webhooks.md
└── archive/                      # Completed features
```

The feature folder name is derived from the PRD feature name in kebab-case (e.g., "User Auth" → `.features/user-auth/`)

---

## Task File Format

Each task is a markdown file with YAML frontmatter:

```markdown
---
id: 001
status: open          # open | in-progress | done | blocked
depends: []           # IDs of tasks that must complete first
parent: null          # ID of parent task (for grouping)
created: 2025-02-05
---

# Setup database schema

Add user preferences table with settings column.

## What to do

- Create migration file
- Add preferences table with jsonb settings column
- Add foreign key to users table

## Acceptance criteria

- [ ] Migration runs without error
- [ ] Table exists with correct columns
- [ ] Rollback works

## Files

- db/migrations/
- db/schema.ts

## Verify

```bash
npm run db:migrate && npm run typecheck
```
```

---

## Operations

### List Tasks

Read `.features/{feature}/tasks/` directory, parse frontmatter, filter by status:

```bash
ls -1 .features/{feature}/tasks/*.md 2>/dev/null | head -20
```

Then read each file's frontmatter to get status.

**Quick status check:**
```bash
grep -l "status: open" .features/{feature}/tasks/*.md
```

### Find Ready Tasks

A task is **ready** when:
- `status: open`
- All tasks in `depends` array have `status: done`

```bash
# Find open tasks
grep -l "status: open" .features/{feature}/tasks/*.md

# For each, check if dependencies are done
```

### Create Task

1. Find next ID: `ls .features/{feature}/tasks/*.md | wc -l` + 1
2. Create file with template
3. Use kebab-case filename: `003-descriptive-name.md`

### Update Task Status

Edit the frontmatter directly:

```bash
# Mark in-progress
sed -i '' 's/status: open/status: in-progress/' .features/{feature}/tasks/001-task-name.md

# Mark done  
sed -i '' 's/status: in-progress/status: done/' .features/{feature}/tasks/001-task-name.md
```

Or use `edit_file` to update the status line.

### Archive Completed Feature

When all tasks for a feature are done:

```bash
DATE=$(date +%Y-%m-%d)
FEATURE="feature-name"
mkdir -p .features/archive/$DATE-$FEATURE
mv .features/$FEATURE/ .features/archive/$DATE-$FEATURE/
```

---

## Active Feature Context

Each feature's tasks folder contains `_active.md` (`.features/{feature}/tasks/_active.md`) to track progress:

```markdown
# Current Feature: User Preferences

Started: 2025-02-05
Parent Task: 001

## Progress

- [x] 001 - Schema setup
- [ ] 002 - API endpoints  
- [ ] 003 - Settings UI

## Patterns Discovered

- Use jsonb for flexible settings storage
- Preferences component follows SettingsCard pattern
```

---

## Naming Convention

Files use zero-padded IDs for natural sorting:

```
001-first-task.md
002-second-task.md
...
010-tenth-task.md
```

---

## Minimal Task (Quick Capture)

For fast task creation, minimal format works:

```markdown
---
id: 004
status: open
depends: [003]
---

# Add validation to settings form

Validate email format and required fields before save.
```

---

## Helper Script (Optional)

For convenience, create `.features/tasks.sh`:

```bash
#!/bin/bash

case "$1" in
  list)
    for f in .features/${2:-*}/tasks/*.md; do
      [ -f "$f" ] || continue
      [[ "$(basename "$f")" == _* ]] && continue
      id=$(basename "$f" .md | cut -d'-' -f1)
      status=$(grep "^status:" "$f" | cut -d' ' -f2)
      title=$(grep "^# " "$f" | head -1 | sed 's/^# //')
      printf "%s [%s] %s\n" "$id" "$status" "$title"
    done
    ;;
  ready)
    for f in .features/${2:-*}/tasks/*.md; do
      [ -f "$f" ] || continue
      [[ "$(basename "$f")" == _* ]] && continue
      status=$(grep "^status:" "$f" | cut -d' ' -f2)
      [ "$status" = "open" ] || continue
      # Check dependencies (simplified - assumes empty depends means ready)
      deps=$(grep "^depends:" "$f" | sed 's/depends: \[//' | sed 's/\]//')
      if [ -z "$deps" ] || [ "$deps" = "" ]; then
        basename "$f"
      fi
    done
    ;;
  *)
    echo "Usage: tasks.sh [list|ready] [feature-name]"
    ;;
esac
```

---

## Best Practices

1. **One task = one commit** - Keep tasks small enough to complete in one iteration
2. **Always update status** - Mark in-progress when starting, done when complete
3. **Check dependencies** - Don't start a task until depends are done
4. **Archive regularly** - Move completed features to archive/
5. **Use acceptance criteria** - Makes it clear when task is done

---

## Example Workflow

```bash
# 1. Create feature tasks (after PRD and design are approved)
# Agent creates .features/user-prefs/tasks/001-schema.md, 002-api.md, 003-ui.md

# 2. Find ready task
grep -l "status: open" .features/user-prefs/tasks/*.md
# → .features/user-prefs/tasks/001-schema.md (no dependencies)

# 3. Work on task
# Agent reads task, implements, runs verify command

# 4. Mark complete
# Agent edits 001-schema.md: status: open → status: done

# 5. Find next ready task
# 002-api.md now ready (depends: [001] is done)

# 6. Repeat until all done

# 7. Archive
mkdir -p .features/archive/2025-02-05-user-prefs
mv .features/user-prefs/ .features/archive/2025-02-05-user-prefs/
```
