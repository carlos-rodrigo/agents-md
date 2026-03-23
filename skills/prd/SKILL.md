---
name: prd
description: "Create a PRD through interview and codebase exploration. Triggers on: create a prd, write prd, plan feature, requirements for."
---

# PRD Generator

## Process

1. **Interview** — Ask clarifying questions until you deeply understand the problem. Walk down each branch of the design tree, resolving dependencies one-by-one.

2. **Explore** — Search the codebase for relevant patterns, modules, and prior art.

3. **Design** — Identify modules to build/modify. Prefer deep modules (lots of functionality behind a simple, testable interface).

4. **Write** — Generate PRD using template below.

5. **Save** — `.features/{feature}/prd.md`

Skip steps if unnecessary. Be concise.

---

## Template

```markdown
# PRD: {Feature Name}

## Problem

What problem does this solve? From the user's perspective. 2-3 sentences max.

## Solution

How we'll solve it. High-level approach, not implementation details.

## User Stories

Each story in BDD format:

### US-001: {Title}

**As a** {actor}, **I want** {feature}, **so that** {benefit}.

**Given** {precondition}
**When** {action}
**Then** {expected outcome}

**Acceptance Criteria:**
- [ ] Specific, verifiable criterion
- [ ] Another criterion

---

## Modules

Which modules to build or modify. Describe interfaces, not file paths.

| Module | Responsibility | New or Modified |
|--------|---------------|-----------------|
| ... | ... | ... |

## Out of Scope

What this feature will NOT include.

## Open Questions

- [ ] Unresolved decisions needing input
```

---

## Guidelines

- **Concise over comprehensive** — Only include what's needed to understand and build
- **Interview relentlessly** — Don't assume, ask
- **Deep modules** — Encapsulate complexity behind simple interfaces
- **No file paths** — They get outdated; describe by responsibility instead
- **BDD for clarity** — Given/When/Then removes ambiguity

---

## Next Step

After PRD is approved:
> Say **"create design"** to generate the technical design.
