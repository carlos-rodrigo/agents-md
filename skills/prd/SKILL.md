---
name: prd
description: "Create or update a concise feature PRD as a reviewable HTML What/Why/How product brief. Use before design or implementation when product intent, scope, workflows, or acceptance behavior are unclear. Do not use for task-level test plans; use feedback-loop for implementation verification. Triggers on: create a prd, write prd, prd.html, product requirements, plan feature."
---

# Product Requirements Document

Use this skill to answer one product question:

> What are we making, why does it matter, how will people use it, and how do we know it works?

Default artifact:

```text
docs/features/{feature}/prd.html
```

Generate a self-contained, reviewable HTML brief. Use `html-report-designer` for the HTML shell, accessibility, stable review anchors, and validation. Markdown PRDs are legacy; create one only when the user or repo asks.

## In one minute

1. Understand the request.
2. Read just enough product/repo context to avoid guessing.
3. Explain the feature in What / Why / How / Experience / Done.
4. For every story, show the user's post-story flow: entry → action → visible response → next decision.
5. Map how the domain entities/concepts interact: source entity → action/verb → target entity/state/effect. If there is no meaningful domain model, include an explicit “not applicable” note.
6. For user-facing work, inspect the existing product UI before drawing: shell, navigation, page hierarchy, density, controls, states, and responsive behavior. Record the evidence.
7. Name the visual decision to unlock and check whether existing mockups already suffice. Only when more evidence is needed, offer 2-3 detailed options and mark the recommended/selected/pending direction. Existing UI options continue the product and vary placement/workflow—not style; greenfield options define the missing shell and interaction details explicitly.
8. Add explicit review gaps where the reviewer should choose UI, wording, flow, scope, or domain language during PRD review; every review gap and open question must include a visible option selector with at least one free-text option for reviewer-supplied answers.
9. Name what is out of scope.
10. Write or update `docs/features/{feature}/prd.html`.
11. Cite sources and open questions.
12. Stop before architecture, tasks, or implementation.

## Plain-language test

A smart 10-year-old should understand the first screen:

- **What:** What are we building, and for whom?
- **Why:** What problem or opportunity makes this worth doing?
- **How:** What will the user/system do differently?
- **Flow:** After each story, what does the user see, do next, and decide?
- **Domain:** What real-world things/entities exist, how do they interact, and what changes after each action?
- **Look:** Which 2-3 UI directions could this take, and what should the reviewer choose?
- **Done:** What can we observe to prove it works?
- **Not now:** What are we explicitly not doing?

If a sentence does not help answer one of those questions, cut it or move it to a later design/task artifact.

## Source and scope rules

- Do not invent requirements, users, business rules, or acceptance behavior.
- If a missing answer changes scope, legal/security/billing risk, or design readiness, ask up to 3 blocking questions.
- If the gap is small and non-blocking, list it under assumptions or open questions.
- Keep implementation out: no files, classes, schemas, endpoints, migrations, rollout mechanics, or task steps unless they are product-visible constraints.
- UI options are product-visible wireframes and interaction choices, not library/component/animation implementation decisions.
- Treat an existing product UI as evidence and a product constraint. Inspect real screens or source-backed visible patterns before drawing. Preserve its shell, navigation, visual language, density, control shapes, and state patterns unless redesign is explicitly in scope.
- When an existing UI exists, options should compare where/how the feature fits—entry point, page versus dialog, information hierarchy, or workflow—not present unrelated visual systems.
- When no existing UI exists, make options more detailed: define global shell/navigation, page hierarchy, responsive behavior, form/control language, primary/secondary actions, and representative loading/empty/error/success states.
- Add a stable `ui-options.existing-ui-evidence` review anchor stating which UI sources were inspected, what must continue, and whether the product has no established UI yet.
- Review gaps must be explicit choice prompts with impact; do not hide them as assumptions.
- Each review gap and open question must include a reviewer option selector: provide concrete choices when known, and always include a free-text “Other / custom answer” option. For HTML PRDs, mark the anchored gap/card with `data-review-decision="single-choice"` and use enabled named radio inputs so checked decisions are exported as review feedback.
- Domain interaction content is product language, not architecture: name domain entities/concepts, user-visible actions, state/effect outcomes, ownership/authority, and unresolved vocabulary or policy gaps without naming schemas, classes, or endpoints.
- End with a `Sources reviewed` note: paths, docs, screenshots, conversations, or “user request only”.

