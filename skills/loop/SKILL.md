---
name: loop
description: "Autonomous execution loop. Prefer ready Work Orders v2 under docs/features/{feature}/work-orders/; legacy .features tasks remain supported. Triggers on: run the loop, start the loop, loop, run loop, run the loop with crafter."
---

# Loop - Autonomous Execution

Execute one ready execution unit per context window, update state, then hand off to the next session.

Primary source:

```text
docs/features/{feature}/work-orders/
```

Legacy fallback:

```text
.features/{feature}/tasks/
```

Uses `simple-tasks` for state conventions and `implement-task` for execution.

---

## Prerequisites

For feature-flow work:
- `docs/features/{feature}/` exists,
- strategy/model/decisions/proof are clear enough,
- at least one work order has `status: ready`, or the next action is to review/create/unblock a work order.

For legacy work:
- `.features/{feature}/tasks/` exists,
- tasks have dependency/status metadata.

If multiple features have ready work, ask which one to run.

---

## Execution Modes

Run **one execution unit per context window**.

| Mode | Mechanism | When to use |
| --- | --- | --- |
| Interactive | handoff/new session after each unit | normal guided usage |
| Background | `loop.sh` spawns a fresh agent process per iteration | hands-off legacy usage |

---

## Feature-flow loop

### 1. Check packet state

Read:
- `/feature status {feature}` output if available,
- `docs/features/{feature}/work-orders/`,
- `docs/features/{feature}/execution/`,
- `proof.md` and `decisions.md` only as needed.

### 2. Pick a ready work order

Ready means:
- `status: ready`,
- proof requirements are specific,
- decisions referenced by the work order are resolved.

If no work orders are ready:
- draft/blocked exists → ask/recommend review or unblock,
- none exist → direct execution may be appropriate for small work; otherwise create a work order,
- all done → move to reports/review.

### 3. Execute exactly one work order

1. Load `implement-task`.
2. Execute the work order.
3. Run proof.
4. Write execution report under `execution/`.
5. Mark report `complete` after evidence is recorded.
6. Mark work order `done`.
7. Refresh dashboard with `/feature view {feature}` if useful.

### 4. Fresh context handoff

Never continue to the next work order in the same session.

Handoff shape:

```text
Continue the feature-flow loop for {feature}.
Completed: WO-XXX — {title}
Report: docs/features/{feature}/execution/...
Proof: {summary}
Next: run /feature status {feature}, then pick the next ready work order or finish review.
```

---

## Legacy `.features` loop

Use only for existing `.features/{feature}/tasks/` workflows.

A legacy task is ready when:
- `status: open`,
- dependencies are done,
- task is implementation-ready.

After execution:
- mark task `done`,
- update `_active.md` if present,
- append progress notes if the repo uses a progress file.

---

## Completion

When all work is done:
- ensure no ready/draft reports are incomplete,
- run final proof/regression gate,
- update `review.md` with strategy alignment,
- suggest `/reown --remember` only when the lesson should become searchable memory,
- do not assume commit/push unless the user or repo workflow expects it.

---

## Important

- One execution unit per context window.
- Work Orders are optional; do not force them for tiny direct work.
- Tasks/work orders are execution state, not strategy. Strategy lives under `docs/features/{feature}/`.
- Stop and surface blockers instead of guessing.
