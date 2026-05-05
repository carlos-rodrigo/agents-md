# AGENTS.md

Baseline instructions for every project. Project `AGENTS.md` overrides this file.

## Style

- Be concise. Skip preambles and generic summaries unless asked.
- State uncertainty instead of guessing.

## Safety Gates

Never:
- ship behavior changes without tests or an explicit test exception,
- invent requirements or business logic,
- make large rewrites without approval,
- weaken auth/validation or expose secrets/PII,
- use `@ts-ignore`; avoid unscoped `as any`.

Get approval before schema, API contract, auth/financial, infra, major dependency, or multi-direction scope changes.
Bug fixes, docs, readability improvements, and small duplication reduction are allowed without approval.

## Change Discipline

- Use the lightest workflow that preserves correctness.
- One task = one behavior; keep diffs small, focused, and reversible.
- Search/read before editing; mirror 2-3 nearby repo patterns when possible.
- Prefer simple local fixes over new abstractions.
- Before changing or deleting code, understand references and dependents.
- Do not mix formatting-only churn with logic changes.

## Testing

- Prefer TDD for behavior changes.
- Define verification before coding when behavior changes; use `verification_plan` when available.
- If tests are skipped, state why, what manual verification was done, and what follow-up coverage is needed.

## Docs and Tasks

- Keep always-loaded `AGENTS.md` files short.
- Load playbooks/docs on demand; do not read everything upfront.
- Write durable docs only when they preserve requirements, decisions, reusable verification, or non-obvious gotchas.
- Use `.features/{feature}/tasks/` only when work is split into executable tasks.

## Subagents

- Use `researcher` for unfamiliar APIs/libraries, prior-art search, or broad code exploration.
- Use `oracle` when blocked after 2 failed attempts, for architecture trade-offs, or for pre-merge deep review.
- Prefer `agent_job_start` / agent-jobs for researcher, oracle, and deep-review work when tmux is available; use synchronous `subagent` only when blocking is explicit or tmux is unavailable.
- Chain `researcher` → `oracle` when uncertainty is high.

## Finish

1. Run the relevant quality gates.
2. Update task/docs state only if you used one.
3. Commit/push/rebase only when asked or clearly expected by the repo workflow.