## PRD shape

Keep it concise. Default table count is zero.

```text
summary            # product story, status, 2-3 takeaways, sources reviewed
what               # feature, users/jobs, in scope, out of scope
why                # need, pain, opportunity, success signal
how                # 2-4 stories/rules plus one main workflow and key edge workflow
user-flows         # after every story: entry, action, visible response, next user decision
domain-interactions # entities/concepts, verbs, state/effect outcomes, ownership, and unresolved vocabulary/policy gaps
ui-options         # existing-UI evidence + 2-3 continuity-preserving placement/workflow options; if no UI exists, detailed foundational directions
review-gaps        # choices the reviewer should make now: UI, wording, flow, scope, domain language, or open product gap
acceptance         # 3-6 observable criteria tied to workflows and visible UI/state outcomes
open-questions     # only unresolved blockers with owner/status
ready-for-design   # yes/no checklist and next step
```

Optional sections only when useful:

```text
assumptions        # inferred facts to verify
deferred-stories   # adjacent behavior intentionally later
constraints        # product-level constraints that shape user behavior
```

If the change is not user-facing, keep `user-flows` and `ui-options` short and state why UI choice is not applicable.

## Writing pattern

### Summary

Open with one paragraph:

```text
We want to build {feature} so {user/job} can {new capability} without {current friction}.
```

Then add 2-3 takeaways reviewers should approve or challenge.

### What

Use bullets for:

- primary users/jobs,
- 2-3 capabilities,
- in-scope behavior,
- out-of-scope behavior,
- product constraints that affect user experience.

### Why

Use at most 3 bullets:

- current pain or missed opportunity,
- why now,
- expected outcome or success signal.

Avoid generic business-value filler.

### How

Use a few product stories and observable rules:

```text
STORY-001 — {Capability}
As a {actor}, I want {capability}, so that {outcome}.

Rules:
- REQ-001: The system must {observable behavior}.
- REQ-002: When {condition}, the user sees/gets {observable result}.
```

Then include the smallest workflows that prove behavior:

```text
WF-001 Main workflow
Given ...
When ...
Then ...

WF-002 Edge/error/empty/permission workflow
Given ...
When ...
Then ...
```

### Post-story user flows

Every story gets a concrete after-state so reviewers can picture the feature instead of only reading requirements:

```text
FLOW-001 — After STORY-001
Entry: The user starts from {screen/state/context}.
Action: The user {does the visible thing}.
System response: The product shows {new state, confirmation, empty/error/loading state}.
Next user decision: The user can now {continue, choose, recover, undo, inspect, share}.
Gaps to review: {copy/layout/state choice that needs reviewer input, or “none”}.
```

Prefer 3-5 steps per flow. Include empty/loading/error/permission flow only when it changes user trust or design readiness.

### Domain entity interactions

Every PRD with meaningful domain behavior must include a compact interaction map before UI options. It should answer “what real-world things change other real-world things?” without leaking implementation.

Use cards or a small semantic diagram with 3-7 entities/concepts. Label relationships with verbs, not vague nouns:

```text
DOMAIN-INT-001 — {interaction name}
Source entity/concept: {who/what starts or owns the action}
Action / verb: {creates | updates | consumes | transfers | schedules | reconciles | blocks | approves}
Target entity/state/effect: {what changes and how the user can observe it}
Rules / authority: {business rule, ownership, permission, or source of truth}
Open vocabulary/policy gap: {term, state, or rule reviewers must approve, or “none”}
```

Good PRD domain interactions stay product-visible: “Campaign event consumes input inventory and creates cost impact” is OK; “EventService writes `event_effects` rows” belongs in design.

If the feature is content-only or has no meaningful domain entities, include a short `Domain interactions: not applicable` card with the reason so the omission is reviewable.

### UI options, wireframes, and review gaps

Start with an **existing UI continuity check**:

