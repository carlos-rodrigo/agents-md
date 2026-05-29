---
name: prd
description: "Frame a feature strategy packet; create a classic PRD only when explicitly useful. Triggers on: create a prd, write prd, plan feature, requirements for, feature strategy."
---

# Feature Strategy / PRD Compatibility

Use this skill to help the user own the product/system strategy before implementation.

Default to the new feature-flow source of truth:

```text
docs/features/{feature}/strategy.md
```

Create a classic `prd.md` only when the user explicitly asks for a PRD or an external stakeholder/process needs that artifact.

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
3. **Capture strategy** — Problem, desired system behavior, constraints, non-goals, success evidence.
4. **Identify decisions** — What the user must own vs what the agent can decide.
5. **Define proof** — Observable checks that prove the behavior.
6. **Write/update** — Prefer `docs/features/{feature}/strategy.md`; optionally update `decisions.md` and `proof.md` if the packet exists.

## Strategy Template

```markdown
# Strategy: {Feature Name}

## Problem to own

What user/business/system pain are we solving?

## Desired system behavior

What should the system do in plain language after this change?

## Scope

### In
- ...

### Out
- ...

## Constraints

- Existing contracts, security, performance, migration, UX, or operational constraints.

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

```markdown
# PRD: {Feature Name}

## Problem

## Goals

## Scope

## User Stories

## Constraints / Dependencies

## Verification

## Open Questions
```

## Next Step

After strategy is approved:
- create/update `system-model.md` when implementation flow or domain model needs explanation,
- update `decisions.md` for unresolved strategic choices,
- update `proof.md` for acceptance evidence,
- create Work Orders only when delegation/splitting is useful.
