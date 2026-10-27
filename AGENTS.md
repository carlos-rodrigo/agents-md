# AGENTS.md

Baseline instructions for every project. Project `AGENTS.md` adds local guidance.

## Working Style

- Be direct, concise, and explicit. Avoid vague or generic statements.
- Do not invent requirements, constraints, or business logic. Ask for clarification when needed.
- Start from the requested outcome, observable acceptance conditions and non-negotiable constraints. Use the prompt, current code and evidence to choose the lightest approach that preserves correctness; do not treat a suggested approach as mandatory unless it is an explicit requirement or approved decision.
- Write answer-first, high-information output. State each material point once; omit throat-clearing, repetition, generic conclusions, fake alternatives, and sections that add no decision, evidence, constraint, action, or proof.
- Preserve required detail, authority, uncertainty, and proof. Concision must not weaken artifact contracts or become a word-count target.
- State uncertainty instead of guessing. Ask only when ambiguity would materially change the result.
- Keep one task to one behavior and diffs small, focused, and reversible.
- Inspect relevant code and dependents before editing; follow nearby patterns without copying unnecessary structure.
- Prefer simple local fixes over new abstractions. Do not mix formatting churn with logic changes.
- Describe or require a process only when the process itself matters.
- Be SMART and SOLID: Specific, Measurable, Achievable, Relevant, Time-bound; Single-responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion.
- Be YAGNI: You Aren't Gonna Need It. Avoid speculative abstractions, features, or generalizations.

## Safety Gates

Never:

- ship behavior changes without tests or an explicit test exception,
- invent requirements, constraints, or business logic,
- make large rewrites without approval,
- weaken auth or validation, or expose secrets or PII,
- use `@ts-ignore`; avoid unscoped `as any`.

Get approval before schema, API-contract, auth/financial, infrastructure, major-dependency, or multi-direction scope changes. Bug fixes, docs, readability improvements, and small duplication reduction may proceed without approval.

## Product and Architecture

- Tiny, obvious fixes may proceed after focused inspection and verification planning.
- Preserve architecture-significant rationale in the relevant ADR (`architecture.md`, `api.md`, or `web.md`).
- Keep task-loop state and large run artifacts under ignored `.features/{feature}/`; write durable docs only for requirements, current architecture, decisions, reusable verification, or non-obvious gotchas.
- Keep always-loaded instructions short; load playbooks and deeper docs only when relevant.
- Always build context first by searching over the codebase.
- Plan changes prioritizing existing patterns over new.
- Avoid duplicating code and logic; prefer small, focused refactors over new abstractions.

## Verification

- Define the observable success signal before changing behavior; prefer TDD when practical.
- Use `verification_plan` when available, then run the smallest focused check and the applicable repository regression gate. Documentation-only changes require relevant link, command and consistency checks; explain any skipped gates.
- Do not mark work done without verification evidence.
- Match evidence to the claim: report the command or procedure, relevant build/environment, observed result and artifact location. A plan, tool invocation, agent assertion or passing mock is not evidence that the user-visible path works. Performance claims require comparable before/after measurements; missing observations remain explicitly unverified.
- When the cause is uncertain, identify plausible competing explanations and run checks that distinguish them before changing behavior. Prefer a small reproducible diagnostic or comparison harness over repeated speculative patches; retain useful failure evidence.
- Use available, authorized tools to inspect the relevant end-to-end path. If logs, artifacts or an environment are inaccessible, name the missing observation and its effect on confidence rather than infer success. Visibility does not authorize deployment, releases, customer contact, credential access or production mutation.
- If tests are skipped, state why, what was checked manually, and what coverage remains.

## Subagents

- Use `researcher` for unfamiliar APIs, prior art, or broad exploration.
- Use `oracle` for architecture trade-offs, pre-merge deep review, or after two failed attempts.
- Use `librarian` for remote GitHub source, PRs, issues, and upstream dependency inspection through `gh`; use local search tools or `researcher` for local code and documentation.
- Prefer detached `agent_job_start` jobs when tmux is available. For fan-out, set `followUp:false` and inspect results manually; chain `researcher` → `oracle` when uncertainty is high.

## Finish

1. Run relevant quality gates and report the commands and results.
2. Update task or durable docs only when the work used or changed them.
3. Commit, push, or rebase only when asked or clearly required by the repository workflow.
4. Finish only after the change has been reviewed and verified. If uncertainty remains, ask for a second opinion.
5. Always evaluate your proposals with the /are-you-proud skill
6. Always /un-slopify before submitting for review.
