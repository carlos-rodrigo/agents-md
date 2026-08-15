---
name: design-solution
description: "Produce an evidence-backed technical solution from an Approved PRD or an explicitly scoped technical feature grounded in code and architecture evidence. Map business/product need to domains, entities, mechanisms, APIs/events, controllers/adapters/services, persistence, scale, failure/recovery, and proof. Do not use for product definition, task creation, implementation, tiny changes with one obvious seam, UI styling, or generic planning."
compatibility: "Requires the html-report-designer and system-diagram skills. Final reports use the bundled canonical renderer; diagrams use the bundled deterministic infrastructure SVG renderer."
---

# Feature Design

Answer one technical-solution question:

> Given the approved product need or explicitly scoped technical change, what should exist after implementation, how do requests/events move through it, where do domains/entities and state live, and why is this the safest scalable shape?

The output is a direct map from need to implementation—not a prettier PRD. A reviewer must be able to trace:

```text
business/product need → acceptance or bounded technical outcome
→ domain concepts/entities and relationships
→ entry/event/API mechanism
→ controller/handler → application service/use case
→ policy/state transition
→ repository/adapter/integration
→ database or external effect
→ observable result, failure, recovery, and proof
```

Default artifacts:

```text
docs/features/{feature}/prd.document.json
docs/features/{feature}/prd.html
docs/features/{feature}/design.document.json
docs/features/{feature}/design.html
docs/adrs/{architecture|api|web}.md
```

`design.document.json` is the editable architecture source. `design.html` is its deterministic review projection. Never hand-author or patch report HTML/CSS.

## Gate

Use one of two evidence modes:

### Product-backed solution

Start durable product design only from an explicitly human-approved `prd.document.json` with no blocking product decision and its current validated `prd.html` review projection. Before trusting the pair, load `html-report-designer` and verify freshness:


```bash
node "<html-report-designer-dir>/scripts/render-canonical-report.mjs" --check \
  docs/features/{feature}/prd.document.json docs/features/{feature}/prd.html
```

Draft/Review product status, missing acceptance, unresolved consequential behavior, a missing source/report pair, or stale generated HTML blocks product-backed design and returns to product authority.

### Technical-evidence-backed solution

When no PRD exists, proceed only for an explicitly scoped technical outcome that does not invent or change user-visible product behavior. Establish the bounded request from the user or an approved technical issue, then inspect the current code, tests, public contracts, ADRs, dependency/import graph, persistence schemas, runtime configuration, and deployment boundaries. If the repository lacks implementation evidence, inspect the available architecture/ADR/radar material and record the missing evidence. Use external evidence only to compare patterns or validate a mechanism; it does not authorize product behavior or silently import an architecture.

A missing PRD blocks any design that changes product scope, actor behavior, acceptance, permissions, or other product truth. A missing codebase does not block a conceptual technical design when the architecture evidence and bounded outcome are sufficient, but unknown implementation facts must be labeled assumptions with owners and validation paths.

In either mode, do not proceed past an unsafe ambiguity, missing authority, or consequential decision that belongs to a human.

Skip a durable design for a tiny clear change when inspection finds one obvious existing seam, no public/schema/auth/persistence/rollout decision, and no meaningful ownership or recovery question. Record the gate result and observable proof in the task feedback loop; do not fabricate a design document.

Create or update `design.document.json` and regenerate `design.html` when competing seams, contracts, state ownership, security/privacy, migration, compatibility, rollout, operations, recovery, or independently reviewable architecture slices matter.

## Authority and approval

- `prd.document.json` owns approved product behavior, scope, acceptance, constraints, and product decisions; `prd.html` is its current validated review projection.
- `design.document.json` owns editable current feature architecture; `design.html` is its byte-matching review artifact.
- `docs/adrs/architecture.md`, `api.md`, or `web.md` owns accepted architecture-significant rationale that must outlive the feature.
- Task briefs own execution steps and planned checks after design approval.

Status is a human governance contract:

- **Draft** — default for new or materially changed technical intent.
- **Review** — coherent enough for human judgment; not approved.
- **Approved** — only after explicit human approval recorded in `document.approval`.
- **Blocked** — a product question or architecture decision prevents a truthful proposal.

New architecture choices remain Proposed until a human accepts them. Report `Ready for tasks: yes` only when status is Approved and every blocking decision is Accepted. Browser-exported decisions are review input, not canonical architecture approval.

## Required report structure

Every durable design uses these `section.role` values in causal reading order. Feature-specific headings are encouraged, but core roles may not be omitted:

