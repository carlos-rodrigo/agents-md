---
name: design-solution
description: "Create or update a feature's high-level design.html from an approved PRD. Use for architecture shape, semantic diagrams, design rationale, ADR decisions, and optional task slices. Do not use for HTML styling alone; use html-report-designer for the report shell. Triggers on: create design, design this, design.html, architecture design, slice plan, tracer bullets."
---

# Feature Design

Use this skill to answer one architecture question:

> What pieces do we need, how do they talk, where does data live, and how will we build/test it in small slices?

Default artifacts:

```text
docs/features/{feature}/prd.html    # product source of truth
docs/features/{feature}/design.html # current intended architecture/design
docs/adrs/                          # optional durable architecture decisions
.features/{feature}/tasks/          # optional gitignored task briefs/results
```

Markdown design files are legacy. Update `design.html` as the current intended design; preserve durable rationale in ADRs only when it matters.

## In one minute

1. Read the approved PRD, including post-story user flows, domain interactions, UI options/mockups, and review gaps.
2. Explain the system in simple pieces and paths.
3. Translate PRD domain interactions into entity ownership, state transitions, invariants, and cross-entity effects.
4. Translate the selected PRD UI direction into interface boundaries, states, style/motion intent, and implementation-facing choices.
5. Draw semantic diagrams that teach, not decorate, and reveal flow in reading order.
6. Choose the smallest architecture that satisfies the PRD.
7. Split the work into outside-in vertical slices when useful.
8. Record ADRs only for system-level decisions.
9. Validate the HTML and cite sources.
10. Stop before line-by-line implementation or task evidence.

## Plain-language test

A smart 10-year-old should understand the first pass:

- **Pieces:** What parts exist or will be added?
- **Path:** What happens first, next, and last?
- **Rules:** What must always be true?
- **Look:** What will the user see, and how does each screen/state respond?
- **Motion:** What movement helps the user or reviewer understand progress?
- **Domain:** Which entities interact, which verbs connect them, and what state/effect changes?
- **Memory:** What data/state is kept, and who owns it?
- **Danger:** What can go wrong, and how do we see/fix it?
- **Slices:** What is the first small useful thing we can build?

If a diagram or paragraph does not help explain those ideas, simplify it.

## Ownership boundaries

- `prd.html` owns product why, what, scope, workflows, acceptance behavior, post-story user flows, product-level domain interactions, UI options/mockups, and reviewer gaps.
- `design.html` owns architecture shape, interface implementation strategy for the selected PRD UI direction, domain entity ownership/interactions, state transitions, invariants, boundaries, decisions, diagrams, and outside-in slice designs.
- `docs/adrs/` owns durable system-level rationale for architecture-significant decisions.
- `.features/.../tasks/` owns execution details, local feedback loops, and actual result evidence.

Design must not invent product behavior. If PRD behavior, domain language/interactions, selected UI option, or review-gap resolution is unclear, pause and update/clarify the PRD before designing.

## Design needed gate

Create or update `design.html` when one of these is true:

- current vs intended behavior is not obvious,
- multiple implementation approaches exist,
- the PRD has multiple UI options, unresolved interaction gaps, or visible state/motion choices,
- domain states/rules or cross-entity interactions need naming,
- API/schema/auth/migration/persistence boundaries matter,
- rollout/rollback/observability matters,
- execution should be split or delegated.

Skip durable design for small clear changes that can proceed from an approved brief plus a task feedback loop.

## Process

### 1. Read the PRD

Prefer:

1. `docs/features/{feature}/prd.html`
2. an explicit approved feature brief from the user

Check that principal workflows, post-story user flows, domain interactions, selected/recommended UI option, acceptance behavior, constraints, non-goals, and review-gap resolutions are clear. Keep product open questions in the PRD; do not turn them into hidden design assumptions.

### 2. Inspect the system

Read/search only enough to anchor the design:

- external triggers: UI actions, API routes, CLI commands, jobs, messages, webhooks, public module calls,
- current components/functions/routes/jobs,
- data/state ownership,
- boundary contracts,
- tests or feedback surfaces,
- existing `design.html` and relevant `docs/adrs/` for architecture-significant areas.

Do not create exhaustive file inventories.

### 3. Research only when it changes the decision

Use repo prior art first. For unfamiliar/non-trivial design choices, timebox targeted research with primary docs, mature prior art, or the `researcher` agent. Skip web research for obvious local changes and say why.

When research is used, capture only:

```text
Source → insight → design impact
```

### 4. Write `design.html`

Use `html-report-designer` for the page shell, accessibility, review anchors, visual hierarchy, and validation. Use `system-diagram` for diagrams. Do not duplicate their full checklists here.

The design should include only decision-critical material:

- title, status, PRD link, sources reviewed,
- short review path: what reviewers must decide,
- one main scenario and one edge/failure scenario,
- architecture-shaping PRD facts, not a PRD dump,
- product experience contract: selected PRD UI option/mockup, post-story flows, visible states, copy/hierarchy constraints, and unresolved UI gaps,
- domain interaction model: entity/concept ownership, verbs/actions, state transitions, invariants, cross-entity effects, and unresolved domain gaps,
- design thesis: the solution shape and why it fits,
- interface implementation strategy: components/surfaces, state model, accessibility, style/motion intent, and library choices only where they affect implementation or risk,
- architecture overview: packages/modules/runtime/data ownership/dependency rules,
- semantic diagrams showing existing/new/changed parts, domain entity interactions, and motion/read order,
- compact architecture delta list,
- outside-in slice plan tied to PRD stories/AC IDs,
- major decisions, risks, operational concerns, and open questions,
- story coverage matrix only when traceability would otherwise be unclear.

