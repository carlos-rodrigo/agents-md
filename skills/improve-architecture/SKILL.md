---
name: improve-architecture
description: "Find architectural improvement opportunities focusing on deep modules and testability. Triggers on: improve architecture, find refactors, deepen modules, make testable."
---

# Improve Codebase Architecture

Explore a codebase, surface friction, and propose module-deepening refactors.

A **deep module** (Ousterhout) = small interface hiding large implementation. More testable, more navigable.

## Process

### 1. Explore organically

Note where you experience friction:

- Understanding one concept requires bouncing between many files?
- Modules so shallow the interface ≈ implementation?
- Pure functions extracted for testability but bugs hide in how they're called?
- Tightly-coupled modules creating integration risk?
- Untested or hard-to-test parts?

**The friction you encounter IS the signal.**

### 2. Present candidates

Numbered list with:
- **Cluster**: Which modules involved
- **Why coupled**: Shared types, call patterns, co-ownership
- **Test impact**: What tests would be replaced by boundary tests

Ask: "Which would you like to explore?"

### 3. Frame the problem

For chosen candidate:
- Constraints any new interface must satisfy
- Dependencies it would rely on
- Rough code sketch to ground constraints

### 4. Design multiple interfaces

Spawn 3+ designs with different constraints:
- Minimize interface (1-3 entry points)
- Maximize flexibility
- Optimize for common caller

Each outputs:
1. Interface signature
2. Usage example
3. What it hides
4. Trade-offs

**Give your recommendation** — be opinionated.

### 5. Create GitHub issue

Use `gh issue create` with the chosen design as RFC.