1. **`authority`** — approved PRD or bounded technical outcome, evidence basis, acceptance/proof boundary, constraints, and links.
2. **`pressure`** — current system reality and force that makes the obvious solution insufficient.
3. **`seam`** — chosen owning boundary, responsibility, state ownership, and narrower rejected seams.
4. **`shape`** — concrete intended system shape and impact across architecture, API/contracts, domain, data/persistence, delivery/interface, integrations, operations/rollout, and verification; include a solution overview and reference-level contracts.
5. **`path`** — external trigger through entry, policy/state, dependency/persistence, and observable result/failure.
6. **`slices`** — independently reviewable vertical architecture outcomes that together deliver the approved promise; each carries technical participation, contract/state delta, failure ownership, and proof.
7. **`traceability`** — structured architecture-to-requirement walkthroughs for every approved BDD scenario, acceptance criterion, user story, contract, or bounded technical outcome.
8. **`diagram`** — one evidence-backed causal architecture diagram.
9. **`decisions`** — chosen seam and every consequential architecture decision with lifecycle.
10. **`proof`** — tradeoffs, failure/recovery posture, risks, and observable proof strategy.
11. **`boundary`** — adjacent architecture intentionally unchanged or deferred.

Every durable design must include all eleven roles. The `traceability` role is the architecture stress test: structured `arch-###` entries demonstrate how every requirement fits the proposal or record the owner and mismatch that blocks completion. Load [references/requirement-traceability.md](references/requirement-traceability.md) when composing or reviewing this section, and load [references/optional-design-recipes.md](references/optional-design-recipes.md) for the mandatory shape map and slice outline.

## Evidence and discovery

Before proposing the solution, create an evidence ledger:

- **Need/evidence:** PRD acceptance anchor or bounded technical request;
- **Current entry points:** routes, commands, event consumers, public functions, jobs, or UI boundaries;
- **Current owners:** real modules, domain types/entities, services, controllers, repositories, adapters, schemas, and external dependencies;
- **Current behavior:** tests, state transitions, persistence effects, failure handling, and operational signals;
- **Architecture constraints:** ADRs, dependency direction, compatibility, deployment, security/privacy, and scalability limits;
- **External evidence:** pattern/source, claim supported, applicability, and what is deliberately not imported.

Do not propose unnamed boxes when a symbol, contract, schema, or boundary can be found. If no symbol exists, state that the unit is proposed and explain why it belongs at that boundary.

## Requirement-to-solution walkthrough

After defining the proposed architecture, walk every approved requirement through it. Requirements may be BDD scenarios, acceptance criteria, user stories, API specifications, event specifications, invariants, or other explicit product/technical requirements.

Do not summarize the requirement again. For each requirement, record:

```text
Requirement: {stable source ID and short statement}
Fit: {fits | fits with stated assumption | does not fit | unresolved}
Entry/trigger: {route | command | event | job | UI action | existing state}
Participating elements: {controllers/handlers, services, domain entities/policies, repositories/adapters, persistence, external effects}
Path: {ordered calls/events/state transitions}
Contract/state consequence: {inputs, outputs, records, transitions, invariants, compatibility}
Observable result: {what the user/system can observe}
Failure/recovery: {material failure and owning recovery}
Proof: {architecture-level evidence that would demonstrate fit}
Mismatch/escalation: {user-owned question and owner | none}
```

A requirement is not covered merely because a slice or diagram mentions it. The walkthrough must prove that the selected mechanism can produce the requirement's result without violating ownership, contract, security, consistency, performance, or product boundaries.

If a requirement does not fit the proposed architecture, do not silently omit it, weaken it, invent a hidden subsystem, or force an implementation workaround. Classify the design as **Blocked** or leave the requirement explicitly **unresolved**, state the user-owned product/architecture question, explain the competing consequences, and request input from the named owner before claiming the solution is complete. A technical design may propose an option for the mismatch, but it cannot decide product behavior or consequential architecture without authority.

## Direct implementation map

The `shape` and `path` sections must answer these questions explicitly:

1. What domain concepts/entities exist, and what relationships or ownership do they have?
2. What triggers the behavior: HTTP/API call, domain event, message, scheduled job, command, or UI action?
3. Which controller/handler receives it, and what input validation/authentication occurs?
4. Which application service/use case coordinates the work?
5. Which domain policy/state transition enforces invariants?
6. Which repository, adapter, gateway, or integration is called, with what contract?
7. What database records/transaction/consistency boundary changes, if any?
8. What is returned/emitted/rendered, and how do failures/retries/idempotency/recovery work?
9. How does the shape scale in traffic, data volume, concurrency, partitions, and deployment over time?
10. How will each boundary be proven without turning the design into task commands?

