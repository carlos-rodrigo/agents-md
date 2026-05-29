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

Work Orders reference the relevant proof, and execution reports record what actually passed.

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

```markdown
# Proof: {Feature Name}

## Acceptance evidence

| Behavior | Evidence | Status | Owner |
| --- | --- | --- | --- |
| ... | ... | planned | agent |

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

- YYYY-MM-DD — result, command, relevant output summary.
```

Use `planned` before execution and update to `passed`/`failed` when evidence exists.

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

## Work Order integration

Each Work Order should include a compact **Proof required** section:

```markdown
## Proof required

- [ ] Targeted check: ...
- [ ] Regression gate: ...
```

Do not mark a Work Order `done` until an execution report records the proof result.

---

## Execution report integration

Execution reports should copy actual evidence, not plans:

```markdown
## Proof commands and results

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run test:feature-flow` | passed | dashboard test assertions |
```

Use repo-relative paths only.

---

## Principles

1. **Fastest loop first** — tests > CLI > API > browser.
2. **Real inputs beat invented fixtures** — use docs/API samples/realistic fixtures when possible.
3. **Specific expected results** — no vague "looks good".
4. **Edge experiments** — include failure/boundary/concurrency/empty-state cases when relevant.
5. **Agent-executable** — every step should be runnable with available tools.
6. **Proof is part of done** — work is not complete until evidence is recorded.
