---
name: prd
description: "Create a concise PRD when written requirements are actually needed. Triggers on: create a prd, write prd, plan feature, requirements for."
---

# PRD / Feature Brief

Use this skill only when a written requirements artifact will reduce risk.

## First decide if a PRD is warranted

Write `docs/features/{feature}/prd.md` when:
- the user explicitly asks for a PRD or written requirements,
- the work is large, risky, or ambiguous,
- the feature spans multiple user stories or stakeholders,
- or a later design/task handoff needs a durable brief.

Skip the PRD and recommend a lighter path when:
- the change is small or bounded,
- scope is already clear,
- or a short plan in chat is enough.

If you skip it, say so explicitly and suggest the next step (`investigate + plan`, `create tasks`, or implement directly).

---

## Process

1. **Clarify only what matters** — Ask only questions that change scope, constraints, or verification.
2. **Explore** — Search the codebase for relevant patterns, modules, and prior art.
3. **Define success** — Capture goals, constraints, and verification clearly.
4. **Write** — Generate a concise PRD.
5. **Save** — `docs/features/{feature}/prd.md`

Skip or compress steps when the answer is already obvious.

---

## Template

```markdown
# PRD: {Feature Name}

## Problem

What problem are we solving? 2-3 sentences max.

## Goals

- Goal 1
- Goal 2

## Scope

### In
- What this change includes

### Out
- What this change does not include

## User Stories

Include only if they help clarify behavior.

### US-001: {Title}

**As a** {actor}, **I want** {capability}, **so that** {benefit}.

**Acceptance Criteria:**
- [ ] Specific, verifiable criterion
- [ ] Another criterion

## Constraints / Dependencies

- Technical, product, or operational constraints
- Existing contracts that must be preserved

## Verification

- Automated checks to run
- Manual scenarios to verify

## Open Questions

- [ ] Unresolved decision needing input
```

---

## Guidelines

- **Concise over comprehensive** — This is a brief, not a spec dump
- **Ask less, but ask the right things** — only questions that change the outcome
- **Prefer constraints and verification over prose**
- **No file-by-file tours** — describe responsibilities and boundaries instead
- **Leave architecture to design** — unless the user explicitly wants it here

---

## Next Step

After the PRD is approved:
- If meaningful technical tradeoffs remain, say **"create design"**
- Otherwise, say **"create tasks"** or implement directly
