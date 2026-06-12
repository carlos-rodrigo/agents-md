---
name: simple-tasks
description: "File-based task/work-order management in ignored .features directories. Use when creating, listing, or updating execution units; durable strategy/PRD/design/proof stay in docs/features. Triggers on: create tasks, list tasks, task status, work orders."
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
├── prd.md              # product definition / BDD requirements when useful
├── system-model.md     # high-level architecture and principal workflows
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

## Strategic / PRD context

Relevant excerpt from strategy, PRD BDD story/requirement, system model, or a direct user-approved brief.

## High-level design context

- System model: `docs/features/{feature}/system-model.md#...` or none
- Decisions: `docs/features/{feature}/decisions.md#D-...` or none
- Proof: `docs/features/{feature}/proof.md#...`

## Task-level design

Low-level design for this execution slice only:
- Current code path / anchors:
- Intended code path / change:
- Data/state changes:
- Interfaces/contracts touched:
- Edge/error/permission handling:
- Local alternatives considered:
- Rollback/safety notes:

## Decisions to preserve or make locally

- D-001 — ...
- Local task decision: ...

If a local decision changes high-level architecture, product behavior, API/schema contracts, auth/security, migration, or rollout risk, promote it to `docs/features/{feature}/decisions.md` before implementation.

## Agent-owned choices

- Implementation details the agent may decide.

## Dependencies / sequencing

- Depends on: none | WO-...
- Must preserve compatibility with: ...

## Likely code anchors

- `{file/function}` — why it matters

## Escalation triggers

- Product/system ambiguity
- Conflict with decisions
- Proof cannot be produced
- Scope expansion

## Proof required

- [ ] PRD acceptance scenario covered: ...
- [ ] Targeted check: ...
- [ ] Design-risk check, if applicable: ...
- [ ] Regression gate: ...

## Execution report

After implementation, write an execution report under `../execution/` and mark this task/work order `done`.
```

### Status semantics

- `draft` — not approved for execution.
- `ready` — user approved; agent may execute.
- `blocked` — waiting on decision/dependency/proof.
- `done` — implemented and execution report exists.

Only `ready` execution units should be executed. Existing legacy tasks may use `status: open`; treat `open` as ready only when dependencies and proof are clear.

### Ready checklist

Mark `ready` only when:
- [ ] Mission is one behavior or one vertical slice, not a grab bag.
- [ ] Scope is small enough for one focused session or roughly 1–2 days.
- [ ] Relevant strategy/PRD/system-model/proof links are included or explicitly unnecessary.
- [ ] PRD requirement or BDD scenario for this slice is identified.
- [ ] Task-level design is specific enough to implement without inventing architecture/product behavior.
- [ ] Dependencies and sequencing are clear.
- [ ] Likely code anchors are listed enough to avoid broad rediscovery.
- [ ] Proof required is executable, tied to PRD acceptance behavior, and has a regression gate.
- [ ] Escalation triggers are clear.

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
2. **Prefer vertical slices** — slice through usable behavior or a deployable compatibility step; avoid layer-only tasks unless they are a safe prerequisite.
3. **One unit = one behavior** — keep each task/work order small enough to finish cleanly.
4. **Self-contained execution** — include enough context to execute without broad rediscovery.
5. **Prefer one good task over many vague ones.**
6. **Low-level design lives in the task** — keep implementation instructions close to the execution unit; promote only architecture-significant decisions to durable docs.
7. **Status must be trustworthy** — never mark ready/done prematurely.
8. **Proof is part of done** — no `done` without recorded evidence.
