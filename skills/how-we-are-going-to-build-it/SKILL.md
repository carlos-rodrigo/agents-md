---
name: how-we-are-going-to-build-it
description: "Propose a systemic implementation for a requirement after inspecting the codebase. Triggers on: how are we going to build it, implementation approach, architecture proposal, design this feature."
---

# How We Are Going to Build It

Before coding, inspect the repository and propose the smallest durable design that satisfies the requirement. Reuse healthy patterns, but do not reproduce accidental coupling or duplication merely for consistency. Correct demonstrated design problems the change would otherwise spread; introduce a new abstraction only when repository evidence or concrete requirements justify it.

This skill designs; it does not implement.

Save the final proposal after the pride gate at:

```text
.features/{feature}/how-we-are-going-to-build.md
```

Use the existing feature folder when one exists. If the feature name is unclear, ask for a slug before writing the file.

## Method

1. **Clarify the requirement**
   Read the existing feature specification when available. Ask only about gaps that materially affect the design.
   - Goal and observable result
   - Entry boundary
   - Invariants and non-goals
   - Decisions that must be answered before implementation

2. **Inspect the codebase**
   Trace the boundary, analogous features, callers, ownership, and tests. Inspect persistence, integrations, and failure paths where relevant. Cite concrete `path:Symbol` anchors.

   Classify findings as:
   - existing healthy pattern;
   - accidental duplication or coupling;
   - missing seam;
   - justified future extension point.

3. **Evaluate design pressure and sustainability**
   Focus on the touched path and nearby problems the implementation would propagate—not a codebase-wide cleanup.
   - What would a straightforward implementation copy or worsen? Cite duplication, scattered decisions, unclear ownership, or inconsistent failure behavior.
   - Do similar cases share a contract and need to change together? Similar-looking code alone does not justify consolidation.
   - Who should own the rule and state? Prefer an existing owner when it fits.
   - Choose between reuse, a local correction, a focused refactor, and a new abstraction. A direct implementation with no new abstraction is valid.
   - Explain what proves the choice helps: fewer independently maintained decisions, invalid states prevented, or behavior tested at a stable boundary. State when no corrective change is warranted.

   Describe variation, dependency boundaries, and relevant failure behavior. Consider invalid input, partial failure, retry, timeout, duplicate work, and recovery only where applicable.

   Use language-native mechanisms and local conventions first. Name a GoF, Fowler, Game Programming Patterns, Head First, or Refactoring pattern only when it explains a real pressure. Never add a pattern for its own sake.

4. **Recommend one design**
   Describe:
   - responsibilities and ownership;
   - request/data/control flow;
   - contracts, state, errors, and failure recovery;
   - the sustainability decision and its evidence; any new seam must have a concrete reason;
   - persistence/integration consequences where applicable;
   - tests that prove the boundary and failure behavior;
   - migration or rollout only when existing behavior changes.

   Use short signatures or pseudocode only to clarify a contract. Do not dump implementation code.

5. **Compare only consequential alternatives**
   Give up to three real options. For each, state fit with current code, future leverage, complexity/risk, and when it is appropriate. Be opinionated about the recommendation.

6. **End with the build order**
   List the smallest sequence of applicable changes and checks. Attach an observable proof to each step. When establishing a non-obvious boundary, include recording its ownership rule and rationale in the relevant architecture document and testing its observable behavior so future agents do not repeat the mistake.

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
- Missing seam: {only if justified; none found is valid}
- Anchors: `path/to/file:Symbol`

## Design
- Responsibilities:
- Flow:
- Contracts and state:
- Failure and recovery:
- Verification:

## Sustainability
- Existing design pressure: {concrete evidence, or none found}
- Risk of following the current pattern:
- Decision: {reuse | local correction | focused refactor | new abstraction}
- Why this is sufficient:
- Scope boundary: {what remains unchanged}
- Proof: {test or observable structural improvement}

## Alternatives
{only real consequential alternatives and trade-offs}

## Build order
1. {change} — proof: {observable result}

## Approval boundary
{API, schema, auth, persistence, infrastructure, dependency, or cross-cutting decisions needing approval}
```

## Pride gate

Before presenting or saving the proposal, run `are-you-proud` as a proposal review: assess repository evidence, feasibility, simplicity, trade-offs, and planned verification. Do not imply implementation checks have run. Resolve blocking findings and rerun the review until the verdict is **Proud**; optional notes may remain. If missing evidence or a decision requiring the user's authority blocks the proposal, report the blocker rather than looping or claiming certainty. Save only the final Proud proposal to `.features/{feature}/how-we-are-going-to-build.md`.

Keep it short enough for an architecture discussion. Separate evidence, assumptions, recommendations, and decisions. Do not claim repository behavior without an anchor. Do not implement until explicitly asked.
