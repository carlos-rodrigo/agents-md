---
name: design-solution
description: "Create a feature's high-level design.html from an approved PRD: pattern research, architecture diagrams, design rationale, ADRs when needed, and optional task briefs. Triggers on: create design, design this, design.html, architecture diagram, plan phases, break down PRD, tracer bullets."
---

# Feature Design

Use this skill when implementation needs a durable high-level design before coding.

Default durable artifacts:

```text
docs/features/{feature}/prd.html    # product source of truth / BDD requirements
docs/features/{feature}/design.html # high-level design source of truth and visual review artifact
docs/adrs/                          # optional system-level ADRs by architectural area
```

Optional task briefs live outside docs:

```text
.features/{feature}/tasks/   # gitignored task briefs with task-level design and feedback loops
```

Markdown design artifacts are legacy. Do not create a separate `.md` design file by default. The current intended high-level design belongs in `design.html`; durable rationale for architecture-significant choices belongs in ADRs; task verification belongs in each task's feedback loop.

## Ownership boundaries

| Layer | Owns | Does not own |
| --- | --- | --- |
| `prd.html` | product why, what, scope, constraints, accepted behavior | architecture or implementation mechanics |
| `design.html` | high-level solution shape, diagrams, workflow, boundaries, invariants, architecture why, pattern research | low-level task steps or test evidence |
| `docs/adrs/` | durable rationale for architecture-significant decisions | running notes or feature-local task history |
| `.features/.../tasks/` | vertical slices, local implementation choices, feedback loops, results | durable product/architecture source of truth |

Design should not invent product behavior. If the PRD/user stories are too vague for architecture, pause and update the PRD with clearer BDD requirements before designing.

## Design needed gate

Create or update `design.html` when:

- current vs intended behavior is not obvious,
- approved PRD requirements need high-level architecture/workflow modeling,
- multiple implementation approaches exist,
- domain concepts/states/rules need naming,
- API/schema/auth/migration boundaries matter,
- rollout/rollback/observability concerns matter,
- execution should be split into tasks with task-level design and feedback loops.

Skip durable design when the change is small, the PRD or approved brief and feedback loop are clear, and implementation can proceed directly.

## Design granularity

Default to one self-contained `design.html` for the feature. It should explain the stack/architecture shape, principal workflows, shared invariants, boundaries, rollout, major tradeoffs, and pattern research as the **current intended state**.

If `design.html` already exists, update it as the current intended design. Do not append historical design logs; preserve history only in ADRs when rationale matters.

Do **not** put low-level implementation design in `design.html`. Task-level design belongs in the task brief that implements one vertical slice.

The HTML must be readable in a browser without chat history. It should combine concise text with graph diagrams: architecture boundaries, flows, component communication, domain concepts, state/lifecycle, major decisions, and how the PRD maps to the solution.

## Process

### 1. Read the approved PRD

Prefer:
1. `docs/features/{feature}/prd.html`
2. an approved feature brief in chat

If PRD behavior is still ambiguous, use `prd` to clarify BDD requirements before designing. If an architecture-significant choice is missing, ask the user or capture an explicit ADR instead of designing around a hidden assumption.

Design gate:
- PRD/user stories are clear enough to identify principal workflows and architecture boundaries.
- Open product questions stay in the PRD; do not convert them into design assumptions silently.
- Architecture-significant open questions are called out in `design.html` and resolved by ADR when needed.
- Task-level unknowns may be deferred to tasks if they do not change high-level architecture or product behavior.

### 2. Research patterns and prior art

Before choosing a design for non-trivial or unfamiliar work, run a short research phase to ground the solution in proven patterns.

Research targets:
- official framework/platform docs for the relevant components,
- mature open-source implementations or reference architectures,
- credible engineering/product case studies and success/failure reports,
- known patterns for the feature type, interaction model, data flow, reliability, observability, security, and rollout.

