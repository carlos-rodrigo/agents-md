---
name: prd
description: "Frame a feature strategy packet and PRD with BDD-style requirements. Triggers on: create a prd, write prd, plan feature, requirements for, feature strategy, user stories."
---

# Feature Strategy / PRD Compatibility

Use this skill to help the user own the product/system strategy before implementation.

Default to the new feature-flow source of truth:

```text
docs/features/{feature}/strategy.md
```

Create a classic `prd.md` only when the user explicitly asks for a PRD or an external stakeholder/process needs that artifact.

Keep the layers distinct:

| Layer | Artifact | Owns | Does not own |
| --- | --- | --- | --- |
| Product strategy | `strategy.md` | why this matters, wedge, outcomes, boundaries | detailed requirements or implementation |
| Product definition | `prd.md` | what product experience/capability we will build, BDD requirements, acceptance criteria | code structure or low-level implementation design |
| High-level system design | `system-model.md` | stack/architecture shape, principal workflows, system boundaries, invariants, major tradeoffs | task-level implementation details |
| Proof | `proof.md` | how PRD requirements and system risks will be verified | new requirements or design decisions |
| Execution | `.features/.../tasks/*.md` | one vertical slice, low-level design, local decisions, feedback loop, code anchors | product strategy or broad architecture |

Default artifact flow:

```text
raw idea
→ strategy.md
→ prd.md with BDD-style requirements/user stories
→ system-model.md + decisions.md for high-level architecture/workflows
→ proof.md mapped to PRD requirements and system risks
→ .features/{feature}/tasks/*.md with task-level design + feedback loop
```

Avoid a separate specs layer by default. Create standalone specs/contracts only when an external API/schema/protocol, cross-team handoff, or compliance process needs a stable contract outside the PRD and Work Orders.

## First decide the artifact

Prefer `strategy.md` when:
- the user is framing a feature or behavior change,
- strategic ownership matters more than formal requirements,
- the next step is system modeling, decisions, proof, or work orders.

Write `docs/features/{feature}/prd.md` only when:
- the user explicitly says PRD,
- stakeholder/user-story formatting is required,
- the team process expects PRDs.

For tiny, obvious changes, skip durable docs and recommend direct implementation with proof.

## Process

1. **Interview lightly** — Ask only questions that affect scope, constraints, decisions, or proof.
2. **Explore reality** — Read/search relevant code and docs enough to avoid invented requirements.
3. **Capture strategy** — Target user, problem, desired system behavior/outcome, constraints, non-goals, success evidence.
4. **Identify decisions and assumptions** — What the user must own, what the agent can decide, and what remains risky.
5. **Define proof** — Observable checks that prove the behavior and guardrails that should stay green.
6. **Write/update strategy or PRD** — Prefer `docs/features/{feature}/strategy.md`; optionally update `decisions.md` and `proof.md` if the packet exists.
7. **Make requirements design-ready** — Put user stories/requirements in the PRD, preferably BDD-style. Capture enough behavior for high-level design without turning the PRD into low-level implementation instructions.

## Strategy Template

```markdown
# Strategy: {Feature Name}

## Target user / customer

Who is affected, and in what situation?

## Problem to own

What user/business/system pain are we solving?

## Outcome

What measurable user/business/system outcome should improve?

## Desired system behavior

What should the system do in plain language after this change?

## Scope

### In
- ...

### Out
- ...

## Constraints

- Existing contracts, security, performance, migration, UX, or operational constraints.

## Assumptions / risks

- Assumption: ...
- Risk: ...
- How we will know: ...

## User-owned decisions

| ID | Decision needed | Options | Recommendation | Status |
| --- | --- | --- | --- | --- |
| D-001 | ... | ... | ... | proposed |

## Agent-owned choices

- Implementation details the agent may choose without changing product/system intent.

## Success evidence

- Observable behavior or command that proves the feature works.
- Regression gate that should stay green.

## Teach-back

The mental model the user should retain after this feature ships.
```

## Classic PRD Template (only if requested)

````markdown
# PRD: {Feature Name}

## Problem

## Target users / customers

## Goals / outcomes

## Scope

## Non-goals

## Requirements / user stories

Prefer BDD-style requirements:

```gherkin
Scenario: ...
  Given ...
  When ...
  Then ...
```

For each story, include relevant states, errors, permissions, and observable acceptance criteria.

## Success metrics / guardrails

## Constraints / dependencies

## Assumptions / risks

## Verification

## Open questions
````

## BDD Requirement Template (inside PRD)

````markdown
### Story: {Capability}

As a {user/system actor}, I want {capability}, so that {outcome}.

#### Scenarios

```gherkin
Scenario: Main path
  Given ...
  When ...
  Then ...

Scenario: Edge/error/permission case
  Given ...
  When ...
  Then ...
```

#### Acceptance criteria

- [ ] Observable result with expected state/output.
- [ ] Boundary or negative case with expected result.
- [ ] Permission/error/empty state if relevant.

#### Notes

- Product constraints:
- UX/API/CLI surface, if known:
- Open questions:
````

A PRD is ready for high-level design when the main stories, acceptance criteria, constraints, and open questions are clear enough that design does not need to invent product behavior.

## Next Step

After strategy/PRD is approved:
- create/update `system-model.md` for high-level architecture, stack shape, principal workflows, boundaries, and major tradeoffs,
- update `decisions.md` for unresolved strategic or architectural choices,
- update `proof.md` so PRD scenarios and high-level design risks have concrete evidence,
- create Work Orders when implementation should be split, delegated, or resumed; each Work Order carries the task-level design and feedback loop.
