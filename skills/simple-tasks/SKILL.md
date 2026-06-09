---
name: simple-tasks
description: "File-based task/work-order management in ignored .features directories. Use when creating, listing, or updating execution units; durable strategy/proof stays in docs/features. Triggers on: create tasks, list tasks, task status, work orders."
---

# Simple Tasks / Work Orders

Use markdown execution state only when work benefits from explicit delegation, sequencing, or resumption.

Execution state lives in gitignored `.features/`:

```text
.features/{feature}/
├── tasks/          # optional tasks / Work Order v2 briefs
└── execution/      # optional execution reports and proof evidence
```

Durable feature docs, when useful, stay in `docs/features/{feature}/`:

```text
docs/features/{feature}/
├── strategy.md
├── system-model.md
├── decisions.md
├── proof.md
├── diagrams/
└── review.md
```

Do **not** put tasks, work orders, or execution reports under `docs/features/`. Do **not** force task files for tiny or one-shot changes.

---

## Task / Work Order format

```markdown
---
id: WO-001
status: draft # draft | ready | blocked | done
order: 1
created: YYYY-MM-DD
---

# WO-001: {Title}

## Mission

One concrete execution mission.

## Strategic context

Relevant excerpt from strategy/system model, or a direct user-approved brief.

## Decisions to preserve

- D-001 — ...

## Agent-owned choices

- Implementation details the agent may decide.

## Escalation triggers

- Product/system ambiguity
- Conflict with decisions
- Proof cannot be produced
- Scope expansion

## Proof required

- [ ] Targeted check
- [ ] Regression gate

## Execution report

After implementation, write an execution report under `../execution/` and mark this task/work order `done`.
```

### Status semantics

- `draft` — not approved for execution.
- `ready` — user approved; agent may execute.
- `blocked` — waiting on decision/dependency/proof.
- `done` — implemented and execution report exists.

Only `ready` execution units should be executed. Existing legacy tasks may use `status: open`; treat `open` as ready only when dependencies and proof are clear.

---

## Execution reports

Reports live in:

```text
.features/{feature}/execution/
```

They should include frontmatter:

```yaml
---
id: ER-001
workOrder: WO-001
status: draft # draft | complete
created: YYYY-MM-DD
---
```

Reports capture repo-relative files changed, proof results, deviations, and follow-up. Keep them concise; they are execution evidence, not durable product docs.

---

## Operations

### List execution units

```bash
ls -1 .features/{feature}/tasks/*.md 2>/dev/null | grep -v README
```

### Find ready execution units

```bash
grep -El "status: (ready|open)" .features/{feature}/tasks/*.md 2>/dev/null
```

### Create an execution unit

Create the next numbered markdown file manually under:

```text
.features/{feature}/tasks/NNN-title.md
```

### Create an execution report

Create the matching report under:

```text
.features/{feature}/execution/NNN-wo-XXX.md
```

---

## Best Practices

1. **Research before splitting** — capture likely files and verification before writing execution units.
2. **One unit = one behavior** — keep each task/work order small enough to finish cleanly.
3. **Self-contained execution** — include enough context to execute without broad rediscovery.
4. **Prefer one good task over many vague ones.**
5. **Status must be trustworthy** — never mark ready/done prematurely.
6. **Proof is part of done** — no `done` without recorded evidence.
