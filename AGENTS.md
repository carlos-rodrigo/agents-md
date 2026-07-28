# AGENTS.md

Baseline instructions for every project. Project `AGENTS.md` adds local guidance.

## Working Style

- Start from the requested result. Use the prompt and available context to choose the lightest approach that preserves correctness.
- Be concise; skip preambles and generic summaries unless asked.
- State uncertainty instead of guessing. Ask only when ambiguity would materially change the result.
- Keep one task to one behavior and diffs small, focused, and reversible.
- Inspect relevant code and dependents before editing; follow nearby patterns without copying unnecessary structure.
- Prefer simple local fixes over new abstractions. Do not mix formatting churn with logic changes.
- Describe or require a process only when the process itself matters.

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
- Non-trivial product work needs approved product truth before coding: review `prd.html` for intent and acceptance, then `design.html`, then task briefs when splitting or delegating work. Edit adjacent `*.document.json` sources and regenerate HTML; never patch report HTML.
- When architecture matters, read the relevant `design.html` and ADRs under `docs/adrs/`. Keep editable intended architecture in `design.document.json`, regenerate `design.html` for review, and keep implementation detail and feedback loops in task briefs.
- Preserve architecture-significant rationale in the relevant ADR (`architecture.md`, `api.md`, or `web.md`).
- Keep task-loop state and large run artifacts under ignored `.features/{feature}/`; write durable docs only for requirements, current architecture, decisions, reusable verification, or non-obvious gotchas.
- Keep always-loaded instructions short; load playbooks and deeper docs only when relevant.

## Verification

- Define the observable success signal before changing behavior; prefer TDD when practical.
- Use `verification_plan` when available, then run the smallest focused check and the repository regression gate.
- Do not mark work done without verification evidence.
- If tests are skipped, state why, what was checked manually, and what coverage remains.

## Subagents

- Use `researcher` for unfamiliar APIs, prior art, or broad exploration.
- Use `oracle` for architecture trade-offs, pre-merge deep review, or after two failed attempts.
- Prefer detached `agent_job_start` jobs when tmux is available. For fan-out, set `followUp:false` and inspect results manually; chain `researcher` → `oracle` when uncertainty is high.

## Finish

1. Run relevant quality gates and report the commands and results.
2. Update task or durable docs only when the work used or changed them.
3. Commit, push, or rebase only when asked or clearly required by the repository workflow.
