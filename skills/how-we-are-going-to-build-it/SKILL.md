---
name: how-we-are-going-to-build-it
description: "Propose a systemic implementation for a requirement after inspecting the codebase. Triggers on: how are we going to build it, implementation approach, architecture proposal, design this feature."
---

# How We Are Going to Build It

Before coding, inspect the repository and propose the smallest durable design that solves the requirement and creates a useful seam for related future work.

This skill designs; it does not implement.

Save the final proposal after the pride gate at:

```text
.features/{feature}/how-we-are-going-to-build.md
```

Use the existing feature folder when one exists. If the feature name is unclear, ask for a slug before writing the file.

## Method

1. **Clarify the requirement**
   - Goal and observable result
   - Entry boundary
   - Invariants and non-goals
   - Decisions that must be answered before implementation

2. **Inspect the codebase**
   Trace the boundary, analogous features, callers, domain/application code, persistence and integrations, failure paths, and tests. Cite concrete `path:Symbol` anchors.

   Classify findings as:
   - existing healthy pattern;
   - accidental duplication or coupling;
   - missing seam;
   - justified future extension point.

3. **Find the design pressure**
   State what varies, what stays stable, who owns decisions and state, where dependencies cross boundaries, and how invalid input, partial failure, retry, timeout, duplicate work, and recovery behave.

   Use language-native mechanisms and local conventions first. Name a GoF, Fowler, Game Programming Patterns, Head First, or Refactoring pattern only when it explains a real pressure. Never add a pattern for its own sake.

4. **Recommend one design**
   Describe:
   - responsibilities and ownership;
   - request/data/control flow;
   - contracts, state, errors, and failure recovery;
   - the reusable seam and the future variation it enables;
   - persistence/integration consequences;
   - tests that prove the boundary and failure behavior;
   - migration or rollout only when existing behavior changes.

   Use short signatures or pseudocode only to clarify a contract. Do not dump implementation code.

5. **Compare only consequential alternatives**
   Give up to three real options. For each, state fit with current code, future leverage, complexity/risk, and when it is appropriate. Be opinionated about the recommendation.

6. **End with the build order**
   List the smallest sequence from acceptance check, seam, core behavior, adapters, failure cases, migration, and final quality checks. Attach an observable proof to each step.

## Output

```markdown
# How We Are Going to Build It

## Recommendation
{design decision and why it fits this codebase}

## Contract
- Goal:
- Boundary:
- Invariants:
- Non-goals:
- Decisions needed:

## Repository evidence
- Existing patterns:
- Accidental patterns:
- Missing seam:
- Anchors: `path/to/file:Symbol`

## Design
- Responsibilities:
- Flow:
- Contracts and state:
- Failure and recovery:
- Future mechanism:
- Verification:

## Alternatives
{only real consequential alternatives and trade-offs}

## Build order
1. {change} — proof: {observable result}

## Approval boundary
{API, schema, auth, persistence, infrastructure, dependency, or cross-cutting decisions needing approval}
```

## Pride gate

Before presenting or saving the proposal, run `are-you-proud` against the proposal, repository evidence, trade-offs, and verification plan. Fix every finding, rerun the review, and iterate until the verdict is **Proud**. Save only the final Proud result to `.features/{feature}/how-we-are-going-to-build.md`. Do not present or save a plan with unresolved findings; escalate only decisions that require the user's authority.

Keep it short enough for an architecture discussion. Separate evidence, assumptions, recommendations, and decisions. Do not claim repository behavior without an anchor. Do not implement until explicitly asked.