```text
Existing UI: {yes | no}
Evidence inspected: {screenshots, routes, visible source paths, design system docs}
Must continue: {shell, navigation, hierarchy, density, color/control/state patterns}
Option differences: {placement, entry point, page/dialog, hierarchy, workflow}
```

If the answer is **yes**, reproduce the recognizable product shell in every wireframe and vary only the product choice under review. Do not turn each option into a different redesign. If the answer is **no**, each wireframe must carry enough detail to establish the shell and interaction system instead of showing isolated floating cards.

Apply a **mockup decision gate** before drawing or redrawing:

1. Name the next unresolved product decision the mockup must unlock.
2. Check whether current screenshots/wireframes already make that decision reviewable.
3. Create nothing when existing evidence is sufficient; do not redraw UI just because a new artifact format is available.
4. Mock up only alternatives that change visible placement, hierarchy, entry point, page/dialog choice, or recovery flow. Text selectors are enough for non-visual policy choices.
5. If a compact comparison is still needed, prefer one shared-shell Excalidraw scene that shows only the option deltas and one common interaction path. Keep detailed states in the existing wireframes instead of duplicating them.

Excalidraw is valid for product UI mockups when it preserves the existing UI faithfully. Use one base shell, clone it for alternatives, keep labels searchable and reviewable, and render with the build-time Excalidraw renderer. It is not a reason to replace sufficient HTML/CSS wireframes or invent a sketch-style redesign.

Option cards and reviewer selectors are one contract: selector labels must use the same option names and ordering as the mockups, and each selectable option should reference its option card with a stable anchor.

When the feature changes a screen, command UI, TUI, document, or visible workflow, include 2-3 options as real wireframes, not text-only cards:

```text
UI-OPTION-A — {plain-language direction}
Best for: {user need / review goal}.
Wireframe: {screen-sized sketch with header/nav/content/detail panels, important controls, empty/loading/error/success states, and sample copy}.
Step-by-step use:
  1. User does {first action}. Outcome: {visible product result}.
  2. User does {second action}. Outcome: {visible product result}.
  3. User decides {continue/edit/compare/save}. Outcome: {state, confidence, or next workflow}.
Tradeoff: {what gets easier and what gets harder}.
Decision: {recommended | selected | rejected | needs reviewer choice}.

GAP-001 — {choice needed}
Question: Should the user see {option/wording/flow A} or {B}?
Impact: This changes {story/acceptance/design readiness}.
Owner/status: {reviewer | product | blocked/non-blocking}.
Reviewer options:
  - [ ] {Option A label}: {what selecting it means}
  - [ ] {Option B label}: {what selecting it means}
  - [ ] Other / custom answer: __________________
```

Open questions use the same selector shape. If the only responsible answer is reviewer-authored, still render one free-text option instead of plain paragraph text.

A good PRD wireframe is detailed enough that the reviewer can point at regions and say “put this action on the existing page” or “this deserves a dedicated page.” When the product already has a UI, use its real shell and visible conventions rather than generic header/nav/inspector scaffolding. Prefer HTML/CSS or inline SVG wireframes with labelled regions over monospace sketches. Show layout, hierarchy, representative copy, primary/secondary actions, visible state changes, and the next decision. Under every UI option, add a short step-by-step usage flow where each step names the user action and the expected visible outcome. Do not choose libraries, components, schemas, or animation implementation here.

### Simple product diagram

Include a tiny semantic diagram or storyboard only if it makes the product idea easier to understand. Prefer 3-7 nodes with verb labels:

```text
User need → Product action → System response → Visible outcome → Next choice
```

Use diagrams to explain meaning, not decoration. For HTML diagrams, reveal nodes/paths in reading order so the diagram teaches the flow rather than appearing all at once.

### Acceptance

Make acceptance criteria observable:

```text
AC-001: Given WF-001, the user can observe ...
AC-002: Given WF-002, the system prevents/allows/shows ...
AC-003: The PRD has no unresolved placeholders and is ready for design.
```

## Quality checklist

Before finishing:

