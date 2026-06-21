---
name: prd
description: "Create or update a feature PRD as a reviewable HTML product story with What, Why, How, workflows, and acceptance criteria. Triggers on: create a prd, write prd, prd.html, plan feature, requirements for, user stories, acceptance criteria."
---

# Product Requirements Document

Use this skill when a feature needs product intent clarified before design or implementation.

Default artifact:

```text
docs/features/{feature}/prd.html
```

A PRD is a product story about **what we want to build, why it matters, and how the requirements/workflows make the feature achieve the goal**.

Generate the PRD as a self-contained, reviewable HTML document. Use `html-report-designer` for the shell, accessibility, stable review anchors, and progressive motion.

Markdown PRDs are legacy/compatibility outputs. Do not create a Markdown PRD unless the user asks or the repo requires it.

## The job

1. Receive the feature idea or product request.
2. Read just enough repo/product context to avoid invented requirements.
3. Self-clarify the What / Why / How before writing.
4. Create or update `docs/features/{feature}/prd.html`.
5. Stop at product requirements. Do not design architecture, create tasks, or implement.

## Self-clarification

Before writing the PRD, answer these internally and use the answers to shape the document:

```text
What: What feature are we building, for whom, and what is explicitly in/out?
Why: What need, pain, or opportunity makes this worth doing now?
How: Which product requirements and user workflows will make the feature achieve the goal?
Acceptance: What observable results prove the workflows satisfy the need?
Open questions: What decisions still block design or implementation?
```

Default to self-clarifying from the request, existing docs, source context, and examples. Ask the user only when a missing answer changes scope, acceptance, legal/security/billing risk, or downstream design. Ask at most 3 blocking questions.

## PRD structure

Write the PRD as a narrative, not a dashboard. Prefer prose, bullets, cards, and concrete workflows over tables. Use tables only when comparison or traceability is the point.

Required sections:

```text
summary            # title, concise product story, status metadata, key takeaways
what               # what feature we are building, who it serves, and scope boundaries
why                # need, current pain, opportunity, and success signals
how                # requirements, user stories, product rules, and workflows
acceptance         # verifiable acceptance criteria tied to workflows
open-questions     # only unresolved decisions with owner/blocker state
ready-for-design   # readiness checklist and recommended next step
```

Optional content when useful:

```text
assumptions        # inferred facts the user should verify
deferred-stories   # adjacent behavior intentionally out of scope
constraints        # product-level constraints that do not fit the What/How prose
```

## Writing pattern

### Summary

Open with a short product story: what changes for the user, why it is valuable, and how reviewers should read the PRD. Keep status/date/type as compact metadata; do not add owner/outcome/next-action metric cards by default.

### What

Explain the feature in plain product language:

```text
We want to build {feature} so {actor/user} can {new capability} without {current friction}.
```

Include:

- primary users or jobs-to-be-done,
- 2-3 capabilities that describe the feature shape,
- in-scope behavior,
- out-of-scope/non-goals,
- product constraints that affect the user experience.

Do not prescribe files, classes, schemas, APIs, or rollout mechanics.

### Why

Explain the need and opportunity:

- current pain or missed opportunity,
- why this matters now,
- expected user/business outcome,
- success signals that show the need was met.

Avoid implementation mechanics unless they are product-visible.

### How

Explain how the feature achieves the goal through requirements and workflows.

Use a small set of numbered stories and rules:

```text
STORY-001 — {Capability}
As a {actor}, I want {capability}, so that {outcome}.

Rules:
- REQ-001: The system must {observable behavior}.
- REQ-002: When {condition}, the user sees/gets {observable result}.
```

Then add concrete workflows:

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

Use workflows to express behavior, not UI click scripts or implementation procedures.

### Acceptance

Acceptance criteria must be verifiable without guessing:

```text
AC-001: Given WF-001, the user can observe ...
AC-002: Given WF-002, the system shows/prevents/allows ...
AC-003: Quality checks pass and the PRD has no unresolved placeholders.
```

A simple checklist is usually better than a large matrix. Use a matrix only when many stories need traceability.

### Open questions

Only include questions that still need a decision. Each question should say owner and blocker state:

```text
Q-001: {question}
Owner: {person/team}
Blocks: design | task | none
Resolution path: {how to answer}
```

## Quality checklist

Before finishing, check:

- [ ] The PRD reads as a What / Why / How product story.
- [ ] What clearly explains the feature, users/jobs, scope, and non-goals.
- [ ] Why clearly explains the need, opportunity, and success signals.
- [ ] How connects stories, requirements, and workflows to the goal.
- [ ] Each story has actor, capability, and outcome.
- [ ] Requirements are observable and product-level.
- [ ] Workflows cover main behavior plus relevant edge/error/empty/permission behavior.
- [ ] Acceptance criteria are verifiable and tied to workflows.
- [ ] Open questions have owner and blocker state.
- [ ] No architecture or implementation details leaked into the PRD.
- [ ] `data-review-id` anchors are stable and unique.
- [ ] HTML validation passes when available.

## Smells to fix

- A PRD that reads like a table of facts instead of a product story.
- Vague verbs: “support”, “handle”, “manage”, “improve” without observable behavior.
- Subjective acceptance: “intuitive”, “robust”, “seamless”, “clean”.
- Loopholes: “if possible”, “as needed”, “where applicable”.
- Too many tables where prose would be clearer.
- Hidden assumptions presented as decisions.
- Architecture leakage: APIs, schemas, files, class names, storage mechanics, rollout details.
- Task lists or implementation steps inside the PRD.

## Handoff

After approval:

- use `design-solution` for architecture/design when needed,
- update ADRs only for durable architecture rationale,
- use `simple-tasks` for compact implementation task briefs,
- execute only ready tasks.

## Output

End with:

```text
PRD updated: docs/features/{feature}/prd.html {opened/reviewed | not opened + reason}
Status: {Draft | Review | Approved | Blocked}
Review anchors: {yes | no + reason}
Validation: {passed | not run + reason | failed + key issue}
Ready for design: {yes | no + blockers}
Next: {review prd.html | create design.html | create tasks | resolve questions}
```
