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
3. Explain the feature in What / Why / How / Done.
4. Name what is out of scope.
5. Write or update `docs/features/{feature}/prd.html`.
6. Cite sources and open questions.
7. Stop before architecture, tasks, or implementation.

## Plain-language test

A smart 10-year-old should understand the first screen:

- **What:** What are we building, and for whom?
- **Why:** What problem or opportunity makes this worth doing?
- **How:** What will the user/system do differently?
- **Done:** What can we observe to prove it works?
- **Not now:** What are we explicitly not doing?

If a sentence does not help answer one of those questions, cut it or move it to a later design/task artifact.

## Source and scope rules

- Do not invent requirements, users, business rules, or acceptance behavior.
- If a missing answer changes scope, legal/security/billing risk, or design readiness, ask up to 3 blocking questions.
- If the gap is small and non-blocking, list it under assumptions or open questions.
- Keep implementation out: no files, classes, schemas, endpoints, migrations, rollout mechanics, or task steps unless they are product-visible constraints.
- End with a `Sources reviewed` note: paths, docs, screenshots, conversations, or “user request only”.

## PRD shape

Keep it concise. Default table count is zero.

```text
summary            # product story, status, 2-3 takeaways, sources reviewed
what               # feature, users/jobs, in scope, out of scope
why                # need, pain, opportunity, success signal
how                # 2-4 stories/rules plus one main workflow and key edge workflow
acceptance         # 3-6 observable criteria tied to workflows
open-questions     # only unresolved blockers with owner/status
ready-for-design   # yes/no checklist and next step
```

Optional sections only when useful:

```text
assumptions        # inferred facts to verify
deferred-stories   # adjacent behavior intentionally later
constraints        # product-level constraints that shape user behavior
```

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

### Simple product diagram

Include a tiny semantic diagram only if it makes the product idea easier to understand. Prefer 3-7 nodes with verb labels:

```text
User need → Product action → System response → Visible outcome
```

Use diagrams to explain meaning, not decoration.

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
- [ ] Requirements are observable product behavior.
- [ ] Acceptance criteria are verifiable and tied to workflows.
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
- APIs, schemas, files, class names, storage mechanics, rollout steps, or task lists.

## Handoff

After PRD approval:

- use `design-solution` for architecture/design when needed,
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
Ready for design: {yes | no + blockers}
Next: {review prd.html | create design.html | create tasks | resolve questions}
```
