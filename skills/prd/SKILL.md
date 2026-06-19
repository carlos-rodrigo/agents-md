---
name: prd
description: "Create or update a feature PRD as a reviewable HTML product source of truth with why, what, scope, BDD-style requirements, and acceptance criteria. Triggers on: create a prd, write prd, prd.html, plan feature, requirements for, user stories, acceptance criteria."
---

# Product Requirements Document

Use this skill when the user needs feature-level product intent clarified before design or implementation.

Default durable artifact:

```text
docs/features/{feature}/prd.html
```

A PRD is the product source of truth for a feature: **why it matters, what should change, who it serves, what is in/out, and how the desired behavior will be accepted**.

Generate the PRD as a self-contained, reviewable HTML report. Use `html-report-designer` for the page shell, visual hierarchy, accessibility, and review anchors.

Markdown PRDs are legacy/compatibility outputs. Do not create a separate Markdown PRD by default unless the user asks or the repo requires it.

Downstream artifacts derive from the PRD:

| Layer | Artifact | Owns |
| --- | --- | --- |
| Product definition | `prd.html` | why, target user, outcome, scope, constraints, observable behavior, BDD scenarios, acceptance criteria |
| Design | `design.html` | high-level solution/design, diagrams, workflows, boundaries, invariants, tradeoffs, rollout |
| ADRs | `docs/adrs/{architecture,api,web}.md` | system-level architecture rationale |
| Execution | `.features/.../tasks/*.md` | one vertical slice, local implementation choices, task feedback loop, evidence |

Default flow:

```text
raw idea → prd.html → design.html when needed → optional ADR update → compact tasks with feedback loops
```

Do not create extra feature-level product documents by default. If the idea is too broad for a PRD, ask the few product questions needed to make the PRD coherent rather than creating a separate artifact.

## Mode selection

Choose the lightest mode that preserves product clarity:

- **Draft-first PRD** — for single-surface or bounded features. Write a useful draft, mark gaps clearly, then invite review.
- **Question-first PRD** — for broad, risky, cross-functional, business-model, auth/permission, billing, API contract, migration, or compliance work. Ask 2-4 blocking questions before drafting.
- **Review/update PRD** — when a PRD already exists. Tighten ambiguity, remove implementation leakage, add missing examples/acceptance, and preserve existing decisions unless the user changes them.

Ask only questions that affect scope, constraints, acceptance behavior, risk, or downstream design. Do not interrogate for details the agent can safely mark as open or assumed.

## Discovery loop

Before finalizing requirements, use a compact Example Mapping pass when useful:

```text
Story → Rules → Examples → Questions → Deferred stories
```

- **Story**: actor, capability, outcome.
- **Rules**: product rules, permissions, boundaries, constraints.
- **Examples**: concrete main/edge/error/empty-state examples.
- **Questions**: owner and whether each blocks design or tasks.
- **Deferred stories**: adjacent behavior explicitly out of scope.

Prefer concrete examples over generic prose. Use Gherkin to express behavior, not UI click scripts or implementation procedures.

## Process

1. Read/search enough reality to avoid invented requirements when working in an existing repo.
2. Identify user-owned product decisions versus agent-owned implementation choices.
3. Capture product context: target user, problem, desired outcome, success signal, scope, non-goals, constraints, risks.
4. Convert desired behavior into stories, rules, examples, and acceptance criteria with stable IDs.
5. Mark uncertainty explicitly:
   - `[TBD]` — not decided yet.
   - `[ASSUMED]` — agent inferred this; user should verify before sharing/implementation.
   - Open question — owner and whether it blocks design/task execution.
6. Use `html-report-designer` to write/update `docs/features/{feature}/prd.html`.
7. Open the PRD in a browser when possible:

```bash
open docs/features/{feature}/prd.html
```

8. Hand off to `design-solution` or `simple-tasks` when behavior is clear enough.

## HTML PRD structure

Use this reviewable structure inside `prd.html`:

