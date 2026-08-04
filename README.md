# agents-md

Personal collection of agent skills for AI coding assistants (Pi, Claude Code, Codex, etc.). `AGENTS.md` and `~/.agents/skills` are the canonical source.

## Workflow direction

Default feature workflow is PRD-first: durable feature docs in `docs/features/`, system-level ADRs in `docs/adrs/`, and task-loop state in ignored `.features/`.

```text
docs/features/{slug}/
  prd.document.json # editable product source rendered deterministically
  prd.html          # product review and approval artifact
  design.document.json # editable architecture source rendered deterministically
  design.html       # high-level architecture/design review artifact
```

```text
docs/adrs/
  architecture.md   # whole-system architecture decisions
  api.md            # API decisions, created when needed
  web.md            # web/client decisions, created when needed
```

```text
.features/{slug}/   # gitignored task-loop state
  tasks/            # optional task briefs with feedback loops and results
  artifacts/        # optional large logs/screenshots/raw outputs
```

Classic `design.md` and extra feature-level snapshot docs are compatibility artifacts, not the default.

This setup intentionally avoids MCP-specific workflows. Prefer local files, built-in harness tools, and explicit user approval for external services.

## Context discipline

Compaction/handoff is runtime state, not another durable artifact. When context gets large or work moves to a fresh session, carry forward only:

- goal and current status,
- architecture/constraints to preserve,
- files read or changed,
- feedback-loop evidence run or still missing,
- blockers and next action.

Durable docs capture product requirements, current architecture, and ADR-worthy rationale; task feedback loops and `## Result` sections capture task-local evidence.

## Skills

### Planning / Product

| Skill | Description |
|-------|-------------|
| **prd** ★ | Create/update feature `prd.html` reports with why, what, scope, BDD requirements, and acceptance criteria |
| **design-solution** ★ | Create/update design source plus rendered `design.html`, with system ADRs when needed |
| **html-report-designer** | Create enjoyable, accessible, self-contained HTML reports for PRDs, designs, diagrams, and decision packets |
| **feedback-loop** | Define task-level feedback loops and task-local results |
| **system-diagram** | Create retained structured diagram JSON and clean, accessible, self-contained infrastructure SVGs |

### Development

| Skill | Description |
|-------|-------------|
| **implement-task** | Execute one approved `.features` task brief |
| **loop** | Autonomous execution loop over ready `.features` task briefs |
| **simple-tasks** | Manage ignored `.features` task loop state |
| **review-pr** | Code review plus PRD, architecture, and feedback-loop alignment when feature packets exist |

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

# The System Diagram renderer is dependency-free and needs no install step.
```

For retained diagrams from the former Excalidraw backend, follow `skills/system-diagram/references/migrating-from-excalidraw.md` before regeneration.

For Claude Code, either copy skills or symlink/import from this repo:

```bash
cp -r skills/* ~/.claude/skills/
# optional: make Claude read the same baseline
ln -s AGENTS.md CLAUDE.md
```

## Evals and validation

Harness evals live under `evals/`. They test agent behavior and model fit, especially when changing instructions or trying a new model.

```bash
python3 scripts/evals/run_style_eval.py evals/style/minimal-code-style.json
```

All durable PRDs, designs, reports, decisions, research briefs, and diagram packets render through one canonical report template. Render and validate with the bundled skill-relative scripts:

```bash
node ~/.agents/skills/html-report-designer/scripts/render-canonical-report.mjs \
  docs/features/<feature>/design.document.json \
  docs/features/<feature>/design.html
node ~/.agents/skills/html-report-designer/scripts/validate-html-report.mjs \
  docs/features/<feature>/design.html
```

Focused checks (run the relevant one while iterating):

```bash
npm run test:reports
npm run test:skills
npm run test:diagram
# Full compatibility proof for the documented minimum runtime:
npx --yes -p node@18.20.8 -p npm@10.8.2 -c 'node -v && npm -v && npm ci && npm run verify'
```

Single final gate, which includes the focused suites:

```bash
npm run verify
```

Eval definitions are durable. Raw run notes/logs should stay under ignored `.features/evals/` when needed.

## Rename policy

Some skill names are kept for muscle memory (`prd`, `design-solution`, `implement-task`) and now follow the PRD-first workflow. Add renamed aliases later only if usage proves the old names are confusing.

## Credits

Skills marked with ★ are adapted from [mattpocock/skills](https://github.com/mattpocock/skills):
- `improve-architecture` — deep modules focus
- `prd` and `design-solution` — vertical slices/tracer bullets approach

## Philosophy

- **PRD before execution** — user owns product/system rules, tradeoffs, scope, and acceptance behavior
- **Progressive disclosure** — essential facts first; links and optional sections for detail
- **Agent-first tasks** — task briefs use bullets, paths, commands, expected results, and escalation triggers
- **Agent owns mechanics** — implementation details, tests, and reports are agent-owned unless they alter product intent or architecture
- **Lightest durable artifact** — write docs when they preserve requirements, current architecture, ADR-worthy rationale, or reusable understanding
- **Task-loop state is disposable** — tasks and large artifacts live under ignored `.features`; durable architecture/rationale stays in docs
- **Task briefs are optional** — use them for delegation/splitting, not for every small change
- **Evidence is part of done** — task `## Result` sections record feedback-loop evidence, not just summaries

## License

MIT
