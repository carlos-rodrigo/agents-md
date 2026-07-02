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

1. Read the approved PRD.
2. Explain the system in simple pieces and paths.
3. Draw semantic diagrams that teach, not decorate.
4. Choose the smallest architecture that satisfies the PRD.
5. Split the work into outside-in vertical slices when useful.
6. Record ADRs only for system-level decisions.
7. Validate the HTML and cite sources.
8. Stop before line-by-line implementation or task evidence.

## Plain-language test

A smart 10-year-old should understand the first pass:

- **Pieces:** What parts exist or will be added?
- **Path:** What happens first, next, and last?
- **Rules:** What must always be true?
- **Memory:** What data/state is kept, and who owns it?
- **Danger:** What can go wrong, and how do we see/fix it?
- **Slices:** What is the first small useful thing we can build?

If a diagram or paragraph does not help explain those ideas, simplify it.

## Ownership boundaries

- `prd.html` owns product why, what, scope, workflows, and acceptance behavior.
- `design.html` owns architecture shape, boundaries, invariants, decisions, diagrams, and outside-in slice designs.
- `docs/adrs/` owns durable system-level rationale for architecture-significant decisions.
- `.features/.../tasks/` owns execution details, local feedback loops, and actual result evidence.

Design must not invent product behavior. If PRD behavior is unclear, pause and update/clarify the PRD before designing.

## Design needed gate

Create or update `design.html` when one of these is true:

- current vs intended behavior is not obvious,
- multiple implementation approaches exist,
- domain states/rules need naming,
- API/schema/auth/migration/persistence boundaries matter,
- rollout/rollback/observability matters,
- execution should be split or delegated.

Skip durable design for small clear changes that can proceed from an approved brief plus a task feedback loop.

## Process

### 1. Read the PRD

Prefer:

1. `docs/features/{feature}/prd.html`
2. an explicit approved feature brief from the user

Check that principal workflows, acceptance behavior, constraints, and non-goals are clear. Keep product open questions in the PRD; do not turn them into hidden design assumptions.

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
- design thesis: the solution shape and why it fits,
- architecture overview: packages/modules/runtime/data ownership/dependency rules,
- semantic diagrams showing existing/new/changed parts,
- compact architecture delta list,
- outside-in slice plan tied to PRD stories/AC IDs,
- major decisions, risks, operational concerns, and open questions,
- story coverage matrix only when traceability would otherwise be unclear.

## Semantic diagram rules

Prefer tiny diagrams before big ones:

```text
Actor → Entry point → Application seam → Domain rule → State/output
```

Rules:

- 3-7 nodes by default.
- Use verb labels: “creates”, “checks”, “locks”, “records”, “emits”.
- Show existing/new/changed components.
- Show ownership and boundaries when they matter.
- Use multiple small diagrams instead of one crowded map.
- Use build-time ELK for 4+ node routed architecture/call-flow diagrams when practical:

```bash
node /Users/carlosrodrigo/agents/scripts/render-elk-diagram.mjs spec.json output.svg
```

Inline the final SVG. Edge labels must be foreground pill labels and must not collide with nodes/edges.

## Outside-in slice design

Every likely execution slice starts from an external need and works inward. Do not start from tables, classes, or generic domain models.

Small slice pattern:

```text
SLICE-001 — {slice name}
External need: {user/API/message/job/module} needs {capability} to get {observable outcome}.
Entry point: {UI action | route | command | event | public function}.
Acceptance boundary: prove from outside with {BDD/API/CLI/browser/contract check}.
Small design:
  1. Delivery/contract: {handler/component/controller/consumer and response/error states}.
  2. Application seam: {use case/service/command that coordinates behavior}.
  3. Domain behavior pulled by need: {rules/entities/value objects needed now}.
  4. Ports/adapters: {repositories/clients/queues/files/external systems needed now}.
  5. Persistence/data: {minimal read/write shape and migration concern, if any}.
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
- [ ] Diagrams teach semantics; they are not decorative.
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
- The first diagram is too dense to explain aloud.
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
ADRs: {none | docs/adrs/architecture.md | docs/adrs/api.md | docs/adrs/web.md}
Tasks: {none | .features/{feature}/tasks/...}
Next: {review design.html | execute directly | create/review tasks | resolve questions | define task feedback loops}
```
