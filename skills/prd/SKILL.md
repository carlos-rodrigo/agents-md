---
name: prd
description: "Create or update a direct, concise, evidence-backed product requirements document when a non-trivial feature's product intent, actor workflow, scope, decisions, or observable acceptance needs human review before architecture. Express stories as BDD specifications and include proposed mockups for UI changes or visual suggestions. Do not use for tiny obvious fixes, architecture, task planning, implementation, technical test plans, or document styling."
compatibility: "Requires the html-report-designer and system-diagram skills, plus frontend-design when the feature implies UI. Final reports use the bundled canonical renderer; diagrams use the bundled deterministic infrastructure SVG renderer."
---

# Product Requirements Document

Answer one product question:

> What product change are we building, why does it matter, how should it work end to end, and what observable result proves it?

Default artifacts:

```text
docs/features/{feature}/prd.document.json
docs/features/{feature}/prd.html
docs/features/{feature}/mockups.html   # required when the feature implies UI
```

`prd.document.json` is the editable product authority. `prd.html` is its deterministic review and approval projection. Never hand-author or patch report HTML/CSS. `mockups.html` is a linked, self-contained visual review artifact rather than canonical product truth.

## Gate

Skip a durable PRD for a tiny, obvious change whose user/system outcome, boundary, and acceptance are already explicit. Record the observable outcome in the task feedback loop instead.

Create or update a PRD when product behavior, scope, trust, workflow, wording, permissions, recovery, or acceptance needs durable review. Draft is the default for new or materially changed product truth.

## Authority and approval

Use authority in this order:

1. explicit human product-owner decisions;
2. current product behavior and durable product documentation;
3. supplied research, screenshots, analytics, support evidence, or logs;
4. labeled assumptions and open questions.

Do not invent users, emotion, urgency, business rules, roles, validation, limits, metrics, product language, or acceptance behavior.

Classify every consequential claim where the reviewer encounters it:

- **Sourced fact** — cite the durable artifact or observable current behavior; a human statement is evidence of what was said, not approval unless explicit.
- **Approved product truth** — name the approving human and durable approval source. Claim-level approval does not make the whole PRD Approved.
- **Proposed recommendation** — label it Proposed; it is not product truth.
- **Assumption** — label its impact and owner; make it blocking when an honest proposal depends on it.
- **Open question** — name the owner and resolve it through a real decision or report the PRD Blocked.

Use these category names verbatim; variants such as “Sourced behavior” or “Proposed visual direction” blur authority.

A top-level source list is not enough to turn a nearby Proposed recommendation into a Sourced fact or Approved product truth. Express local authority through existing block titles, fact terms, callouts, or inline source paths/dates; do not invent DocumentSpec fields. Label a block or adjacent claim group once—do not prefix every item with the same category. If a claim already has a field-owned home, attach its citation there instead of creating an authority-only duplicate. Never say research, evidence, or users established something without a reviewable source.

Status is a human governance contract:

- **Draft** — default; assumptions and unresolved decisions remain visible.
- **Review** — coherent enough for human judgment; not approved.
- **Approved** — only after explicit human approval recorded in `document.approval`.
- **Blocked** — missing product truth prevents an honest bounded proposal.

Report `Ready for design: yes` only when status is Approved and no blocking product decision remains. An exported browser decision record is review input, not approval or canonical truth.

## Approval brief first

The PRD is an approval brief, not a transcript of discovery. A reviewer should understand the proposal and the decisions needed without reading every traceability detail.

Open the report with this compact shape:

```text
Product: {what we are building for whom}
Why: {problem and consequence}
How it works: {one end-to-end actor-visible path}
Approve: {the few product choices, boundaries, and acceptance points that need judgment}
Not building: {nearest important exclusions}
```

Keep the approval brief to one short paragraph or five concise bullets. The mockup is the primary visual explanation for UI-bearing work; the PRD explains the behavior and approval boundaries around it, not every visual detail. Put detailed traceability, evidence, and exception rationale in their owning sections or collapsed review detail rather than repeating them in the introduction.

## Go to the point

Write for a reviewer who needs one clear, decision-ready product path:

- Lead with the answer: actor, change, outcome, boundary, then proof.
- State each fact once. Give every section new information instead of restating the summary, workflow, story, or acceptance.
- Default to one short block per non-slice role. Use `behavior` for cross-slice rules, BDD scenarios for interaction detail, `acceptance` for proof, and `scope` for boundaries—not recaps.
- Present one recommended product behavior. Do not brainstorm or list alternative approaches; use a decision block only for a real unresolved product choice.
- Optimize for approval density: one material statement per requirement, one main BDD scenario per slice, only material exceptions, and only decisions that change product behavior or approval status.
- Do not repeat a requirement's full path in product, behavior, slice, requirements, and scope. Each occurrence must add a distinct approval, transition, boundary, or proof fact.
- Do not use `table` blocks. Prefer short paragraphs, bullets, facts, and BDD scenarios that scan in reading order.
- Use concrete actors, actions, states, and outcomes. Remove throat-clearing, generic benefits, duplicated context, and implementation commentary.
- Keep only detail that changes product behavior, scope, trust, acceptance, or a decision.

