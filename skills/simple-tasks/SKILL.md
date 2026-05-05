---
name: simple-tasks
description: "File-based task management for agents. No CLI, no MCP - just markdown files agents can read/write directly. Triggers on: create tasks, list tasks, show tasks, task status, manage tasks."
---

# Simple Tasks

Lightweight task management using markdown files. Agents read and write tasks directly — no external dependencies.

Use tasks when the work benefits from explicit execution state. Do **not** force task files for tiny or one-shot changes.

Before splitting work into tasks, research the relevant code and inline that research into each task. A task is only implementation-ready when it names the likely files to inspect/change, shows prior-art snippets to mirror, and calls out the tests/verification surface.

---

## Structure

Tasks live in `.features/`. Durable feature docs, if they exist, live in `docs/features/`.

```text
docs/features/
├── user-auth/
│   ├── prd.md           # optional
│   ├── design.md        # optional
│   └── workflows/       # optional durable verification docs
└── archive/

.features/
├── user-auth/
│   └── tasks/
│       ├── _active.md
│       ├── 001-setup-schema.md
│       └── 002-add-api.md
└── billing/
    └── tasks/
```

Tasks can be created from any stable source of truth:
- an approved chat plan,
- `docs/features/{feature}/prd.md`,
- `docs/features/{feature}/design.md`,
- or a combination of the above.

---

## When to create tasks

Create tasks when:
- the work will span multiple commits or sessions,
- dependencies between steps matter,
- autonomous execution/looping is desired,
- or the user wants explicit workflow state.

Skip tasks when:
- the change is small and can be completed in one bounded pass,
- or the next step is obvious enough to implement directly.

---

## Task File Format

Each task is a markdown file with YAML frontmatter. **Tasks must be self-contained** — an implementing agent should not need to read the full PRD/design or explore broadly just to understand what to build.

```markdown
---
id: 001
status: open          # open | in-progress | done | blocked
depends: []           # IDs of tasks that must complete first
created: 2026-04-10
---

# Setup database schema

Add user preferences table with settings column.

## Context

Only the relevant brief/design excerpt for this task.

## What to do

- Concrete step 1
- Concrete step 2

## Codebase research

- **Files to inspect**
  - `db/migrations/003-add-teams.ts` — migration structure to mirror
- **Files likely to change**
  - `db/migrations/` — new migration file
  - `db/schema.ts` — generated schema/types update
- **Tests / verification surface**
  - migration command
  - typecheck command
- **Constraints discovered**
  - IDs use `gen_random_uuid()`

## Patterns to follow

Use the existing migration pattern in `db/migrations/003-add-teams.ts`:

```typescript
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createTable("teams").execute();
}
```

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

## Task Readiness Rules

A task is **ready** only when all are true:
- `status: open`
- dependencies are done
- it includes `Context`, `What to do`, `Codebase research`, `Patterns to follow`, `Acceptance criteria`, `Files`, and `Verify`
- the research includes real repo-specific prior art, not placeholders

If a task only restates the desired outcome, treat it as a draft and enrich it before implementation.

---

## Operations

### List tasks

```bash
ls -1 .features/{feature}/tasks/*.md 2>/dev/null | grep -v _active
```

### Find ready tasks

A task is ready when it is open and all IDs in `depends` have `status: done`.

```bash
grep -l "status: open" .features/{feature}/tasks/*.md
```

### Create a task

1. Research the relevant code first
2. Find the next ID
3. Write a full implementation-ready task file
4. Use kebab-case filename: `003-descriptive-name.md`

### Update status

Edit the frontmatter directly:

```bash
# open -> in-progress
# in-progress -> done
```

### Archive completed feature tasks

When the feature is done, remove or archive `.features/{feature}/` according to repo conventions. Durable docs stay under `docs/features/` if they still matter.

---

## Active Feature Context

Each feature may include `.features/{feature}/tasks/_active.md` to track progress:

```markdown
# Current Feature: User Preferences

Started: 2026-04-10

## Progress
- [x] 001 - Schema setup
- [ ] 002 - API endpoints

## Patterns Discovered
- Use jsonb for flexible settings storage
```

---

## Best Practices

1. **Research before splitting** — capture prior art, likely files, and verification before writing the task
2. **One task = one behavior** — keep tasks small enough to complete cleanly
3. **Tasks must be self-contained** — do not offload missing context to future exploration
4. **Prefer one good task over many vague tasks**
5. **Always update status** — make execution state trustworthy
6. **Use acceptance criteria and verify commands** — definition of done must be explicit
