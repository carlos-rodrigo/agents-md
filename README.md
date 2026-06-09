# agents-md

Personal collection of agent skills for AI coding assistants (Pi, Claude Code, Codex, etc.). `AGENTS.md` and `~/.agents/skills` are the canonical source.

## Workflow direction

Default feature workflow is strategy-first: durable docs in `docs/features/`, execution state in ignored `.features/`.

```text
docs/features/{slug}/
  strategy.md
  system-model.md
  decisions.md
  proof.md
  diagrams/
  review.md
  index.html        # generated learning dashboard
```

```text
.features/{slug}/   # gitignored execution state
  tasks/            # optional tasks / Work Order v2 briefs
  execution/        # optional execution reports and proof evidence
```

Classic `prd.md` and `design.md` are compatibility artifacts, not the default.

This setup intentionally avoids MCP-specific workflows. Prefer local files, built-in harness tools, and explicit user approval for external services.

## Context discipline

Compaction/handoff is runtime state, not another durable artifact. When context gets large or work moves to a fresh session, carry forward only:

- goal and current status,
- decisions/constraints to preserve,
- files read or changed,
- proof run or still missing,
- blockers and next action.

Durable docs capture strategy and proof contracts; `.features/{slug}/execution/` captures task evidence.

## Skills

### Planning / Strategy

| Skill | Description |
|-------|-------------|
| **product-strategy** | Shape raw product ideas into a buildable first wedge and MVP loop |
| **prd** ★ | Compatibility skill for PRDs; defaults to feature strategy when durable framing is needed |
| **design-solution** ★ | Create/update system model, decisions, proof, and optional `.features` execution units |
| **feedback-loop** | Define proof in `proof.md` and execution-report evidence |
| **system-diagram** | Create Excalidraw-style HTML/SVG diagrams for code flow, component communication, domains, and decisions |

### Development

| Skill | Description |
|-------|-------------|
| **implement-task** | Execute one approved `.features` task/work order |
| **loop** | Autonomous execution loop over ready `.features` task/work orders |
| **simple-tasks** | Manage ignored `.features` task/work-order execution state |
| **review-pr** | Code review plus strategy/proof alignment when feature packets exist |

### Architecture

| Skill | Description |
|-------|-------------|
| **improve-architecture** ★ | Find refactoring opportunities, focus on deep modules |

### Utilities

| Skill | Description |
|-------|-------------|
| **doc-briefing** | Summarize any document into 5 key bullets |
| **audio-briefing** | Generate audio summaries |
| **tmux** | Manage background processes with tmux |

### Frontend

| Skill | Description |
|-------|-------------|
| **frontend-design** | Create distinctive production-grade frontend interfaces |
| **vercel-react-best-practices** | React/Next.js patterns from Vercel |
| **web-design-guidelines** | Web interface design guidelines |

## Installation / compatibility

Use this repo as the canonical shared skill location:

```bash
# Pi / shared agent skill location
cp -r skills/* ~/.agents/skills/
```

For Claude Code, either copy skills or symlink/import from this repo:

```bash
cp -r skills/* ~/.claude/skills/
# optional: make Claude read the same baseline
ln -s AGENTS.md CLAUDE.md
```

## Evals

Harness evals live under `evals/`. They test agent behavior and model fit, especially when changing instructions or trying a new model.

```bash
python3 scripts/evals/run_style_eval.py evals/style/minimal-code-style.json
```

Eval definitions are durable. Raw run notes/logs should stay under ignored `.features/evals/` when needed.

## Rename policy

Some skill names are kept for muscle memory (`prd`, `design-solution`, `implement-task`) but their content now follows the strategy-first workflow. Add renamed aliases later only if usage proves the old names are confusing.

## Credits

Skills marked with ★ are adapted from [mattpocock/skills](https://github.com/mattpocock/skills):
- `improve-architecture` — deep modules focus
- `prd` and `design-solution` — vertical slices/tracer bullets approach

## Philosophy

- **Strategy before execution** — user owns product/system rules, tradeoffs, scope, and proof
- **Agent owns mechanics** — implementation details, tests, and reports are agent-owned unless they alter strategy
- **Lightest durable artifact** — write docs when they preserve decisions, proof, or reusable understanding
- **Execution state is disposable** — tasks/work orders/reports live under ignored `.features`; durable decisions/proof stay in docs
- **Work Orders are optional** — use them for delegation/splitting, not for every small change
- **Proof is part of done** — execution reports record evidence, not just summaries

## License

MIT