For event-driven designs, name the event schema, producer, consumer, delivery semantics, ordering, deduplication/idempotency, retry/dead-letter behavior, and eventual-consistency consequence. For API-driven designs, name route/command shape, auth, validation, status/error contract, timeout, idempotency, and versioning. For controller/service/adapter designs, name dependency direction and the ownership boundary each layer enforces.

## Causal system path

Trace one canonical request or event before listing components:

```text
external trigger → entry/transport → owning seam → policy/state transition
→ dependency/persistence → observable result or material failure/recovery
```

Name real symbols and protocols when known. A node earns space only when responsibility, state, boundary, or result changes.

## System shape impact map

Every durable design must make the intended build shape explicit enough that a reviewer can answer: **what changes, what is created, where it lives, what owns it, and how the pieces collaborate?** This is architecture detail, not a line-by-line patch plan.

Cover every row below and mark it **Changed | Unchanged | Not applicable**. Unchanged and not-applicable rows still require a brief evidence-based reason; silence is not a boundary.

- **Architecture and modules** — existing symbols/boundaries affected; new or changed units; placement; responsibilities; collaboration direction.
- **API and contracts** — callers/consumers; routes, commands, events, function or message shapes; success/failure semantics; compatibility/versioning.
- **Domain model** — concepts, policies, invariants, state transitions, ownership, and language; explicitly state when no domain change is introduced.
- **Data and persistence** — schemas, records, transactions, consistency, migration/backfill, retention, rollback, or explicit absence of persistence change.
- **Delivery and interface** — entry surfaces, components/adapters, visible states, accessibility/responsiveness, and recovery ownership where applicable.
- **Integrations** — internal/external dependencies, protocols, timeout/retry/idempotency/error behavior, or explicit absence of integration change.
- **Operations and rollout** — deployment ordering, flags, compatibility window, observability, failure signals, rollback, and owner, or why none is required.
- **Verification shape** — acceptance boundary, contract/integration seams, testability strategy, critical fixtures/fakes, and regression surface without prescribing task-local commands.

For every changed row, identify concrete current symbols when known and proposed units when needed. State each unit's responsibility, inputs/outputs, owned state, failure behavior, dependencies, and explicit non-responsibilities. The shape must explain the proposed system as if it already exists, then provide reference-level contracts, state tables, decision tables, or consequential pseudocode wherever ordering, classification, retries, authorization, transactions, joins, or provenance could be interpreted differently. Include one concrete end-to-end example from input/event through the observable result. End-state contracts and algorithms are design detail; file-edit checklists, task commands, and implementation receipts belong to Simple Tasks/Implement Task. Do not invent a new API, domain abstraction, or persistence layer merely to fill the map.

## Architecture diagram

Every durable design must invoke `system-diagram` after naming the architecture question. The design owns source- and authority-classified architecture semantics, question, scope, and placement. `system-diagram` validates evidence and owns the infrastructure SVG visual encoding, accessibility, and figure reading order.

The figure must teach the causal path and selected seam—not inventory the topology. Every meaningful edge names the action, call, protocol, payload, transition, or effect. Include failure/recovery only when it changes ownership or product behavior.

Select the smallest architecture capability from the question: use sequence for temporal participant communication, flow for progression and recovery, architecture view for static communication at one declared level, and component decomposition for one bounded container or module. Retain the selected System Diagram source beside the feature, generate the SVG through the bundled renderer, and reference both from the `diagram` block. Existing graph views use `system-diagram-v1`; temporal sequence uses the approved `system-diagram-v2` sequence contract. Durable designs do not use hand-authored SVGs or a `Diagram not applicable` escape.

## Decisions and ADRs

Every design includes at least one canonical `decision` block for the chosen seam. Add others only when alternatives materially change ownership, compatibility, safety, persistence, rollout, or delivery cost.

Each decision records stable ID, `open | proposed | accepted` status, decision drivers, 2–3 credible options including no-change when relevant, option-level summaries/benefits/costs and rejection reasons, selected direction when known, recommendation, accepted consequences, revisit trigger, evidence/rationale, owner, blocker state, approver, and date. Every rendered decision has a **Decision recorded** checkbox and Markdown export. Reconcile exported review input into canonical source only after explicit approval.

Accepted rationale for public API contracts, auth/security/privacy, persistence/migration, compatibility/rollout, cross-service ownership, or major module boundaries belongs in the topical ADR. `design.html` links the ADR and states its current feature consequence; it does not duplicate the full rationale. Get approval before changing schema, API contracts, auth/financial behavior, infrastructure, or major dependencies.

## Process

