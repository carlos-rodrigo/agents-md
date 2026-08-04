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

## Go to the point

Write for a reviewer who needs one clear, decision-ready product path:

- Lead with the answer: actor, change, outcome, boundary, then proof.
- State each fact once. Give every section new information instead of restating the summary, workflow, story, or acceptance.
- Default to one short block per non-slice role. Use `behavior` for cross-slice rules, BDD scenarios for interaction detail, `acceptance` for proof, and `scope` for boundaries—not recaps.
- Present one recommended product behavior. Do not brainstorm or list alternative approaches; use a decision block only for a real unresolved product choice.
- Do not use `table` blocks. Prefer short paragraphs, bullets, facts, and BDD scenarios that scan in reading order.
- Use concrete actors, actions, states, and outcomes. Remove throat-clearing, generic benefits, duplicated context, and implementation commentary.
- Keep only detail that changes product behavior, scope, trust, acceptance, or a decision.

Assign each statement one home: `product` owns the change and result; `problem` owns current evidence, friction, and consequence; `behavior` owns shared ordering and rules; scenarios own interaction behavior; the schema-required storyboard owns the smallest concrete state transition; acceptance owns independently testable pass/fail conditions; scope owns exclusions, assumptions, and provenance.

Before rendering, run a **Deduplication pass**. Reduce statements to `actor + trigger/action + state/result`, assign each tuple one field owner, and delete any block whose only addition is different wording or an authority label. In a one-slice PRD, `behavior` may order the path or state cross-scenario rules but must not replay the slice. Keep a repeated tuple only when the second field adds distinct ordering, transition, boundary, or independently testable acceptance information. Use one storyboard step for simple behavior; add steps only for distinct transition detail.

## Required report structure

Every substantive PRD uses these `section.role` values in a causal reading order. Headings may be feature-specific, but roles may not be omitted:

1. **`product`** — actor, job/moment, bounded capability, entry point, resulting state.
2. **`problem`** — current behavior, friction, consequence, and evidence.
3. **`behavior`** — canonical end-to-end workflow and outcome-protecting product rules.
4. **`diagram`** — one evidence-backed product-behavior diagram.
5. **`slices`** — one or more complete end-to-end product slices.
6. **`scope`** — in-scope outcome, adjacent non-goals, assumptions, and sources/boundary.
7. **`decisions`** — include only when a real product choice is open, proposed, or accepted.

Open with one direct product statement:

```text
For {actor} who needs to {job} during {moment}, the product will {capability}
through {entry point}, resulting in {observable state}; it will not {boundary}.
```

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

Every rendered decision includes a **Decision recorded** checkbox. Recording in the browser requires a selection, rationale, and owner, persists locally, and exports Markdown. Reconcile that export into `prd.document.json` only after explicit human approval. Accepted decisions require approver and approval date; Approved PRDs cannot contain open or proposed decisions.

## Process

1. Inspect the request, current product surface, and smallest evidence set needed to avoid guessing.
2. Separate blocking product questions, non-blocking assumptions, and technical questions. Ask only questions that materially change product truth; defer technical questions to design.
3. Compose the required section roles and complete product slices in `canonical-report-v1` structured content.
4. Invoke `system-diagram`, retain its JSON/SVG pair, and reference it from the diagram block.
5. When the feature implies UI changes or visual suggestions, load `frontend-design`, generate `mockups.html`, label it proposed, and link it from `document.relatedArtifacts`.
6. Load `html-report-designer`; resolve paths from that loaded skill directory. Render and validate with its bundled scripts:

```bash
node "<html-report-designer-dir>/scripts/render-canonical-report.mjs" \
  docs/features/{feature}/prd.document.json docs/features/{feature}/prd.html
node "<html-report-designer-dir>/scripts/validate-html-report.mjs" \
  docs/features/{feature}/prd.html
```

7. Open the PRD and, when present, the mockups for review. Confirm the diagram still teaches behavior when viewed without the mockup. Never patch generated HTML; update the canonical document source and rerender.
8. Stop before architecture, APIs, schemas, tasks, rollout mechanics, or implementation commands.

If any required companion skill or renderer is unavailable, report the blocker. Do not create a fallback shell, mockup, or diagram.

## Quality gate

- Product, problem, workflow, diagram, slices, and scope roles are direct, concise, and non-duplicative.
- Every consequential claim has local authority as Sourced fact, Approved product truth, Proposed recommendation, Assumption, or Open question; the source list alone does not imply authority.
- Every slice traces `slice → story → BDD scenario → acceptance`, uses Feature/Scenario/Given/When/Then with grammatical story fragments, and ends in an observable outcome.
- No tables, speculative alternatives, repeated summaries, redundant scenario/step/acceptance claims, or classic As/I want story prose appear.
- Failure, recovery, empty, and permission behavior appears only where it changes trust or scope.
- One infrastructure-style product diagram has `system-diagram-v1` JSON/SVG provenance, a text walkthrough, and a causal question independent of viewport or page composition.
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
Product: {bounded outcome for actor}
Decisions: {IDs + lifecycle status | none}
Diagram: {question + JSON/SVG paths}
Mockups: {linked mockups.html + Proposed/Accepted status | not applicable + reason}
Validation: {passed | failed + issue | not run + reason}
Ready for design: {yes only when explicitly Approved/no blocker | no + reason}
Next: {review | resolve decision | create design}
```