Assign each statement one home: `product` owns the change and result; `problem` owns current evidence, friction, and consequence; `behavior` owns shared ordering and rules; scenarios own interaction behavior; the schema-required storyboard owns the smallest concrete state transition; acceptance owns independently testable pass/fail conditions; scope owns exclusions, assumptions, and provenance.

Before rendering, run a **Deduplication pass**. Reduce statements to `actor + trigger/action + state/result`, assign each tuple one field owner, and delete any block whose only addition is different wording or an authority label. In a one-slice PRD, `behavior` may order the path or state cross-scenario rules but must not replay the slice. Keep a repeated tuple only when the second field adds distinct ordering, transition, boundary, or independently testable acceptance information. Use one storyboard step for simple behavior; add steps only for distinct transition detail.

## Required report structure

Every substantive PRD uses these `section.role` values in a causal reading order. Headings may be feature-specific, but roles may not be omitted:

1. **`product`** — a required concise approval brief plus what the product is, the actor, job/moment, bounded capability, entry point, and resulting state.
2. **`problem`** — why we want to build it: current behavior, friction, consequence, and evidence.
3. **`behavior`** — how the product should work end to end and the outcome-protecting product rules.
4. **`diagram`** — one evidence-backed product-behavior diagram.
5. **`slices`** — one or more complete end-to-end product slices expressed in BDD.
6. **`requirements`** — a coherence walkthrough proving that the requirements fit together and do not collide.
7. **`scope`** — in-scope outcome, adjacent non-goals, assumptions, and sources/boundary.
8. **`decisions`** — include only when a real product choice is open, proposed, or accepted.

Open with one direct product statement:

```text
For {actor} who needs to {job} during {moment}, the product will {capability}
through {entry point}, resulting in {observable state}; it will not {boundary}.
```

## Requirement coherence walkthrough

The `approval` block in the `product` section is the primary review surface; the `requirements` section is the product-specification stress test. Walk every stable requirement, BDD scenario, acceptance criterion, user story, invariant, or explicit product constraint through its satisfying product path, dependencies, interactions, collision check, resolution, and observable proof. Use stable `req-###` IDs and structured `requirement` blocks. Load [references/requirement-coherence.md](references/requirement-coherence.md) when composing or reviewing this section.

This is product-level, not architecture. If requirements collide around permissions, states, timing, ordering, terminology, boundaries, recovery, or acceptance, mark the affected requirement unresolved or blocked, name the product owner, explain the consequences, and request input. Never silently choose, weaken, duplicate, or invent a rule.

Before claiming coherence, run a **Scope-to-proof inventory** and a **Decision-propagation pass** from [references/semantic-audit.md](references/semantic-audit.md). A syntactically valid scenario or cited acceptance ID is not semantic proof that the requirement is satisfied. Compare the latest review sidecar with canonical decisions and propagate any mismatch through every dependent slice, requirement, scope claim, mockup, and diagram. For substantive multi-slice work, require an independent adversarial review before Review and after material decision reconciliation.

## Product slices

A product slice is an ordered, end-to-end increment of user or stakeholder value—not a component, endpoint, package, implementation layer, or task.

Explain each slice as a **BDD specification**, not as repetitive “As a / I want / so that” prose. Use:

```text
Feature: {bounded actor outcome}
Scenario: {observable behavior}
Given {starting state}
When {actor action or trigger}
Then {observable result}
```

The required `story` object is compact traceability metadata; the BDD scenarios explain behavior. Write `actor` as a noun phrase beginning with a lowercase common noun or determiner, `capability` as a base-form verb phrase beginning lowercase without leading `can` or `to`, and `outcome` as a complete result clause beginning lowercase without leading `so that`. Preserve proper names and acronyms within each fragment and omit terminal punctuation so the renderer produces a natural Feature line. Include only material exception scenarios, the smallest required visual/non-visual sequence, stable acceptance criteria, and a brief “After this slice” outcome. Load [references/product-slice-contract.md](references/product-slice-contract.md) when composing slices.

Let sourced behavior determine the number of workflow steps, rules, scenarios, and acceptance criteria. Never invent content to meet a fixed count or repeat the same outcome across fields.

## Product-behavior diagram