## Semantic diagram rules

Prefer tiny diagrams before big ones:

```text
Actor → Entry point → Application seam → Domain rule → Entity state/effect → State/output
```

Rules:

- 3-7 nodes by default.
- Use verb labels: “creates”, “checks”, “locks”, “records”, “emits”.
- Show existing/new/changed components.
- Show ownership and boundaries when they matter.
- For domain diagrams, connect entities with verb labels and show the state/effect that changes; do not stop at a noun-only entity map.
- Use multiple small diagrams instead of one crowded map.
- Use build-time ELK for 4+ node routed architecture/call-flow diagrams when practical:

```bash
node /Users/carlosrodrigo/agents/scripts/render-elk-diagram.mjs spec.json output.svg
```

Inline the final SVG. Edge labels must be foreground pill labels and must not collide with nodes/edges. Diagram motion should reveal the reading order: first actor/context, then action edge, then next node/state, with `diagram-reveal`, `path-draw`, `pathLength="1"`, and staggered `--reveal-delay` values. Content must remain visible without JavaScript and under `prefers-reduced-motion`.

## Outside-in slice design

Every likely execution slice starts from an external need and works inward. Do not start from tables, classes, or generic domain models.

Small slice pattern:

```text
SLICE-001 — {slice name}
External need: {user/API/message/job/module} needs {capability} to get {observable outcome}.
Entry point: {UI action | route | command | event | public function}.
Acceptance boundary: prove from outside with {BDD/API/CLI/browser/contract check}.
Small design:
  1. Product/interface contract: {selected PRD UI option, screen/TUI/document state, visible response, accessibility/motion constraints}.
  2. Delivery/contract: {handler/component/controller/consumer and response/error states}.
  3. Application seam: {use case/service/command that coordinates behavior}.
  4. Domain behavior pulled by need: {rules/entities/value objects needed now, plus entity interaction verbs and state/effect changes}.
  5. Ports/adapters: {repositories/clients/queues/files/external systems needed now}.
  6. Persistence/data: {minimal read/write shape and migration concern, if any}.
Feedback hook: {fastest proof}.
Escalate/spike if: {unknown that should not be mixed with delivery}.
```

A good slice gives an implementation agent the entry point, contract, collaborators, and feedback loop without prescribing patches.

## ADR rule

Create/update an ADR only for architecture-significant decisions: API contracts, auth/security/privacy, persistence/migration, rollout strategy, cross-service ownership, or major module boundaries.

Use area files when needed:

```text
docs/adrs/architecture.md
docs/adrs/api.md
docs/adrs/web.md
```

Do not use ADRs as running notes or task history.

## Tasks rule

Create `.features/{feature}/tasks/` only when execution needs approval, splitting, delegation, loop execution, or resumption. Each task should inherit one outside-in slice and get its own `## Feedback loop` and `## Result`.

Small approved features may skip task briefs and execute from the PRD/design plus an inline feedback loop.

## Quality checklist

Before finishing:

- [ ] The design says what pieces exist/new/change and how they talk.
- [ ] A non-engineer can follow the main scenario and diagram.
- [ ] Every product claim traces to the PRD or named source.
- [ ] The selected PRD UI option, post-story flows, domain interactions, and review gaps are consumed or explicitly blocked.
- [ ] Domain entity interactions show verbs/actions, ownership, state/effect changes, and invariants; not just entity nouns.
- [ ] Interface/library/style/motion decisions are implementation-facing and trace to product-visible UI states.
- [ ] Diagrams teach semantics; they are not decorative.
- [ ] Diagrams reveal flow in reading order and honor reduced motion.
- [ ] Slices map to PRD stories/requirements/acceptance criteria.
- [ ] Each slice starts from an external need and acceptance boundary.
- [ ] Data/API/domain contracts are conceptual and minimal.
- [ ] Operational risks are called out when relevant.
- [ ] ADR need is considered for architecture-significant choices.
- [ ] Task execution details and verification evidence stay in tasks.
- [ ] `data-review-id` anchors are stable and unique.
- [ ] HTML validation passes when available.

## Smells to fix

- Design invents product behavior not in the PRD.
- Design ignores PRD UI options/mockups or silently chooses among unresolved review gaps.
- Design lists domain entities but does not show how they interact, what action verbs connect them, or what state/effect changes.
- Interface details name libraries/styles/motion without tying them to a visible product state.
- The first diagram is too dense to explain aloud.
- Diagrams reveal everything at once instead of teaching the flow step by step.
- Slices are technical layers instead of user/system increments.
- A slice starts from database/domain/classes before defining the caller and acceptance boundary.
- Decisions list only the chosen option, not tradeoffs or rejected alternatives.
- Report styling rules are copied here instead of delegated to `html-report-designer`.
- Task-level patches or test evidence crowd out architecture.

## Output

End with:

```text
Design gate: {satisfied | blocked pending PRD/architecture clarification}
Research: {sources reviewed | skipped with reason}
Sources reviewed: {paths/docs/web sources}
Design updated: docs/features/{feature}/design.html {opened/reviewed | not opened + reason}
Validation: {passed | not run + reason | failed + key issue}
PRD UI option/gaps: {consumed | blocked + GAP IDs | not user-facing}
Domain interactions: {consumed | blocked + GAP IDs | not applicable + reason}
ADRs: {none | docs/adrs/architecture.md | docs/adrs/api.md | docs/adrs/web.md}
Tasks: {none | .features/{feature}/tasks/...}
Next: {review design.html | execute directly | create/review tasks | resolve questions | define task feedback loops}
```