Use `websearch` / `webfetch` for targeted external research. Use the `researcher` agent when the domain is unfamiliar, broad, or benefits from parallel code/web exploration.

Keep research decision-grade:
- timebox unless the user asks for deep research,
- prefer primary sources and production examples over blog spam,
- capture links and only the insight that changes design,
- compare patterns against the PRD, repo constraints, and existing architecture,
- do not copy external architecture blindly.

If web research is unavailable or unnecessary, state why and proceed with repo/system inspection.

### 3. Inspect the system

Read/search enough code to anchor the design:
- actors/triggers,
- current components/functions/routes/jobs,
- data/state ownership,
- boundaries and contracts,
- PRD BDD requirements and acceptance criteria,
- verification surfaces that tasks can use for feedback loops.

Read existing `design.html` and relevant `docs/adrs/` before changing architecture-significant areas.

Do not create exhaustive file inventories. Capture only anchors that matter for execution.

### 4. Create `design.html`

Use `html-report-designer` for the report shell, visual hierarchy, accessibility, and review UX. Start from `resources/design-template.html` when creating or significantly refreshing a feature design. Use the `system-diagram` skill for inline SVG diagrams inside the report.

Create a self-contained HTML/SVG artifact:

```text
docs/features/{feature}/design.html
```

The page should be understandable without chat history and should include:

- title, feature summary, status, and link/path to `prd.html`,
- how to read the diagrams and color/ownership legend,
- pattern research influences and success cases that shaped the design,
- design thesis: the high-level solution shape and why it fits the PRD, constraints, and existing system,
- current flow and intended flow,
- component/service/module communication and boundaries,
- domain concepts and important states/lifecycle,
- invariants and operational concerns,
- major design decisions and tradeoffs,
- architecture alternatives considered,
- rollout/rollback or migration paths when relevant,
- PRD requirement coverage highlights,
- task boundary hints and feedback-loop hooks when tasks are planned,
- architecture/product questions that block design or task execution.

Use graph diagrams for the architecture story and an enjoyable report layout for the review story. Prefer a small set of clear sections in one page over many separate files. If a section becomes crowded, use progressive disclosure and multiple SVG diagrams inside `design.html` rather than creating sibling diagram files by default.

Add stable review anchors to meaningful sections and diagram elements so HTML review comments can attach to durable targets:

```html
<section data-review-id="flow.intended">
<g data-review-id="component.worker-retry-boundary">
<div data-review-id="decision.cache-strategy">
```

Design narrative pattern:

```text
PRD need → current reality → design thesis → intended workflow → boundaries → domain model → decisions → operations → requirement coverage → task feedback hooks
```

Required design review components:

- executive dashboard with PRD link, owner, architecture risk, readiness, next action, and 3-5 thesis takeaways;
- pattern research table showing source, insight, and design impact;
- current-flow and intended-flow figures with legends and `data-review-id` anchors on meaningful SVG groups;
- component communication table showing owner, handoff, and boundary;
- domain model table showing concepts, states, lifecycle, and invariants;
- decision cards with chosen direction, why it fits, alternatives rejected, tradeoffs, and risks;
- operational concerns table for rollout, rollback, observability, migration, and failure handling;
- requirement coverage matrix mapping PRD `REQ-*` IDs to design mechanisms and feedback-loop hooks;
- task boundary hints that defer low-level implementation design to task briefs;
- open-question table with owner and blocker status.

Recommended page structure:

```html
<!-- docs/features/{feature}/design.html -->
<section data-review-id="summary">...</section>
<section data-review-id="pattern-research">...</section>
<section data-review-id="design-thesis">...</section>
<section data-review-id="current-flow">...</section>
<section data-review-id="intended-flow">...</section>
<section data-review-id="component-communication">...</section>
<section data-review-id="domain-model">...</section>
<section data-review-id="design-decisions">...</section>
<section data-review-id="requirement-coverage">...</section>
<section data-review-id="tasks-and-feedback">...</section>
```

