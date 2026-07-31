---
name: design-solution
description: "Translate an explicitly human-approved PRD into a durable technical design when architecture pressure, ownership, state, contracts, recovery, rollout, or consequential tradeoffs need review. Do not use for product definition, task creation, implementation, tiny changes with one obvious seam, UI styling, or generic planning."
compatibility: "Requires the html-report-designer and system-diagram skills. Final reports use the bundled canonical renderer; diagrams use the bundled Excalidraw renderer."
---

# Feature Design

Answer one architecture question:

> What is the smallest system shape that preserves the approved product promise, and where should responsibility live?

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

Start durable design only from an explicitly human-approved `prd.document.json` with no blocking product decision and its current validated `prd.html` review projection. Before trusting the pair, load `html-report-designer` and verify freshness:

```bash
node "<html-report-designer-dir>/scripts/render-canonical-report.mjs" --check \
  docs/features/{feature}/prd.document.json docs/features/{feature}/prd.html
```

Draft/Review product status, missing acceptance, unresolved consequential behavior, a missing source/report pair, or stale generated HTML blocks design and returns to product authority.

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

1. **`authority`** — approved PRD promise, acceptance proof, constraints, and links.
2. **`pressure`** — current system reality and force that makes the obvious solution insufficient.
3. **`seam`** — chosen owning boundary, responsibility, state ownership, and narrower rejected seams.
4. **`path`** — external trigger through entry, policy/state, dependency/persistence, and observable result/failure.
5. **`diagram`** — one evidence-backed causal architecture diagram.
6. **`decisions`** — chosen seam and every consequential architecture decision with lifecycle.
7. **`proof`** — tradeoffs, failure/recovery posture, risks, and observable proof strategy.
8. **`boundary`** — adjacent architecture intentionally unchanged or deferred.

Optional roles—contracts, interface consequences, operations, architecture slices, and traceability—exist only when they change architecture review. Load [references/optional-design-recipes.md](references/optional-design-recipes.md) for those roles.

## Causal system path

Trace one canonical request or event before listing components:

```text
external trigger → entry/transport → owning seam → policy/state transition
→ dependency/persistence → observable result or material failure/recovery
```

Name real symbols and protocols when known, while keeping the first pass boundary-level. A node earns space only when responsibility, state, boundary, or result changes.

## Architecture diagram

Every durable design must invoke `system-diagram` after naming the architecture question. The design owns approved architecture semantics, question, scope, and placement. `system-diagram` validates evidence and owns Excalidraw visual encoding, accessibility, and figure reading order.

The figure must teach the causal path and selected seam—not inventory the topology. Every meaningful edge names the action, call, protocol, payload, transition, or effect. Include failure/recovery only when it changes ownership or product behavior.

Retain the Excalidraw JSON source beside the feature, generate the SVG through the bundled renderer, and reference both from the `diagram` block. Durable designs do not use hand-authored SVGs or a `Diagram not applicable` escape.

## Decisions and ADRs

Every design includes at least one canonical `decision` block for the chosen seam. Add others only when alternatives materially change ownership, compatibility, safety, persistence, rollout, or delivery cost.

Each decision records stable ID, `open | proposed | accepted` status, options, selected direction when known, evidence/rationale, tradeoffs, owner, blocker state, approver, and date. Every rendered decision has a **Decision recorded** checkbox and Markdown export. Reconcile exported review input into canonical source only after explicit approval.

Accepted rationale for public API contracts, auth/security/privacy, persistence/migration, compatibility/rollout, cross-service ownership, or major module boundaries belongs in the topical ADR. `design.html` links the ADR and states its current feature consequence; it does not duplicate the full rationale. Get approval before changing schema, API contracts, auth/financial behavior, infrastructure, or major dependencies.

## Process

1. Verify and read the Approved PRD source/report pair, existing design, relevant ADRs, entry points, owners, state, contracts, and tests.
2. Return product questions to PRD authority. Label non-blocking technical assumptions with evidence, risk, and validation path.
3. Name the architecture pressure, choose the narrowest owning seam, and trace one causal path.
4. Record decisions as Open or Proposed unless explicit human acceptance already exists.
5. Invoke `system-diagram`; retain and validate its Excalidraw JSON/SVG pair.
6. Compose the required section roles plus only warranted optional roles in `canonical-report-v1` structured content.
7. Load `html-report-designer`; resolve paths from that loaded skill directory. Render and validate with its bundled scripts:

```bash
node "<html-report-designer-dir>/scripts/render-canonical-report.mjs" \
  docs/features/{feature}/design.document.json docs/features/{feature}/design.html
node "<html-report-designer-dir>/scripts/validate-html-report.mjs" \
  docs/features/{feature}/design.html
```

8. Update a topical ADR when the accepted decision meets the ADR gate.
9. Open the report for review when possible. Never patch generated HTML.
10. Stop before task creation, line-by-line patches, test commands, or execution evidence.

If a companion skill or renderer is unavailable, report the blocker. Do not create a fallback shell or diagram.

## Architecture slices

Use **architecture slice** only for an independently reviewable vertical outcome that helps sequencing, delegation, or approval. It starts from external need and observable proof, then pulls in only necessary entry, seam, policy/state, and dependency boundaries.

Do not call task briefs “slices,” create package/layer phases, or create task files inside this skill.

## Handoff

After explicit design approval, pass approved acceptance anchors, the chosen seam and ownership, invariants, accepted decisions, boundaries, proof expectations, and ADR links to `simple-tasks` when sequencing, delegation, looping, or resumption warrants task briefs. The approved design authorizes task drafting; only explicit user authorization makes a task `ready`. Do not create task files inside this skill.

## Quality gate

- Approved PRD source/report authority is current, validated, linked, and unchanged.
- Pressure, seam, ownership, state, causal path, proof, and boundary are explicit.
- Exactly one Excalidraw architecture diagram has JSON/SVG provenance and a walkthrough.
- Decisions expose credible alternatives, lifecycle, tradeoffs, owner, and approval.
- Product behavior was not invented or silently changed.
- Optional contracts, operations, interface consequences, traceability, and architecture slices earn their place.
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