Every substantive PRD must invoke `system-diagram` after stating the exact product question the figure answers. The PRD owns source- and authority-classified product semantics, applicability, question, and placement. `system-diagram` validates evidence and owns the infrastructure SVG visual encoding, accessibility, and internal reading order.

The diagram should teach:

```text
actor/context → trigger/action → product response/state → next decision → outcome or recovery
```

Do not use the required diagram as a responsive wireframe, page composition, site map, component inventory, or duplicate mockup. Its question must remain meaningful without screen width, navigation placement, cards, typography, or visual styling. If viewport or layout detail disappears and the causal product meaning remains, that detail belongs in `mockups.html`, not the diagram. Show the normal path and only material branch, failure, or recovery states; the walkthrough explains causal transitions instead of repeating section prose.

It must not introduce architecture. Choose the smallest System Diagram capability from the product question: use sequence only for participant communication in temporal order; use flow for causal progression, decisions, state, and recovery; do not request architecture view or component decomposition from product truth. Retain the selected System Diagram source beside the feature, generate the SVG through the bundled renderer, and reference both from the `diagram` block. Existing graph questions use `system-diagram-v1`; temporal sequence uses the approved `system-diagram-v2` sequence contract. A durable substantive PRD does not use a hand-authored SVG or a `Diagram not applicable` escape.

## UI mockups

When a feature adds or materially changes a user-visible interface, or the request includes UI changes or visual suggestions, the PRD workflow must invoke `frontend-design` and generate proposed high-fidelity mockups before review. Mockups make hierarchy, responsive composition, affordances, and consequential states concrete enough for product judgment; wireframes alone do not satisfy this requirement.

Create `docs/features/{feature}/mockups.html` as a portable, self-contained artifact and link it from `document.relatedArtifacts`. The canonical PRD profile still contains exactly one infrastructure-style product-behavior diagram; do not add extra `diagram` blocks for mockups.

Mockups must:

- represent the proposed product behavior and information hierarchy without adding unsupported capability;
- include representative wide and narrow compositions when the surface is responsive;
- show the main populated state plus material empty, loading, error, permission, partial, or recovery states only where they change trust, scope, or acceptance;
- use clearly labeled illustrative data when real evidence is unavailable and never present mock values as product truth;
- preserve accessibility fundamentals, including readable contrast, keyboard-visible controls, non-color meaning, and reduced-motion behavior;
- carry an explicit **Proposed / not approved** boundary until the human product owner accepts the visual direction;
- remain review material rather than silently turning styling, layout, or invented content into approved requirements.

If the feature has no user-visible UI implication, do not generate a mockup shell. Report `Mockups: not applicable — {reason}` in the handoff.

## Decisions

Include a canonical `decision` block only when an explicit request or evidence establishes a real product choice whose options materially change actor-visible behavior, trust, scope, or acceptance. Preserve accepted decisions as durable product authority; use open or proposed status only while the choice remains unresolved. An agent noticing several possible layouts or visual concepts does not create a product decision or competing mockups. Produce one evidence-backed proposed mockup and defer competing concepts to later design review. If a human explicitly frames a material product choice, the decision block owns its options while the mockup illustrates only the recommended or selected direction.

This is the only place alternative approaches belong. Every option must be grounded in supplied evidence, current product truth, or a human-framed choice; do not invent options to populate the recorder. If the question is real but grounded options are unavailable, ask the owner or report the PRD Blocked instead. If one sourced behavior is already the only honest recommendation and no accepted decision records it, omit the decision section. Each retained decision has a stable ID, `open | proposed | accepted` status, at least two real options plus the renderer's custom option, owner, blocker state, selected direction when known, and rationale.

Every rendered decision includes a **Decision recorded** checkbox. Recording requires a selection, rationale, and owner. In standalone viewing it persists locally and exports Markdown; in Pi HTML review, selected or confirmed typed feedback is atomically upserted by stable decision ID into the same `.review.md` channel as comments, including the source fingerprint. Treat either form as review input—not approval—and reconcile it into `prd.document.json` only after explicit human approval. Accepted decisions require approver and approval date; Approved PRDs cannot contain open or proposed decisions.

## Process

1. Inspect the request, current product surface, and smallest evidence set needed to avoid guessing.
2. Separate blocking product questions, non-blocking assumptions, and technical questions. Ask only questions that materially change product truth; defer technical questions to design.
3. Compose the required section roles, one concise `approval` block in the `product` section, complete BDD product slices, and the requirement coherence walkthrough in `canonical-report-v1` structured content.
4. Stress the requirements against each other. Resolve conflicts only from explicit product authority; otherwise mark the PRD Blocked and request owner input.
5. Run the semantic audit, including Decision-propagation pass, Scope-to-proof inventory, vocabulary/state, permission, financial-invariant, semantic proof, and collision checks. Then run the portable structural companion (requires sibling `html-report-designer`; a structural pass is not semantic approval):

