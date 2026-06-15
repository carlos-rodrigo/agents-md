# ADR: Architecture

System-level architecture decisions for this agents repository.

## Agent workflow documentation model

Status: Accepted
Date: 2026-06-15

### Context

This repository defines shared agent instructions and skills. Earlier workflow docs treated `decisions.md` and `proof.md` as default durable feature artifacts. That made it hard for agents to reconstruct the current intended state because decision logs can become conversational history, and proof plans can drift away from the task that must execute them.

### Decision

Use this documentation architecture:

- `AGENTS.md` contains baseline behavior for all projects.
- `docs/features/{feature}/strategy.md` and `prd.md` capture product direction and accepted behavior when needed.
- `docs/features/{feature}/system-model.md` captures the current intended architecture for a feature.
- `docs/adrs/` contains system-level ADR files grouped by architectural area:
  - `architecture.md` for whole-system architecture.
  - `api.md` for API boundaries/contracts, created when needed.
  - `web.md` for web/client architecture, created when needed.
- `.features/{feature}/tasks/` contains task-level design and feedback loops.
- `.features/{feature}/execution/` contains execution evidence.

Do not create generic `decisions.md` or `proof.md` by default.

### Consequences

- Agents should reconstruct current architecture from `system-model.md` plus relevant `docs/adrs/` files.
- Architecture-significant changes update the current architecture model and the relevant ADR file.
- Task verification lives in task feedback loops, close to implementation.
- ADRs are not a running conversation log; they preserve durable system-level rationale by architectural area.

## Progressive disclosure for agent documentation

Status: Accepted
Date: 2026-06-15

### Context

Agent task briefs had become verbose and human-oriented. Long task files increase scan cost, hide the next action, and duplicate context already present in strategy, PRD, system model, or ADRs.

Research-backed progressive disclosure principles apply to documentation too: show the most important information first, defer advanced or rare details, make paths to deeper detail obvious, introduce details near the step that needs them, break up walls of text, and split long procedures into smaller task-based chunks.

### Decision

Use progressive disclosure across documentation:

- Durable docs may be human-readable but should still be concise and layered.
- Task briefs are agent-optimized execution packets, not narrative specs.
- Task briefs put only execution-critical facts at the top: goal, context links, files, risks, feedback loop, blockers.
- Details move to links or optional sections only when needed for execution.
- Normal tasks should fit roughly one screen / ~80 lines; split the task when the brief needs much more.

### Consequences

- Agents spend less context on task parsing and more on implementation.
- Strategy/PRD/system-model/ADRs remain the place for human-oriented rationale.
- Task files become stable loop inputs for `implement-task` and `loop`.
- Some nuance may live behind links; task authors must keep links and escalation triggers accurate.