```text
summary                  # status, user, capability, outcome, success signal
problem                  # why now, pain, opportunity
users-and-jobs           # users/actors and desired jobs/outcomes
scope                    # in, out, non-goals
constraints              # product/UX/API/security/performance/migration constraints
requirements             # story cards with stable STORY/REQ IDs
examples                 # BDD examples, main/edge/error/empty/permission
acceptance               # AC checklist grouped by story
assumptions              # explicit assumptions with impact if wrong
open-questions           # owner, blocks design/task/none, resolution
ready-for-design         # readiness checklist and next action
```

Required review anchors:

```html
<section data-review-id="summary">
<section data-review-id="problem">
<section data-review-id="scope">
<article data-review-id="requirements.story-001">
<tr data-review-id="requirements.req-001">
<tr data-review-id="acceptance.ac-001">
<section data-review-id="open-questions">
<section data-review-id="ready-for-design">
```

Recommended top viewport:

- Status: Draft / Review / Approved / Blocked.
- User, capability, outcome, success signal.
- 3-5 key takeaways.
- Next review action.
- Open question count.

## Requirement content pattern

Each story card should include:

```text
STORY-001 — {Capability}
As a {actor}, I want {capability}, so that {outcome}.
Priority: P1 / P2 / P3

Rules:
- REQ-001: System MUST ...
- REQ-002: System MUST ...

Examples:
- Main: Given ..., when ..., then ...
- Edge/error/empty/permission: Given ..., when ..., then ...

Gherkin:
Scenario: Main path
  Given ...
  When ...
  Then ...

Acceptance:
- AC-001: Observable result:
- AC-002: Boundary/error result:
- AC-003: Permission/empty/loading state, if relevant:
```

Use cards/tables/details in HTML to keep this scannable:

- story summary visible by default,
- rules and acceptance in compact tables,
- longer Gherkin examples in `<details>` blocks,
- assumptions/questions as callouts or tables.

## Ready for design checklist

A PRD is ready for design when:

- [ ] Target user, problem, outcome, and success signal are clear.
- [ ] Scope and non-goals are explicit.
- [ ] Each story has observable acceptance criteria.
- [ ] Main, edge/error, empty/loading, and permission states are covered when relevant.
- [ ] Product constraints and dependencies are explicit.
- [ ] Open questions identify whether they block design or tasks.
- [ ] `prd.html` has stable `data-review-id` anchors for review.

## Requirement quality checklist

A PRD is ready for implementation planning when:

- every story has an actor, capability, and outcome,
- every requirement is observable, necessary, and not implementation-specific,
- acceptance criteria can be verified by a human or automated check without guessing,
- BDD scenarios describe behavior, not UI procedure or code structure,
- edge/error/empty/loading/permission states are covered or explicitly not applicable,
- constraints and dependencies are product-relevant, not hidden architecture assumptions,
- open questions have owners and blocker status,
- non-goals prevent obvious scope creep.

## Anti-patterns

Avoid:

- creating a monolithic PRD for a tiny obvious change,
- vague requirements like “support/manage/handle X” without observable behavior,
- subjective acceptance like “intuitive”, “seamless”, “robust”, or “clean”,
- loopholes like “if possible”, “as needed”, or “where applicable”,
- hidden assumptions that look like product decisions,
- Gherkin written as UI automation steps when behavior would be clearer,
- prescribing architecture, file structure, data models, APIs, or implementation details that belong in `design.html`, ADRs, or tasks,
- duplicating task feedback loops inside the PRD,
- beautiful HTML that hides product uncertainty instead of making it reviewable.

## Next step

After approval:

- use `design-solution` to create `design.html` for high-level solution/design, diagrams, workflows, boundaries, and ADR-worthy tradeoffs,
- update `docs/adrs/` if system-level architecture rationale changes,
- use `simple-tasks` for compact agent-readable tasks with feedback loops,
- execute only ready tasks.

## Output

End with:

```text
PRD updated: docs/features/{feature}/prd.html {opened/reviewed | not opened + reason}
Status: {Draft | Review | Approved | Blocked}
Review anchors: {yes | no + reason}
Ready for design: {yes | no + blockers}
Next: {review prd.html | create design.html | create tasks | resolve questions}
```
