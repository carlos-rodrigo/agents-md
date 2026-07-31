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
- `docs/features/{feature}/prd.document.json` is the editable product source; `prd.html` is its deterministic browser review and approval artifact.
- `docs/features/{feature}/design.document.json` is the editable architecture source; `design.html` is its deterministic browser review artifact for non-trivial designs.
- `docs/adrs/` contains system-level ADR files grouped by architectural area:
  - `architecture.md` for whole-system architecture.
  - `api.md` for API boundaries/contracts, created when needed.
  - `web.md` for web/client architecture, created when needed.
- `.features/{feature}/tasks/` contains task-level design, feedback loops, lifecycle state, and `## Result` evidence.
- `.features/{feature}/artifacts/` contains optional large logs/screenshots/raw outputs.

Do not create extra feature-level snapshot files by default.

### Consequences

- Agents should reconstruct current architecture from `design.html` and relevant `docs/adrs/` files.
- Architecture-significant changes update `design.document.json` and the relevant ADR, then regenerate `design.html` for review.
- Task verification lives in task feedback loops, close to implementation.
- ADRs are not a running conversation log; they preserve durable system-level rationale by architectural area.

## Browser-reviewable HTML feature artifacts

Status: Accepted
Date: 2026-06-18

### Context

Markdown PRDs and separate diagram pages make feature review feel fragmented: product intent, architecture rationale, diagrams, open questions, and review comments live in different modes. The user wants PRDs and designs to be enjoyable browser experiences that support visual review, stable commenting anchors, and richer information hierarchy.

Research on long-form documentation, accessibility, and dashboard/report design points toward scannable summaries, in-page navigation, progressive disclosure, semantic structure, and informational visuals rather than flat walls of text.

### Decision

Feature PRDs and designs are browser-reviewable, self-contained HTML reports by default. As amended by the 2026-07-28 canonical rendering decision, structured JSON is the sole editable source and HTML is its byte-matching review projection:

- `docs/features/{feature}/prd.document.json` owns editable product content; `prd.html` is the product review and approval artifact.
- `docs/features/{feature}/design.document.json` owns editable architecture content; `design.html` is the high-level architecture review artifact.
- `html-report-designer` owns the reusable report shell, visual hierarchy, accessibility, and review anchors.
- `system-diagram` owns retained Excalidraw JSON and generated SVG embedded in those reports.
- Stable `data-review-id` anchors are required for review-worthy sections, components, decisions, and diagram elements.

### Consequences

- Feature review should be more visual, scannable, and pleasant.
- Agents preserve review anchors by editing structured source and regenerating; generated HTML is never patched.
- HTML docs must remain portable: inline CSS/SVG, no required external assets, and usable print/accessibility structure.
- Task briefs remain Markdown because they are agent execution packets, not human review reports.

## Single canonical report rendering boundary

Status: Accepted
Date: 2026-07-28

### Context

PRD, design, generic report, and standalone diagram templates evolved separate HTML, CSS, components, motion, and review-state behavior. Instructions to copy or imitate the correct shell were CWD-dependent and could not guarantee that a generated report followed the intended visual and interaction contract. Browser-local reviewer selections also needed a clear boundary from canonical approval.

### Decision

This decision amends the editable-source language in the earlier documentation-model and browser-artifact ADRs. Use one production report rendering boundary owned by `html-report-designer`:

- `canonical-report-v1` structured JSON is the editable generation source.
- `resources/report-template.html` and `report.tailwind.css` are the sole report shell and style family.
- The bundled skill-relative renderer validates PRD/design section profiles, approval metadata, decision lifecycle, stable review IDs, and Excalidraw provenance before producing self-contained HTML.
- `prd` and `design-solution` own required meaning and section roles; they never author report markup or CSS.
- `system-diagram` is the only diagram renderer and retains Excalidraw JSON beside generated SVG.
- Browser decision recording and Markdown export are review input. Only explicit human approval reconciled into canonical source changes document or decision status.
- Missing renderers or invalid authority block generation; there is no alternate template or diagram fallback.

### Consequences

- Presentation fixes and accessibility improvements apply to every durable document kind.
- New semantic components require a shared schema/renderer change rather than one-off HTML.
- Installed skills must carry their scripts/resources and resolve them relative to their loaded `SKILL.md`.
- Existing generated HTML remains readable but must be migrated to structured source before canonical regeneration.
- Repository verification covers deterministic rendering, positive/negative PRD/design profiles, decision persistence/export, Excalidraw freshness, clean-copy portability, and browser fallbacks.

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

## Task readiness authorization

Status: Accepted
Date: 2026-07-31

### Context

Task completeness and permission to execute were both represented by `status: ready`. An agent could therefore satisfy the detail floor and self-mark a generated task ready even when the user had approved only upstream product or architecture truth. Conversely, requiring separate human approval for every mechanical task would add ceremony after the user had explicitly authorized a task set.

### Decision

Separate executable completeness from authority to execute:

- New tasks default to `draft`.
- An Approved design authorizes task drafting, not the generated task details themselves.
- A task becomes `ready` only after explicit user authorization, recorded as machine-checkable `authorized_by`, `authorized_at`, `authorization_basis`, and `authorization_fingerprint` frontmatter.
- `authorization_basis` uses `approved-design: {project-relative design.document.json}` for non-trivial work or `user-request: {bounded context}` for a tiny clear/directly approved change. Upstream product/design authority remains in Source anchors rather than an overloaded field.
- The validator confirms Approved design source/report content for `approved-design` and binds authorization to Goal, Change, Done, authorization basis, and binding Execute behavior/scope/constraints/invariants through the fingerprint.
- An agent may restore a previously authorized blocked task to `ready` only when the blocker is local, authorization metadata is preserved, upstream authority is current, the binding task contract is unchanged, and validation passes.
- A change to required behavior, scope, implementation constraints, or invariants invalidates the fingerprint and prior task authorization until the user authorizes the revision.
- `blocked` is reserved for previously authorized execution with a blocked Result. Work still waiting on upstream authority remains `draft` and exposes the blocker on `_active.md`.

### Consequences

- `ready` means both explicitly authorized and executable; neither condition implies the other.
- `implement-task` and loops block on missing authorization or stale upstream authority rather than inferring permission from completeness, passing tests, or prior implementation.
- Task files retain lightweight frontmatter rather than introducing a separate approval artifact or task database.