1. Verify and read the Approved PRD source/report pair, existing design, relevant ADRs, entry points, owners, state, contracts, and tests.
2. Return product questions to PRD authority. Label non-blocking technical assumptions with evidence, risk, and validation path.
3. Name the architecture pressure, choose the narrowest owning seam, and trace one causal path.
4. Build the complete system shape impact map, including explicit unchanged and not-applicable boundaries.
5. Decompose the shape into vertical architecture slices and trace each slice to approved acceptance and proof.
6. Walk every requirement through the proposed architecture. Resolve every mismatch through the owning user/product/architecture decision; do not silently work around it.
7. Record decisions as Open or Proposed unless explicit human acceptance already exists.
8. Invoke `system-diagram`; retain and validate its approved JSON/SVG pair.
9. Compose every required section role plus only warranted supporting detail in `canonical-report-v1` structured content.
10. Load `html-report-designer`; resolve paths from that loaded skill directory. Render and validate with its bundled scripts:

```bash
node "<html-report-designer-dir>/scripts/render-canonical-report.mjs" \
  docs/features/{feature}/design.document.json docs/features/{feature}/design.html
node "<html-report-designer-dir>/scripts/validate-html-report.mjs" \
  docs/features/{feature}/design.html
```

10. Update a topical ADR when the accepted decision meets the ADR gate.
11. Open the report for review when possible. Never patch generated HTML.
12. Stop before task creation, line-by-line patches, test commands, or execution evidence.

If a companion skill or renderer is unavailable, report the blocker. Do not create a fallback shell or diagram.

## Architecture slices

Architecture slices are required for every durable design. A slice is an independently reviewable vertical outcome, not a package/layer phase or task brief. Together the slices must cover the approved product promise and the changed rows in the system shape impact map without duplicating ownership.

Each slice states:

- stable ID and observable outcome;
- approved PRD acceptance anchors;
- external need and entry point;
- participating existing and proposed units;
- owning seam, contracts, state transition, dependencies, and invariants;
- visible result plus material failure/recovery behavior;
- proof strategy and dependency on other slices;
- escalation boundary for unresolved architecture or product truth.

A small durable design may have one slice. Omit slices only when the design gate skips the durable design entirely. Design slices link product acceptance anchors but do not reproduce PRD stories as their primary content. Do not call task briefs “slices,” turn slices into file-edit checklists, create package/layer phases, or create task files inside this skill.

## Handoff

After explicit design approval, pass approved acceptance anchors, the chosen seam and ownership, invariants, accepted decisions, boundaries, proof expectations, and ADR links to `simple-tasks` when sequencing, delegation, looping, or resumption warrants task briefs. The approved design authorizes task drafting; only explicit user authorization makes a task `ready`. Do not create task files inside this skill.

## Quality gate

- Approved PRD source/report authority is current, validated, linked, and unchanged.
- Pressure, seam, ownership, state, causal path, proof, and boundary are explicit.
- The system shape impact map covers architecture/modules, API/contracts, domain, data/persistence, delivery/interface, integrations, operations/rollout, and verification as changed, unchanged, or not applicable with evidence.
- The shape contains a future-system walkthrough, complete changed-surface contracts, consequential state/algorithm detail, and one concrete end-to-end example.
- Changed surfaces name concrete existing and proposed units, responsibilities, contracts, state, dependencies, failures, and non-responsibilities.
- Architecture slices are vertical, acceptance-linked, collectively complete, dependency-aware, and proof-bearing.
- Exactly one infrastructure-style architecture diagram has approved System Diagram JSON/SVG provenance and a walkthrough.
- Decisions expose credible alternatives, lifecycle, tradeoffs, owner, and approval.
- Product behavior was not invented or silently changed.
- Every requirement and architecture slice has structured `arch-###` traceability, including entry, participating units, state/contracts, result, failure/recovery, fit, and proof.
- A non-fitting requirement or technical outcome is unresolved or blocked with a named decision owner and escalation question; the design never silently works around it.
- Conditional contract, interface, operations, and traceability detail is proportional to the impact map rather than omitted by default.
- ADR ownership is preserved without duplicated rationale.
- Task steps and execution evidence are absent.
- Canonical renderer, design profile validation, accessibility, mobile, print, no-JS, and reduced-motion checks pass.

## Output

```text
Design gate: {satisfied | skipped tiny clear change | blocked + owner}
Design source/report: {document.json path} · {html path}
Status: {Draft | Review | Approved by whom/when | Blocked}
Architecture thesis: {pressure → seam → observable effect}
Decisions: {IDs + lifecycle status}
Diagram: {question + JSON/SVG paths}
ADRs: {none | topical paths}
Validation: {passed | failed + issue | not run + reason}
Ready for tasks: {yes only when explicitly Approved/no blocker | no + reason}
Next: {review | resolve decision | return product question | create tasks after approval}
```
