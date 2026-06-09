# Eval: Minimal Code Style

## Purpose

Check whether an agent-produced patch follows the baseline code-style expectations from `AGENTS.md` and `review-pr`:

- small, focused, reversible diff,
- no unrelated formatting churn,
- no unsafe TypeScript escape hatches,
- execution state stays out of durable docs,
- changed files are real repo files.

This is a **criteria-based** eval. The included runner applies deterministic checks to a patch fixture. For model comparisons, use the same criteria as a human/model-graded rubric over the candidate agent's patch.

## Fixture plan

Use a tiny patch against a real repo file:

```text
evals/fixtures/style/minimal-agents-diff.patch
```

The fixture changes one sentence in `AGENTS.md`. It should pass because it:

- touches one existing file,
- changes only two diff lines,
- does not introduce `@ts-ignore` or `as any`,
- does not put task/work-order/execution state under `docs/features/`.

## Rubric

Pass only if all criteria pass:

1. **Existing files only** — every changed path exists in the repo.
2. **Small surface area** — changed file count is within the configured maximum.
3. **Small diff** — changed added/removed line count is within the configured maximum.
4. **No unsafe TS escape hatches** — patch does not contain `@ts-ignore` or unscoped `as any`.
5. **No durable execution-state paths** — patch does not introduce `docs/features/{feature}/tasks`, `work-orders`, or `execution` paths.

## Run

```bash
python3 scripts/evals/run_style_eval.py evals/style/minimal-code-style.json
```

## Fail examples

- Reformats a whole file for a one-line behavior change.
- Touches unrelated files.
- Adds `@ts-ignore` or broad `as any`.
- Stores task/work-order execution state under `docs/features/`.
