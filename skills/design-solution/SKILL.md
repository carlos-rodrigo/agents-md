---
name: design-solution
description: "Turn a PRD into a phased implementation plan using vertical slices. Triggers on: create design, design this, plan phases, break down prd, tracer bullets."
---

# Design Solution

Break a PRD into a phased implementation plan using **vertical slices** (tracer bullets). Each phase cuts through ALL layers end-to-end.

## Process

### 1. Read the PRD

Load `.features/{feature}/prd.md`. If not found, ask the user.

### 2. Explore the codebase

Understand current architecture, patterns, and integration layers. Use scout/librarian sub-agents if needed.

### 3. Identify durable decisions

High-level decisions unlikely to change:
- Route structures / URL patterns
- Database schema shape
- Key data models
- Auth approach
- Third-party service boundaries

### 4. Draft vertical slices

Break PRD into **tracer bullet** phases:

- Each slice is a thin VERTICAL cut through ALL layers (schema → API → UI → tests)
- NOT horizontal slices (all DB first, then all API, etc.)
- Each phase is demoable/verifiable on its own
- Prefer many thin slices over few thick ones
- Include durable decisions (routes, schema), NOT file paths

### 5. Quiz the user

Present phases as numbered list with:
- **Title**: short name
- **User stories**: which ones from PRD

Ask: "Too coarse? Too fine? Merge or split anything?"

Iterate until approved.

### 6. Write the design

Save to `.features/{feature}/design.md`

---

## Template

```markdown
# Design: {Feature Name}

> PRD: .features/{feature}/prd.md

## Architectural Decisions

Durable decisions across all phases:

- **Routes**: ...
- **Schema**: ...
- **Key models**: ...

---

## Phase 1: {Title}

**User stories**: US-001, US-002

### What to build

Concise description of this vertical slice. End-to-end behavior, not layer-by-layer.

### Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

---

## Phase 2: {Title}

**User stories**: US-003

### What to build

...

### Acceptance criteria

- [ ] ...

<!-- Repeat for each phase -->
```

---

## Guidelines

- **Vertical over horizontal** — Every phase touches all layers
- **Thin slices** — Smaller is better; easier to verify and course-correct
- **Demoable** — Each phase produces something visible
- **No file paths** — They change; describe by responsibility

---

## Next Step

After design is approved:
> Say **"create tasks"** to break phases into tasks.
