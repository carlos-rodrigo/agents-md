---
name: code-un-slopify
description: "Clean AI-generated executable code without changing behavior. Use when asked to deslop code, remove AI slop, simplify generated code, improve generated names, or reduce unnecessary implementation complexity."
---

# Code Un-Slopify

Improve the readability and idiomatic quality of AI-generated code while preserving its behavior, public contracts, tests, and approved scope.

AI slop in code is legal code that carries unnecessary model-shaped surface area:

- generic or misleading names;
- comments that narrate syntax;
- premature abstractions and wrappers;
- defensive code without a real recovery path;
- redundant configuration, branching, or temporaries;
- language-inappropriate patterns;
- tests that mirror implementation instead of behavior;
- placeholder, debug, or conversational artifacts.

This is a bounded refactoring pass, not a feature change, redesign, rewrite, or style contest.

## When to use

Use after an implementation has working behavioral tests, or when the user explicitly asks to clean generated code. Operate only on the approved implementation scope unless the user expands it.

Do not use for vendor/generated code, unrelated pre-existing code, behavior fixes, broad architecture changes, or code without a behavior test. Use the existing `un-slopify` skill for prose and technical artifacts; it remains audit-only for executable code.

## Invariants

- Preserve observable behavior, public APIs, schemas, error semantics, and performance-sensitive behavior.
- Do not weaken validation, authorization, privacy, error handling, or recovery paths.
- Do not change tests merely to make them pass.
- Do not add dependencies, broaden scope, or introduce speculative abstractions.
- Keep idiomatic framework and language conventions even when they resemble a slop pattern.
- Every changed category must have a focused verification result.

## Workflow

1. Establish the exact files and non-goals from the task or user request.
2. Read repository instructions, nearby code, language conventions, and relevant tests.
3. Run the focused tests before editing. Add a regression test first if behavior is not observable.
4. Inspect the diff and choose one smell category; do not batch unrelated cleanup.
5. Apply the smallest behavior-preserving change.
6. Run the focused tests immediately.
7. Repeat only for justified categories, one category per pass.
8. Run the repository verification gate.
9. When embedded in implementation, hand the cleanup diff and verification evidence to the owning workflow's final review; do not start a second review gate. For standalone cleanup, run Are You Proud? against the final diff.
10. Use Oracle only when required by the owning workflow or repository risk gates.

Stop and report a blocker when a proposed cleanup changes behavior, lacks coverage, needs scope expansion, or makes no safe progress after two attempts.

## Review categories

### Names

Replace generic names (`data`, `result`, `value`, `item`, `info`) when they obscure a meaningful domain value. Shorten run-on names when local context already supplies the meaning. Remove `Helper`, `Manager`, `Util`, `Wrapper`, or `Processor` only when the name hides a clearer responsibility; do not rename established public concepts casually.

### Comments and docblocks

Remove comments that translate the next line into English. Keep comments that explain why, compatibility, invariants, external constraints, failure behavior, or recovery. Delete docblocks that merely restate typed signatures.

### Abstraction and configuration

Question single-use helpers, builtin wrappers, one-implementation interfaces, factories without variation, and options bags with no real configuration need. Preserve an abstraction when it expresses a real boundary, polymorphism, lifecycle, or domain responsibility.

### Defensive code

Question swallowed errors, redundant null checks, impossible fallbacks, and repeated validation after a trusted boundary. Keep checks at external boundaries and handling for failures that can occur in production.

### Structure

Prefer early returns, direct standard-library operations, fewer temporary transformations, and shallow control flow when they remain clearer. Do not compress code merely to reduce line count.

### Tests

Prefer behavior assertions over implementation-shaped mocks, empty `does-not-throw` checks, and broad snapshots. Keep builders and fixtures when they make scenarios clearer or isolate real boundaries.

### Language fit

Use the project formatter, linter, type checker, framework conventions, and standard library idioms as evidence. A pattern is not slop solely because another language would express it differently.

## Output

### Audit mode

```text
Verdict: clean | findings | blocked
Scope: {files}
Findings:
- file:line — category — concrete problem — smallest safe fix
Risks/unknowns: {none | unresolved judgment}
```

### Rewrite mode

Report:

```text
Changed: {file:line and category for each pass}
Preserved: {behavior, contracts, and tests checked}
Verification: {command} → {result}
Remaining: {none | deferred finding and reason}
```

Do not invent a slop score or treat a heuristic count as a quality gate. Findings require contextual judgment.

## Completion standard

The pass is complete only when the approved scope is unchanged, every cleanup pass was tested, repository verification passes, and no unresolved material correctness, security, contract, or verification findings remain. Optional taste suggestions do not block completion or expand scope.

Reuse the owning workflow's review and retry budget; standalone cleanup allows at most two repair-and-review cycles. After a material fix, rerun affected checks and re-review changed areas only. Do not restart reviews of unchanged code. If a material finding remains after the budget, report the blocker and owner rather than looping.
