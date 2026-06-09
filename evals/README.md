# Harness Evals

Evals are small regression checks for agent behavior and model selection. They are useful when changing `AGENTS.md`, skills, prompts, or trying a new model.

Principles:

- Eval definitions are durable and live here.
- Raw run notes/logs are disposable and should live under ignored `.features/evals/` when needed.
- Prefer local, deterministic checks first.
- Use model-graded or human-graded checks only when style/behavior cannot be judged mechanically.

## Running the minimal style eval

```bash
python3 scripts/evals/run_style_eval.py evals/style/minimal-code-style.json
```

Expected: exits 0 and prints each passing criterion.

## Model release usage

For a new model, run the same eval prompts against the current model and candidate model. Compare instruction following, diff discipline, verification discipline, and concision before switching defaults.
