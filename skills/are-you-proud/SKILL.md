---
name: are-you-proud
description: "Review a code change, plan, or task for correctness, clarity, contradictions, ambiguity, simplicity, maintainability, and proof. Triggers on: are you proud, would you ship this, quality review, review this plan, review these tasks, taste review, best practices, YAGNI, SOLID, naming, test quality."
---

# Are You Proud?

Review the actual diff, nearby code, requirements, tests, and verification evidence. Decide whether the change is worthy of shipping—not whether it matches personal taste.

## Check

- **Intent:** solves the request without hidden scope or contract breakage.
- **Correctness:** handles relevant empty, error, permission, async, data, and recovery cases.
- **Simplicity:** no speculative abstraction, cleverness, configuration, dependency, indirection, or broad rewrite. Always push for the simplest solution that works.
- **Readability:** names, control flow, ownership, and side effects are obvious.
- **Design fit:** follows local language/framework patterns; responsibilities and boundaries are coherent. Apply SOLID pragmatically, not ceremonially.
- **Tests:** behavior-focused tests prove the change, edge cases, and failure modes; no incidental implementation assertions. No unapproved deletion, skipping, or loosening of tests, and no implementation that hard-codes the tests' expected outputs or special-cases test inputs.
- **Evidence:** required checks ran and skipped checks have reasons. An implementer's reported results are claims until a rerun or saved artifact confirms them.

## For plans and tasks

Review the plan or task against the user's request and its source plan. Replace the code checks above with:

- **Consistency:** no contradictions between sections, between tasks, or with the source plan. Every scenario is produced by the design, and every build step or task traces to an outcome.
- **Clarity:** each term, owner, and boundary has one reading. A fresh agent could act without chat history.
- **Ambiguity:** no undecided behavior hidden as fact. A question only the user can answer is a decision to list, not a finding to iterate on.
- **Verifiability:** each outcome or Done item has a check that could fail when the behavior is missing.
- **Evidence:** claims about current code cite `path:Symbol`.
- **Simplicity:** the design and the task split are no larger than the outcome needs.

Use concrete `file:line` or section references. Separate must-fix issues from optional improvements. Do not invent requirements.

## Verdict

Choose one:

- **Proud** — ship-worthy; only optional notes. The only verdict that ends the iteration.
- **Mostly proud** — good, with should-fix issues.
- **Not proud yet** — important quality, correctness, or test gaps.
- **Would not ship** — serious correctness, scope, maintainability, or verification problems.

Return:

```markdown
## Verdict

**{Proud | Mostly proud | Not proud yet | Would not ship}**
{short reason}

## Findings

- **Must fix — `file:line`:** problem → impact → fix.
- **Should improve — `file:line`:** problem → impact → fix.

## Checks

- Simplicity: clear | concern
- Design fit: clear | concern
- Tests: strong | partial | weak | missing  (plans and tasks: Consistency, Clarity, Verifiability: clear | concern)
- Verification: {evidence or gaps}

## Final question

Would I proudly maintain this six months from now? **Yes | Not yet — {reason}**
```

## Iterate until proud

When this review gates work (a plan, a task set, or an implementation), fix the findings and review again. Repeat until a round finds no must-fix and no should-fix findings. Only optional notes may remain.

A question only the user can answer is not a finding: record it as a decision or blocker with its owner, and keep iterating on everything else.

Omit empty finding categories. A correct, local, well-tested solution should pass even if it is not maximally abstract or novel.