```bash
node "<prd-skill-dir>/scripts/audit-prd-traceability.mjs" \
  docs/features/{feature}/prd.document.json
```

6. Invoke `system-diagram`, retain its JSON/SVG pair, and reference it from the diagram block.
7. When the feature implies UI changes or visual suggestions, load `frontend-design`, generate `mockups.html`, label it proposed, and link it from `document.relatedArtifacts`.
8. Load `html-report-designer`; resolve paths from that loaded skill directory. Render and validate with its bundled scripts:

```bash
node "<html-report-designer-dir>/scripts/render-canonical-report.mjs" \
  docs/features/{feature}/prd.document.json docs/features/{feature}/prd.html
node "<html-report-designer-dir>/scripts/validate-html-report.mjs" \
  docs/features/{feature}/prd.html
```

9. Open the PRD and, when present, the mockups through Pi's HTML reviewer. The audit accepts an optional second argument: `node "<prd-skill-dir>/scripts/audit-prd-traceability.mjs" path/to/prd.document.json path/to/prd.review.md`. Read both inline comments and selected or confirmed decision feedback from the generated sidecars. Before changing canonical source, rerun the structural audit with the sidecar so anchors, selections, and source fingerprints are checked against the reviewed version. Reconcile approved input into source, then rerun the one-argument audit, rerender, and repeat independent adversarial review when meaning changed; the prior sidecar is historical once its source fingerprint is stale. Confirm the diagram still teaches behavior when viewed without the mockup. Never patch generated HTML; update the canonical document source and rerender.
10. Stop before architecture, APIs, schemas, tasks, rollout mechanics, or implementation commands.

If any required companion skill or renderer is unavailable, report the blocker. Do not create a fallback shell, mockup, or diagram.

## Quality gate

- The required product approval brief is the first review surface and answers Product, Why, How it works, Approve, and Not building in five concise fields.
- Detailed traceability is secondary/collapsed review material; it does not compete with the approval brief.
- Product, problem, workflow, diagram, slices, requirements, and scope roles are direct, concise, and non-duplicative.
- Every consequential claim has local authority as Sourced fact, Approved product truth, Proposed recommendation, Assumption, or Open question; the source list alone does not imply authority.
- Every slice traces `slice → story → BDD scenario → acceptance`, uses Feature/Scenario/Given/When/Then with grammatical story fragments, follows one deterministic path per scenario, and ends in an observable outcome.
- The Scope-to-proof inventory covers every in-scope capability, role, state, invariant, localization promise, and consequential boundary.
- The `requirements` walkthrough covers every requirement and demonstrates compatible product paths, dependencies, interactions, and semantic proof—not merely valid referenced IDs.
- Decision propagation reconciles canonical source with the latest review sidecar and marks every unresolved dependent claim conditional or blocked.
- Contradictory requirements are explicitly blocked or escalated to a named product owner; the PRD never silently resolves them.
- An independent adversarial review reports no identified hidden collision or false `covered` claim before the document enters Review.
- No tables, speculative alternatives, repeated summaries, redundant scenario/step/acceptance claims, or classic As/I want story prose appear.
- Failure, recovery, empty, and permission behavior appears only where it changes trust or scope.
- One infrastructure-style product diagram has version-matching JSON/SVG provenance (`system-diagram-v1` graph or `system-diagram-v2` sequence), a text walkthrough, and a causal question independent of viewport or page composition.
- UI-bearing features include a linked, self-contained proposed mockup artifact with representative responsive and consequential states; non-UI features state why mockups are not applicable.
- Mockups contain no unsupported capability, clearly identify illustrative data, and preserve the human approval boundary.
- Decisions have explicit lifecycle and human approval boundaries.
- No architecture or implementation prescription leaked in.
- Canonical renderer, PRD profile validation, accessibility, mobile, print, no-JS, and reduced-motion checks pass.

## Handoff

After explicit PRD approval, pass approved behavior, slices, acceptance, product-visible constraints, accepted decisions, and boundaries to `design-solution`. Do not create tasks directly from the PRD.

## Output

```text
PRD source/report: {document.json path} · {html path}
Status: {Draft | Review | Approved by whom/when | Blocked}
Product: {what it is and the bounded outcome for the actor}
Why: {problem and evidence}
How: {end-to-end product behavior, not architecture}
Requirements: {coherent and covered | blocked by requirement conflict}
Decisions: {IDs + lifecycle status | none}
Diagram: {question + JSON/SVG paths}
Mockups: {linked mockups.html + Proposed/Accepted status | not applicable + reason}
Validation: {passed | failed + issue | not run + reason}
Ready for design: {yes only when explicitly Approved/no blocker | no + reason}
Next: {review | resolve decision | create design}
```
