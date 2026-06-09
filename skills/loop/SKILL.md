---
name: loop
description: "Autonomous execution loop over ready tasks/work orders in ignored .features/{feature}/tasks/. Triggers on: run the loop, start the loop, loop, run loop, run the loop with crafter."
disable-model-invocation: true
---

# Loop - Autonomous Execution

Execute one ready execution unit per loop iteration and update `.features/` state. Do not create or expect a continuation artifact.

Primary source:

```text
.features/{feature}/tasks/
```

Execution reports:

```text
.features/{feature}/execution/
```

Durable strategy/model/decisions/proof may live under `docs/features/{feature}/`, but execution state stays out of docs.

Uses `simple-tasks` for state conventions and `implement-task` for execution.

---

## Prerequisites

- `.features/{feature}/tasks/` exists.
- At least one task/work order has `status: ready` or legacy `status: open`.
- Dependencies are satisfied.
- Proof requirements are specific enough to run.

If multiple features have ready work, ask which one to run.

---

## Execution Modes

Run **one execution unit per iteration**.

| Mode | Mechanism | When to use |
| --- | --- | --- |
| Interactive | execute one unit, report status, ask before continuing | guided usage |
| Background | `loop.sh` spawns a fresh agent process per iteration until complete/blocked/max iterations | hands-off usage |

---

## Loop Steps

### 1. Check state

Read:
- `.features/{feature}/tasks/`,
- `.features/{feature}/execution/`,
- `docs/features/{feature}/proof.md` and `decisions.md` only as needed.

### 2. Pick a ready unit

Ready means:
- `status: ready` (`open` for legacy tasks),
- dependencies are satisfied,
- proof is specific,
- referenced decisions are resolved.

If no units are ready:
- draft/blocked exists → ask/recommend review or unblock,
- none exist → direct execution may be appropriate for small work; otherwise create a task/work order,
- all done → move to reports/review.

### 3. Execute exactly one unit

1. Load `implement-task`.
2. Execute the selected task/work order.
3. Run proof.
4. Write execution report under `.features/{feature}/execution/`.
5. Mark report `complete` after evidence is recorded.
6. Mark task/work order `done`.

### 4. Report iteration status

Do not produce a continuation or new-session template. Record durable evidence in `.features/{feature}/execution/`, then report only the iteration result:

```text
Loop iteration complete: WO-XXX — {title}
Report: .features/{feature}/execution/...
Proof: {summary}
Next: {continue | blocked | complete}
```

If no executable unit is ready, stop and report the blocker instead of guessing.

---

## Completion

When all work is done:
- ensure no ready/draft reports are incomplete,
- run final proof/regression gate,
- update durable `docs/features/{feature}/review.md` only if it preserves a reusable lesson,
- suggest `/reown --remember` only when the lesson should become searchable memory,
- do not assume commit/push unless the user or repo workflow expects it.

---

## Important

- One execution unit per loop iteration.
- Work Orders are optional; do not force them for tiny direct work.
- Tasks/work orders are execution state, not durable docs.
- Stop and surface blockers instead of guessing.
