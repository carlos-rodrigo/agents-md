# agents-md

Personal agent instructions and skills for Pi, Claude Code, Codex, and similar coding agents. `AGENTS.md` and the skills in `skills/` are the source; `~/.agents/skills` links to them.

## Workflow

```text
plan  →  simple-tasks  →  manager → builder → Oracle
                            (feedback loop + review until clean)
```

1. **Plan** (`plan`): agree on what we are building and how: behavior, how the current code works and whether it is fit for the change, the design, how we will verify it, the build order, and the decisions you need to make. The Oracle reviews the plan with `are-you-proud` for contradictions and ambiguity, round after round until clean.
2. **Split** (`simple-tasks`): turn the build order into task briefs. Each task has a goal, the files it should touch, scope, and a feedback loop built with `feedback-loop`. The Oracle reviews the task set against the plan the same way.
3. **Delegate to `manager`:** it dispatches one fresh `builder` per task, checks its proof, and summons Oracle. It routes repairs until a review has no must-fix or should-fix findings, then accepts completion and updates pending tasks. The builder implements and runs the task's feedback loop; it does not coordinate reviews or mark work done.

Say “Implement TASK-003” or “Implement the remaining tasks for this feature.” Shared `AGENTS.md` routes implementation to `manager`; you do not trigger review and repair separately. For a request without a task brief, the builder creates one. Explicit small inline work can still skip task artifacts and use `feedback-loop` directly.

`manager` and `builder` are agent definitions in `pi-config`, not skills. They run Claude models pinned in their definitions. The current launcher uses fresh contexts for repair calls too, handing off through task Results and Oracle findings.

## Where things live

```text
AGENTS.md                         # baseline rules for every project
docs/adrs/                        # lasting system decisions: architecture.md, api.md, web.md
.features/{feature}/plan.md       # the feature plan (gitignored working material)
.features/{feature}/tasks/        # task briefs, _active.md board, results
.features/{feature}/artifacts/    # screenshots, logs, scripts, raw output
```

Plans, tasks, and ADRs are Markdown. Accepted decisions with lasting value move from the plan into an ADR.

## Skills

### Planning and delivery

| Skill | Use |
|---|---|
| **plan** | Plan a feature: what, why, how, verification, build order, open decisions |
| **simple-tasks** | Create and track task briefs and the `_active.md` board |
| **feedback-loop** | Build the checks that prove a task works, and the Oracle review rounds |
| **are-you-proud** | Review code, plans, and tasks for correctness, contradictions, ambiguity, and simplicity |

## Install

Link each skill into the shared skill directory:

```bash
for skill in skills/*/; do ln -sfn "$PWD/${skill%/}" ~/.agents/skills/; done
```

For Claude Code, link or copy the skills into `~/.claude/skills/` and, optionally, `ln -s AGENTS.md CLAUDE.md`.

## Tests and evals

```bash
npm test                                                           # skill contract checks
python3 scripts/evals/run_style_eval.py evals/style/minimal-code-style.json
```

Eval definitions live in `evals/` and in each skill's `evals/` folder. Keep raw run notes under `.features/evals/`.

## Principles

- **Plan before building non-trivial work.** You own product behavior, scope, and trade-offs; the plan lists the decisions that are yours.
- **Proof, not paperwork.** A task is done when its checks show the behavior works, not when its document looks complete.
- **Iterate until proud.** Review rounds repeat until no must-fix or should-fix findings remain; questions only you can answer become decisions, not findings.
- **Lightest durable artifact.** Write an ADR only for decisions with lasting value; plans and tasks are working material.

## License

MIT
