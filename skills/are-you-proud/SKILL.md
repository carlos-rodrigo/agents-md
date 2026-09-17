---
name: are-you-proud
description: "Review a change for correctness, clarity, simplicity, maintainability, and test quality. Triggers on: are you proud, would you ship this, quality review, taste review, best practices, YAGNI, SOLID, naming, test quality."
---

# Are You Proud?

Review the actual diff, nearby code, requirements, tests, and verification evidence. Decide whether the change is worthy of shipping—not whether it matches personal taste.

## Check

- **Intent:** solves the request without hidden scope or contract breakage.
- **Correctness:** handles relevant empty, error, permission, async, data, and recovery cases.
- **Simplicity:** no speculative abstraction, cleverness, configuration, dependency, indirection, or broad rewrite.
- **Readability:** names, control flow, ownership, and side effects are obvious.
- **Design fit:** follows local language/framework patterns; responsibilities and boundaries are coherent. Apply SOLID pragmatically, not ceremonially.
- **Tests:** behavior-focused tests prove the change, edge cases, and failure modes; no incidental implementation assertions.
- **Evidence:** required checks ran and skipped checks have reasons.

Use concrete `file:line` findings. Separate must-fix issues from optional improvements. Do not invent requirements.

## Verdict

Choose one:

- **Proud** — ship-worthy; only optional notes.
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
- Tests: strong | partial | weak | missing
- Verification: {evidence or gaps}

## Final question
Would I proudly maintain this six months from now? **Yes | Not yet — {reason}**
```

Omit empty finding categories. A correct, local, well-tested solution should pass even if it is not maximally abstract or novel.
