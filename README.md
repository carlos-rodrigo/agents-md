# agents-md

Personal collection of agent skills for AI coding assistants (Pi, Claude Code, Codex, etc.)

## Workflow direction

Default feature workflow is now strategy-first:

```text
docs/features/{slug}/
  strategy.md
  system-model.md
  decisions.md
  proof.md
  work-orders/      # optional Work Order v2 delegation briefs
  execution/        # execution reports and proof evidence
  diagrams/
  review.md
  index.html        # generated learning dashboard
```

Classic `prd.md`, `design.md`, and `.features/{slug}/tasks/` are compatibility paths, not the default.

## Skills

### Planning / Strategy

| Skill | Description |
|-------|-------------|
| **prd** | Compatibility skill for PRDs; defaults to feature strategy when durable framing is needed |
| **design-solution** | Create/update system model, decisions, proof, and optional work orders |
| **feedback-loop** | Define proof in `proof.md` and execution-report evidence |
| **system-diagram** | Create Excalidraw-style HTML/SVG diagrams for code flow, component communication, domains, and decisions |

### Development

| Skill | Description |
|-------|-------------|
| **tdd** | Test-driven development with red-green-refactor loop |
| **implement-task** | Execute one approved Work Order v2 or legacy task |
| **loop** | Autonomous execution loop over ready work orders or legacy tasks |
| **simple-tasks** | Manage markdown work orders/tasks; `.features` is legacy/optional |
| **review-pr** | Code review plus strategy/proof alignment when feature packets exist |

### Architecture

| Skill | Description |
|-------|-------------|
| **improve-architecture** | Find refactoring opportunities, focus on deep modules ★ |

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

## Installation

Copy skills to your agent's skills directory:

```bash
# Pi / shared agent skill location
cp -r skills/* ~/.agents/skills/

# Claude Code
cp -r skills/* ~/.claude/skills/
```

## Rename policy

Some skill names are kept for muscle memory (`prd`, `design-solution`, `implement-task`) but their content now follows the strategy-first workflow. Add renamed aliases later only if usage proves the old names are confusing.

## Credits

Skills marked with ★ are adapted from [mattpocock/skills](https://github.com/mattpocock/skills):
- `design-an-interface` — based on "Design It Twice" concept
- `improve-architecture` — deep modules focus
- `grill-me` — interview methodology
- `tdd` — red-green-refactor approach
- `prd` and `design-solution` — vertical slices/tracer bullets approach

## Philosophy

- **Strategy before execution** — user owns product/system rules, tradeoffs, scope, and proof
- **Agent owns mechanics** — implementation details, tests, and reports are agent-owned unless they alter strategy
- **Lightest durable artifact** — write docs when they preserve decisions, proof, or reusable understanding
- **Work Orders are optional** — use them for delegation/splitting, not for every small change
- **Proof is part of done** — execution reports record evidence, not just summaries

## License

MIT
