# agents-md

Personal collection of agent skills for AI coding assistants (Pi, Claude Code, Codex, etc.). `AGENTS.md` and `~/.agents/skills` are the canonical source.

## Workflow direction

Default feature workflow is strategy-first: durable feature docs in `docs/features/`, system-level ADRs in `docs/adrs/`, and execution state in ignored `.features/`.

```text
docs/features/{slug}/
  strategy.md
  prd.md            # when BDD requirements are needed
  system-model.md   # current intended architecture for the feature
  diagrams/
  review.md
```

```text
docs/adrs/
  architecture.md   # whole-system architecture decisions
  api.md            # API decisions, created when needed
  web.md            # web/client decisions, created when needed
```

```text
.features/{slug}/   # gitignored execution state
  tasks/            # optional tasks / Work Order briefs with feedback loops
  execution/        # optional execution reports and feedback-loop evidence
```

Classic `design.md` is a compatibility artifact, not the default. Generic `decisions.md` and `proof.md` are not default artifacts.

This setup intentionally avoids MCP-specific workflows. Prefer local files, built-in harness tools, and explicit user approval for external services.

## Context discipline

Compaction/handoff is runtime state, not another durable artifact. When context gets large or work moves to a fresh session, carry forward only:

- goal and current status,
- architecture/constraints to preserve,
- files read or changed,
- feedback-loop evidence run or still missing,
- blockers and next action.

Durable docs capture strategy, current architecture, and ADR-worthy rationale; task feedback loops and `.features/{slug}/execution/` capture execution evidence.

## Skills

### Planning / Strategy

| Skill | Description |
|-------|-------------|
| **product-strategy** | Shape raw product ideas into a buildable first wedge and MVP loop |
| **prd** ★ | Compatibility skill for PRDs; defaults to feature strategy when durable framing is needed |
| **design-solution** ★ | Create/update system model, system-level ADRs when needed, and optional `.features` execution units |
| **feedback-loop** | Define task-level feedback loops and execution-report evidence |
| **system-diagram** | Create Excalidraw-style HTML/SVG diagrams for code flow, component communication, domains, and decisions |

### Development

| Skill | Description |
|-------|-------------|
| **implement-task** | Execute one approved `.features` task/work order |
| **loop** | Autonomous execution loop over ready `.features` task/work orders |
| **simple-tasks** | Manage ignored `.features` task/work-order execution state |
| **review-pr** | Code review plus strategy, architecture, and feedback-loop alignment when feature packets exist |

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

- **Strategy before execution** — user owns product/system rules, tradeoffs, scope, and acceptance behavior
- **Progressive disclosure** — essential facts first; links and optional sections for detail
- **Agent-first tasks** — task briefs use bullets, paths, commands, expected results, and escalation triggers
- **Agent owns mechanics** — implementation details, tests, and reports are agent-owned unless they alter strategy or architecture
- **Lightest durable artifact** — write docs when they preserve requirements, current architecture, ADR-worthy rationale, or reusable understanding
- **Execution state is disposable** — tasks/work orders/reports live under ignored `.features`; durable architecture/rationale stays in docs
- **Work Orders are optional** — use them for delegation/splitting, not for every small change
- **Evidence is part of done** — execution reports record feedback-loop evidence, not just summaries

## License

MIT