Design quality and smell check:

- every major PRD requirement maps to a design mechanism or explicit gap;
- current and intended flows are both described when existing behavior matters;
- component boundaries say who owns state, who calls whom, and what crosses boundaries;
- decisions show alternatives and tradeoffs instead of only the final answer;
- operational concerns cover rollout/rollback/observability when relevant;
- architecture-significant choices identify whether an ADR is needed;
- no unresolved `{{PLACEHOLDER}}` tokens remain;
- `data-review-id` anchors are unique and stable;
- generated report passes `node /Users/carlosrodrigo/agents/scripts/validate-html-report.mjs docs/features/{feature}/design.html` when available.

Smells to fix before handoff:

- design invents product behavior not present in the PRD;
- diagrams are decorative, unlabeled, or too dense to explain a workflow;
- decisions hide alternatives, risks, or rejected paths;
- task-level mechanics crowd out high-level architecture;
- verification evidence is duplicated in design instead of deferred to task feedback loops;
- cross-boundary/API/schema/auth/migration choices appear without ADR consideration.

Open the HTML when local browser access is available:

```bash
open docs/features/{feature}/design.html
```

If an HTML review tool is available, open `design.html` in review mode so the user can comment directly on the design before tasks are created. If browser/review access is unavailable, report the path and how to open it.

### 5. Record ADRs only when needed

Create or update a system-level ADR only for architecture-significant decisions where durable rationale matters, such as API/schema boundaries, auth/security/privacy, persistence/migration, rollout strategy, cross-service ownership, or major module boundaries.

Use ADR files by architectural area, created when needed:

```text
docs/adrs/architecture.md # whole-system architecture
docs/adrs/api.md          # API boundaries/contracts
docs/adrs/web.md          # web/client architecture
```

Suggested ADR section shape inside the relevant file:

```markdown
## {Decision title}

Status: Proposed | Accepted | Superseded by {section/link}
Date: YYYY-MM-DD

### Context

What architectural state or constraint forced this choice?

### Decision

The chosen architecture direction.

### Consequences

- Positive consequences.
- Tradeoffs / risks.
- Follow-up required.
```

Do not use ADRs as a running conversation log or feature-local task history. ADRs are system-level architecture records grouped by architectural area. When architecture changes, update `design.html` to the new intended design and update the relevant ADR file only if the rationale must be preserved.

### 6. Defer verification to task feedback loops

Verification is task-local by default.

Each task should include a compact `## Feedback loop` from the `feedback-loop` skill: desired state, fastest check, user/system check, edge case, gate, and evidence path.

If a feature has cross-task release acceptance that cannot fit inside individual tasks, capture it in the relevant task or ask before creating a separate release checklist.

### 7. Create tasks only when useful

Use task briefs when execution should be approved, split, delegated, or resumed later. Put them under ignored `.features/{feature}/tasks/`, not `docs/features/`.

Tasks should follow `simple-tasks`: compact, agent-readable, and progressively disclosed. Include only execution-critical goal/context/files/risks/feedback loop up front; link human-oriented PRD/design/ADRs instead of copying them.

Small approved features may skip task briefs and execute directly from the PRD or approved brief plus an inline feedback loop.

## Output

End with:

```text
Design gate: {satisfied | blocked pending PRD/architecture clarification}
Research: {sources reviewed | skipped with reason}
Design mode: single HTML design artifact; task-level design and feedback loops deferred to tasks
Design updated: docs/features/{feature}/design.html {opened/reviewed | not opened + reason}
Validation: {passed | not run + reason | failed + key issue}
ADRs: {none | docs/adrs/architecture.md | docs/adrs/api.md | docs/adrs/web.md}
Tasks: {none | .features/{feature}/tasks/...}
Next: {review design.html | execute directly | create/review tasks | resolve PRD/architecture questions | define task feedback loops}
```
