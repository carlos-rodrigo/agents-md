# ADR: Architecture

System-level architecture decisions for this agents repository.

## Agent workflow documentation model

Status: Accepted
Date: 2026-06-15

### Context

This repository defines shared agent instructions and skills. Earlier workflow docs treated feature-level snapshot files for rationale and verification as default durable artifacts. That made it hard for agents to reconstruct the current intended state because conversational history can drift away from the task that must execute it.

### Decision

Use this documentation architecture:

- `AGENTS.md` contains baseline behavior for all projects.
- `docs/features/{feature}/prd.html` captures product direction, scope, accepted behavior, and acceptance criteria as a browser-reviewable product source of truth.
- `docs/features/{feature}/design.html` captures the current intended architecture/design for a feature and is the default visual design review artifact for non-trivial designs.
- `docs/adrs/` contains system-level ADR files grouped by architectural area:
  - `architecture.md` for whole-system architecture.
  - `api.md` for API boundaries/contracts, created when needed.
  - `web.md` for web/client architecture, created when needed.
- `.features/{feature}/tasks/` contains task-level design, feedback loops, lifecycle state, and `## Result` evidence.
- `.features/{feature}/artifacts/` contains optional large logs/screenshots/raw outputs.

Do not create extra feature-level snapshot files by default.

### Consequences

- Agents should reconstruct current architecture from `design.html` and relevant `docs/adrs/` files.
- Architecture-significant changes update `design.html` and the relevant ADR file.
- Task verification lives in task feedback loops, close to implementation.
- ADRs are not a running conversation log; they preserve durable system-level rationale by architectural area.

## Browser-reviewable HTML feature artifacts

Status: Accepted
Date: 2026-06-18

### Context

Markdown PRDs and separate diagram pages make feature review feel fragmented: product intent, architecture rationale, diagrams, open questions, and review comments live in different modes. The user wants PRDs and designs to be enjoyable browser experiences that support visual review, stable commenting anchors, and richer information hierarchy.

Research on long-form documentation, accessibility, and dashboard/report design points toward scannable summaries, in-page navigation, progressive disclosure, semantic structure, and informational visuals rather than flat walls of text.

### Decision

Feature PRDs and designs are browser-reviewable, self-contained HTML reports by default:

- `docs/features/{feature}/prd.html` is the product source of truth.
- `docs/features/{feature}/design.html` is the high-level architecture/design source of truth.
- `html-report-designer` owns the reusable report shell, visual hierarchy, accessibility, and review anchors.
- `system-diagram` owns truthful SVG diagrams embedded in those reports.
- Stable `data-review-id` anchors are required for review-worthy sections, cards, tables, and diagram nodes.

### Consequences

- Feature review should be more visual, scannable, and pleasant.
- Agents must preserve review anchors when updating HTML artifacts.
- HTML docs must remain portable: inline CSS/SVG, no required external assets, and usable print/accessibility structure.
- Task briefs remain Markdown because they are agent execution packets, not human review reports.

## Progressive disclosure for agent documentation

Status: Accepted
Date: 2026-06-15

### Context

Agent task briefs had become verbose and human-oriented. Long task files increase scan cost, hide the next action, and duplicate context already present in PRD, design, or ADRs.

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
- PRD HTML/design.html/ADRs remain the place for human-oriented rationale.
- Task files become stable loop inputs for `implement-task` and `loop`.
- Some nuance may live behind links; task authors must keep links and escalation triggers accurate.
