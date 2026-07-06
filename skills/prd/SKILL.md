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
6. When the feature is user-facing, offer 2-3 detailed wireframe/mockup options and mark the recommended/selected/pending direction.
7. Add explicit review gaps where the reviewer should choose UI, wording, flow, scope, or domain language during PRD review.
8. Name what is out of scope.
9. Write or update `docs/features/{feature}/prd.html`.
10. Cite sources and open questions.
11. Stop before architecture, tasks, or implementation.

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
- Review gaps must be explicit choice prompts with impact; do not hide them as assumptions.
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
ui-options         # 2-3 detailed wireframe/mockup directions plus step-by-step use and expected outcome per step
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
```

A good PRD wireframe is detailed enough that the reviewer can point at regions and say “make this the main panel” or “this action belongs in the right rail.” Prefer HTML/CSS or inline SVG wireframes with labelled regions over monospace sketches. Show layout, hierarchy, representative copy, primary/secondary actions, visible state changes, and the next decision. Under every UI option, add a short step-by-step usage flow where each step names the user action and the expected visible outcome. Do not choose libraries, components, schemas, or animation implementation here.

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
- [ ] User-facing changes include 2-3 detailed wireframe/mockup options or explain why only one is viable.
- [ ] Every UI option explains step-by-step use and expected outcome per step.
- [ ] Reviewer gaps are explicit, owned, and tied to design readiness.
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
- UI options that show a static screen but not how the user uses it or what outcome each step produces.
- UI options that leak implementation libraries/components instead of product-visible behavior.
- APIs, schemas, files, class names, storage mechanics, rollout steps, or task lists.

## Handoff

After PRD approval:

- use `design-solution` for architecture/design when needed,
- pass the selected PRD UI option, post-story flows, domain interactions, and unresolved review gaps into `design.html`,
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
Review gaps: {none | GAP-* pending + blocker state}
Ready for design: {yes | no + blockers}
Next: {review prd.html | choose UI option | create design.html | create tasks | resolve questions}
```
