---
name: feedback-loop
description: "Define task-level feedback loops: how an agent proves an implementation reaches the desired user/system state using tests, CLI/API/browser/manual checks, expected results, reruns, and evidence. Triggers on: feedback loop, how to test, verification plan, define testing, acceptance criteria."
---

# Feedback Loop

A feedback loop is the task-local test/observe/fix cycle. It tells the agent how to know the implementation reached the desired state.

Default locations:

```text
.features/{feature}/tasks/NNN-title.md#feedback-loop      # plan
.features/{feature}/execution/NNN-title.md                # evidence
```

Do not create `docs/features/{feature}/proof.md` by default.

## Progressive disclosure rule

Keep the task section compact. Put exact checks in the task; put long setup notes in optional task sections or linked docs.

## Task section shape

```markdown
## Feedback loop

- State: {desired user/system state}
- Fast: `{narrow command}` → {expected result}
- User/system: {API/browser/CLI/manual action} → {expected observation}
- Edge: {important failure/boundary case} → {expected result}
- Gate: `{final regression command}` → {expected result}
- Evidence: `.features/{feature}/execution/NNN-title.md`
```

Rules:

- Use the fastest check that proves reality: test → CLI → API → browser/manual.
- Include expected results, not just commands.
- For bugs, include the failing reproduction before the fixed check.
- If automation is not practical, say why and use explicit manual/browser evidence.
- Do not mark the task done until the execution report records actual results.

## Check patterns

```markdown
- Fast: `npm test -- priority` → priority behavior passes
- Fast: `npm run typecheck` → no type errors
- API: `curl -X POST ...` → 201 with expected JSON field
- Browser: open `/tasks`, create high-priority task → badge appears without reload
- Manual: compare screenshot to design → spacing, hierarchy, and empty state match
```

## Evidence report shape

```markdown
## Feedback loop evidence

- `command/action` → passed/failed/skipped; output or observation summary
```

## Escalate when

- desired state is unclear,
- expected result cannot be stated,
- required environment/data is unavailable,
- the check implies product/API/schema/auth/persistence/rollout changes.
