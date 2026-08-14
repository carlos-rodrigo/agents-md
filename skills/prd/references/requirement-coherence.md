# Requirement Coherence Recipe

Load this reference when a substantive PRD has multiple requirements, BDD scenarios, acceptance criteria, user stories, invariants, or explicit product constraints. The core skill defines the gate; this recipe defines the detailed review shape.

## Walkthrough contract

Use one structured `requirement` block per stable requirement:

```text
Requirement: req-### — concise statement
Source/authority: Sourced fact | Approved product truth | Proposed recommendation | Assumption | Open question
BDD coverage: scenario/slice IDs
Product path: actor trigger → product state changes → decision → observable result
Dependencies: requirements, rules, or states it relies on
Interactions: what it changes or constrains elsewhere
Collision check: none | conflict
Resolution: why it composes | proposed resolution | blocking question
Acceptance/proof: independently observable signal
Status: covered | unresolved | blocked
Owner: required when there is a conflict
```

Use stable `req-###` IDs. Every requirement needs at least one BDD reference and one independently observable acceptance reference, even when the structured block summarizes them rather than repeating their text.

## Stress procedure

1. Enumerate requirements from the authority source, not only from the agent's preferred scenarios.
2. Link each requirement to the slice, scenario, and acceptance that satisfy it.
3. Walk its actor, trigger, state transition, decision, result, and boundary.
4. Record dependencies and interactions with other requirements.
5. Check for collisions in permissions, actors, states, timing, ordering, terminology, boundaries, recovery, and acceptance signals.
6. Confirm that the requirements compose into one bounded product path.

## Collision rule

If two requirements cannot both be true, do not silently choose a winner, weaken one, duplicate behavior, or invent an unstated rule. Mark the affected requirement `conflict` and `unresolved` or `blocked`; explain the product consequences, name the product owner, and request input. A `Proposed recommendation` may frame the decision but cannot become product truth without approval.

This is a product-level check. Do not put APIs, services, schemas, persistence, or implementation workarounds here; hand those questions to Design Solution after the product conflict is resolved.

## Compact review example

```text
req-002 — A child may leave a shared calendar
BDD coverage: slice-001 / scenario-leave
Dependencies: membership state; invitation acceptance
Interactions: changes who can see future shared events
Collision check: conflict
Resolution: conflicts with req-003, which says only a parent can remove a member
Status: blocked
Owner: product owner
```
