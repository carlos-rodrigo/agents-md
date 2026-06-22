---
name: are-you-proud
description: "High-standard code quality review for agent-generated code. Use when asked: are you proud, would you ship this, quality review, taste review, check best practices, YAGNI, SOLID, overengineering, simplicity, naming, or test quality."
---

# Are You Proud?

Use this skill to review code with the taste and discipline of an exceptional engineer. The goal is not to nitpick; it is to decide whether the code is clear, simple, well-tested, and worthy of being shipped.

## Core question

> If your name were permanently attached to this change, would you be proud of it?

Answer honestly. Prefer direct, specific feedback over vague encouragement.

## Review posture

- Be rigorous but practical.
- Optimize for correctness, clarity, simplicity, maintainability, and restraint.
- Praise only what is genuinely strong.
- Flag avoidable complexity, cleverness, abstraction, indirection, or speculative extensibility.
- Do not demand perfection where a small, local fix is enough.
- Distinguish must-fix issues from taste-level suggestions.

## What to inspect

1. The diff or generated code.
2. Nearby project patterns.
3. Tests added or changed.
4. Existing requirements, task brief, PRD/design, or user request when available.
5. Verification evidence: commands run, failures, skipped checks, manual checks.

## Rubric

### 1. Correctness and intent

- Does the code solve the requested problem and only that problem?
- Are edge cases, empty states, errors, permissions, async behavior, and data boundaries handled?
- Is there hidden behavior or silent scope expansion?
- Does the implementation preserve existing contracts?

### 2. Simplicity and YAGNI

- Is this the smallest clear solution that works?
- Is there unnecessary abstraction, configuration, generic typing, indirection, framework code, or future-proofing?
- Could a competent engineer understand and change this in minutes?
- Is complexity justified by current requirements, not imagined future needs?

### 3. Self-explanatory code

- Do names say what variables, methods, functions, and classes do?
- Is control flow readable without tracing too much state?
- Are comments used only to explain non-obvious why, not obvious what?
- Are boundaries and responsibilities clear?

### 4. Best practices and maintainability

- Does the code follow local repo patterns and language/framework conventions?
- Does it avoid duplication without creating premature abstractions?
- Does it keep modules cohesive and dependencies reasonable?
- Does it avoid broad rewrites, formatting churn, global state, and hidden side effects?

### 5. SOLID, applied pragmatically

- Single Responsibility: does each unit have one reason to change?
- Open/Closed: are extension points used only where actually needed?
- Liskov: do replacements/subtypes preserve expectations?
- Interface Segregation: are consumers forced to depend on methods/data they do not need?
- Dependency Inversion: are high-level policies protected from low-level details where it matters?

Do not weaponize SOLID to justify overengineering. Simpler procedural code can be better than a needless class hierarchy.

### 6. Test quality

- Are tests simple, readable, and behavior-focused?
- Do tests cover happy path, edge cases, failure modes, and regressions relevant to the change?
- Do tests avoid duplicating implementation details or asserting incidental structure?
- Are fixtures minimal and meaningful?
- Would the tests fail for the bug or poor implementation they are meant to prevent?

### 7. Engineering taste

Look for the qualities common in excellent code:

- Obvious names.
- Small surfaces.
- Boring, dependable choices.
- Local reasoning.
- Clear data flow.
- Minimal mutation and side effects.
- Helpful tests that read like examples.
- No cleverness unless the problem truly demands it.

## Verdict scale

Use one of these verdicts:

- **Proud** — ship-worthy; only minor or optional notes.
- **Mostly proud** — good, but has a few should-fix issues.
- **Not proud yet** — important quality, correctness, simplicity, or testing gaps remain.
- **Would not ship** — serious correctness, maintainability, scope, or verification problems.

## Output format

```markdown
## Are You Proud? Verdict

**Verdict:** Proud | Mostly proud | Not proud yet | Would not ship

One short paragraph explaining the decision.

## What is strong

- ...

## Must fix before shipping

- **file:line** Problem → impact → recommended fix.

## Should improve

- **file:line** Problem → impact → recommended fix.

## Simplicity / YAGNI check

- Clear | Concern: ...

## Naming and readability

- Clear | Concern: ...

## SOLID / design fit

- Clear | Concern: ...

## Test review

- Coverage: strong | partial | weak | missing
- Notes:
  - ...

## Final pride question

Would I proudly maintain this six months from now? Yes | Not yet, because ...
```

## Review rules

- Always cite concrete code locations when reviewing files.
- If you cannot inspect the code or diff, say so and ask for it.
- Do not invent requirements.
- Do not block on personal style if the code is correct, local, and consistent with the repo.
- Prefer one simple recommendation over multiple abstract alternatives.
- If tests are missing for behavior-changing code, call that out unless the user explicitly requested no tests.
- If the code is overengineered, name the unnecessary abstraction and propose the simpler shape.