- [ ] The PRD is a What / Why / How / Done product story.
- [ ] A non-engineer can understand the summary and workflow.
- [ ] Every story has a visible post-story flow or an explicit “not user-facing” note.
- [ ] Domain entities/concepts and their interactions are mapped, or a clear “not applicable” rationale is present.
- [ ] Existing UI evidence is anchored and names what every option must preserve, or explicitly states that no UI exists yet.
- [ ] The mockup gate names the next visual decision and says whether new mockups are actually needed.
- [ ] Existing sufficient mockups are reused rather than redrawn in another format.
- [ ] User-facing changes include 2-3 detailed wireframe/mockup options or explain why only one is viable.
- [ ] When a product UI exists, every option visibly continues it and differs by placement/workflow rather than visual style.
- [ ] When no product UI exists, options define the shell, responsive hierarchy, controls, and key states in enough detail to guide design.
- [ ] Every UI option explains step-by-step use and expected outcome per step.
- [ ] UI option names/order match the reviewer selector and selectable options link to stable option anchors.
- [ ] Reviewer gaps are explicit, owned, tied to design readiness, and include option selectors with a free-text option.
- [ ] Open questions that need reviewer input include option selectors with a free-text option.
- [ ] Requirements are observable product behavior.
- [ ] Acceptance criteria are verifiable and tied to workflows/UI states.
- [ ] Sources reviewed are named.
- [ ] Open questions have owner and blocker state.
- [ ] No architecture, task, or implementation details leaked in.
- [ ] Tables are absent unless a true traceability matrix is needed.
- [ ] `data-review-id` anchors are stable and unique.
- [ ] HTML validation passes when available.

## Smells to fix

- Repeating the same idea in summary, scope, stories, workflows, and acceptance.
- Vague verbs: “support”, “handle”, “manage”, “improve” without observable behavior.
- Subjective acceptance: “intuitive”, “robust”, “seamless”, “clean”.
- Loopholes: “if possible”, “as needed”, “where applicable”.
- Hidden assumptions presented as decisions.
- Tables where a sentence, card, or checklist would be clearer.
- Stories that end at “system does X” without explaining what the user sees next.
- Domain sections that list nouns/entities but do not show action verbs, state/effect changes, ownership, or unresolved vocabulary/policy choices.
- Only one hidden UI direction when the reviewer needs to choose between plausible flows.
- Mockups that are decorative, text-only, or too abstract to show layout, states, copy, hierarchy, primary actions, or next action.
- Generic mockups that ignore an existing product shell or make each option look like a different application.
- Redrawing already-sufficient mockups in Excalidraw without a new decision to unlock.
- Full-screen alternative mockups for a non-visual policy decision.
- Selector labels that no longer match the option cards they approve.
- Isolated cards presented as a complete UI when no existing shell has been defined.
- UI options that show a static screen but not how the user uses it or what outcome each step produces.
- UI options that leak implementation libraries/components instead of product-visible behavior.
- APIs, schemas, files, class names, storage mechanics, rollout steps, or task lists.

## Handoff

After PRD approval:

- use `design-solution` for architecture/design when needed,
- pass the approved PRD UI option, post-story flows, domain interactions, and resolved decision record into `design.html`; do not carry blocking product gaps into design,
- do not let design choose a product UI direction that the PRD left unresolved unless the user approves it,
- use `simple-tasks` for implementation task briefs when splitting/delegating is useful,
- use `feedback-loop` for task-level verification,
- update ADRs only for durable architecture rationale.

## Output

End with:

```text
PRD updated: docs/features/{feature}/prd.html {opened/reviewed | not opened + reason}
Status: {Draft | Review | Approved | Blocked}
Sources reviewed: {paths/docs/chat | user request only}
Review anchors: {yes | no + reason}
Validation: {passed | not run + reason | failed + key issue}
Domain interactions: {mapped | not applicable + reason | blocked + gap IDs}
UI options: {selected/recommended option | pending reviewer choice | not user-facing}
Mockup gate: {existing evidence sufficient | smallest additional artifact + decision unlocked | not applicable}
Review gaps: {none | GAP-* pending + blocker state}
Ready for design: {yes | no + blockers}
Next: {review prd.html | choose UI option | create design.html | create tasks | resolve questions}
```
