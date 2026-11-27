# ADR: Architecture

System-level architecture decisions for this agents repository.

## Agent workflow documentation model

Status: Accepted
Date: 2026-06-15, revised 2026-11-13

### Context

This repository defines shared agent instructions and skills. Agents need one place to find what a feature should do and how it will be built, and one place to find system-level rationale, without reconstructing either from chat history.

### Decision

- `AGENTS.md` contains baseline behavior for all projects.
- `.features/{feature}/plan.md`, written with the `plan` skill, holds what we are building and how: behavior, current code and whether it is fit for the change, design, verification, build order, and open decisions.
- `docs/adrs/` holds system-level decisions with lasting value, grouped by area: `architecture.md`, and `api.md` or `web.md` when needed.
- `.features/{feature}/tasks/` holds task briefs, feedback loops, lifecycle state, and `## Result` evidence.
- `.features/{feature}/artifacts/` holds large logs, screenshots, and raw output.

Plans, tasks, and ADRs are Markdown. There is no rendered report format.

### Consequences

- Agents read the feature plan and the relevant ADRs to understand current intent and architecture.
- Accepted decisions with lasting value move from the plan into an ADR; the rest of the plan is working material.
- Task verification lives in task feedback loops, close to implementation.
- ADRs are not a conversation log.

## Progressive disclosure for agent documentation

Status: Accepted
Date: 2026-06-15

### Context

Agent task briefs had become verbose and human-oriented. Long task files increase scan cost, hide the next action, and duplicate context already present in the plan or ADRs.

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
- Plans and ADRs remain the place for human-oriented rationale.
- Agents execute task briefs under `AGENTS.md`, using `feedback-loop` for verification, review, and results. No separate implementation skill is needed.
- The delivery manager dispatches sequential builders, owns independent Oracle review and repair routing, accepts completion, and updates pending tasks. Builders own only their assigned implementation and proof. Agent definitions live in `pi-config`. The manager replaced the shell `loop` runner, which was deleted.
- Some nuance may live behind links; task authors must keep links and escalation triggers accurate.

## Task execution without document validation

Status: Accepted

### Context

Task approval fields, contract fingerprints, and document validation added bookkeeping without proving user permission or implementation correctness. The user requested their removal from the skills and Pi configuration.

### Decision

- Use `todo`, `in-progress`, `blocked`, and `done` for task progress.
- The user's request authorizes only its explicit scope; task status and document completeness do not grant permission. Existing approval gates still apply.
- Remove the task validator, approval metadata, fingerprints, and their execution gates. Plans are Markdown and need no separate approval artifact.
- Record actual feedback-loop observations and review findings before marking work done. Failed required checks prevent completion.
- Record unresolved permission, scope, or product decisions as blockers with an owner and next action.
- Disable Pi's `verify` extension in user settings. Agents run the relevant checks explicitly rather than relying on automatic preflight injection and failure follow-ups.

### Consequences

Task files and the active board remain coordination aids, not a permission or evidence-verification system. Tests, user/system observations, review, and repository regression gates remain the proof of implementation quality.
