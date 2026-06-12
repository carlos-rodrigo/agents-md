---
name: feedback-loop
description: "Define actionable proof for a feature: proof.md checks, work-order proof required, and execution-report evidence. Triggers on: feedback loop, how to test, verification plan, define testing, acceptance criteria, proof plan."
---

# Feedback Loop / Proof Plan

Define **how** to prove a feature works with concrete, reproducible evidence.

In feature-flow, write durable proof to:

```text
docs/features/{feature}/proof.md
```

Proof consumes strategy, PRD BDD requirements, high-level system design, and Work Orders, then turns them into executable evidence. It proves accepted behavior and technical risk controls; it does not create new requirements.

Use proof as a layered feedback loop:

| Layer | What proof answers | Example evidence |
| --- | --- | --- |
| Strategy | Did we improve the intended outcome or wedge? | product metric, usage signal, user-observable result |
| PRD | Did the promised capability and BDD scenarios work? | targeted test, API/CLI/browser check, demo flow |
| High-level design | Did risky architecture assumptions hold? | migration test, rollback check, log/metric, load/security check |
| Work order | Did this vertical implementation slice complete safely? | execution report with commands/results |

Tasks/Work Orders in `.features/{feature}/tasks/` reference the relevant proof; execution reports in `.features/{feature}/execution/` record what actually passed.

---

## The Problem

"Verify it works" is not enough. Agents need:
- where to look,
- what to run or do,
- real inputs/scenarios,
- expected results,
- edge cases,
- final regression gate.

Proof should be executable by an agent and understandable by the user.

---

## Output shape for `proof.md`

````markdown
# Proof: {Feature Name}

## Acceptance evidence

| Source | Behavior / risk | Evidence | Status | Owner |
| --- | --- | --- | --- | --- |
| `prd.md` / `system-model.md` / strategy / Work Order | ... | ... | planned | agent |

## Targeted checks

```bash
# narrow checks that prove changed behavior
```

## Manual / E2E checks

1. Action → Expected result.
2. Edge case → Expected result.

## Regression gate

```bash
# repo-level command, e.g. bash scripts/verify.sh
```

## Evidence log

- YYYY-MM-DD — command/action, exit/result, relevant output summary, follow-up if any.
````

Use `planned` before execution and update to `passed`/`failed` when evidence exists. For non-trivial features, every PRD BDD scenario or requirement should appear in acceptance evidence or have an explicit deferral/test exception.

---

## Bug fixes

For bugs, define a pre-change reproduction whenever possible:

1. Reproduction command/action.
2. Current failing result.
3. Expected fixed result.
4. Targeted regression check that fails before and passes after the fix.

If reproduction is impossible, state why and record the closest observable evidence.

---

## Verification Types

Pick the fastest loop that proves reality.

### 1. Automated tests

Always prefer a narrow automated check first.

```markdown
1. Run `npm run test -- --grep "priority"` → all priority tests pass.
2. Run `npm run typecheck` → no type errors.
```

### 2. CLI / headless checks

Best for business logic and data transforms.

```markdown
1. Run `npx tsx scripts/validate-invoice.ts --days=31 --amount=1000`
   → Expected: `penalty=15, total=1015`.
```

### 3. API checks

Use curl or scripts for backend behavior.

```markdown
1. `curl -X POST localhost:3000/api/tasks -d '{"title":"Test"}' -H 'Content-Type: application/json'`
   → Expected: 201 and default priority in response.
```

### 4. Browser / UI checks

Use `agent-browser` only after fast checks pass.

```markdown
1. Open `http://localhost:3000/tasks`.
2. Verify priority badges render for high/medium/low tasks.
3. Change priority and verify the UI updates without reload.
```

---

## Task / Work Order integration

Each execution unit should include a compact **Proof required** section tied to the PRD requirement, high-level design risk, and task-level design:

```markdown
## Proof required

- [ ] PRD acceptance scenario: `docs/features/{feature}/prd.md#...` → expected result
- [ ] Targeted check: ...
- [ ] Design-risk check, if applicable: ...
- [ ] Regression gate: ...
```

Do not mark a task/work order `done` until an execution report records the proof result.

---

## Execution report integration

Execution reports live under `.features/{feature}/execution/` and should copy actual evidence, not plans:

```markdown
## Proof commands and results

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run test:feature-flow` | passed | dashboard test assertions |
```

Use repo-relative paths only.

---

## Test exceptions

If automated tests are skipped, record:
- why a targeted automated check was not practical,
- what manual/CLI/API evidence was used instead,
- what follow-up coverage would close the gap.

---

## Principles

1. **Fastest loop first** — tests > CLI > API > browser.
2. **Reproduce before fixing** — bug proof should include before/after evidence when possible.
3. **Real inputs beat invented fixtures** — use docs/API samples/realistic fixtures when possible.
4. **Specific expected results** — no vague "looks good".
5. **Edge experiments** — include failure/boundary/concurrency/empty-state cases when relevant.
6. **Observability matters** — for runtime behavior, include logs/metrics/events/health checks when they are the user-visible proof surface.
7. **Agent-executable** — every step should be runnable with available tools.
8. **Proof is part of done** — work is not complete until evidence is recorded.
