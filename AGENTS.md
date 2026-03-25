# AGENTS.md

> Baseline methodology for all projects. Project `AGENTS.md` adds context and may override specifics.

## Precedence

1. Project `AGENTS.md` (context + overrides)
2. This file (global defaults)
3. Agent built-ins (last resort)

## Scope

- **Global (this file):** workflow discipline, safety, autonomy
- **Project AGENTS.md:** stack, commands, architecture, domain rules

---

## Non-Negotiables

**Never:**
- Ship behavior change without test updates (or documented exception)
- Guess requirements or invent business logic
- Make large rewrites without explicit approval
- Log secrets/PII or weaken auth/validation
- Use `@ts-ignore`; avoid unscoped `as any`

**Allowed without approval:**
- Bug fixes, readability improvements, duplication reduction, documentation

**Requires approval:**
- Schema changes
- API contract changes
- Auth/financial logic changes
- Infra pattern changes
- Major dependency upgrades

---

## Change Discipline

- One task = one behavior (small, focused, reversible diffs)
- Keep system working after each step
- Don’t mix formatting with logic changes
- Before removing/changing code, understand why it exists and who depends on it

---

## Session Start (Triage)

For non-trivial requests, ask before acting:

> **How do you want to work on this?**
> 1. **Plan first** — PRD → Design → Tasks → Implementation
> 2. **Straight to code** — Implement directly
> 3. **Run the loop** — Execute ready tasks autonomously

Skip triage for trivial requests.

---

## Workflow (Overview)

> Plan → Design → Create Tasks → Implement → Ship

Use dedicated skills for detailed phase instructions:
- **Plan:** `prd`
- **Design:** `design-solution`
- **Tasks:** `simple-tasks`
- **Implement:** `implement-task`
- **Autonomous execution:** `loop`

### Phase gates

- Do **not** start Design before PRD is human-approved
- Do **not** start Tasks before Design is human-approved
- Implement one task at a time

---

## Testing Policy

Prefer TDD. Test-first exceptions are rare and must be auditable:
- Test harness absent/broken
- Unreachable legacy code
- Trivial docs/comments
- Emergency hotfix

If exception is used:
1. Document why in task
2. Define manual verification steps
3. Create follow-up task for tests
4. Keep scope minimal

---

## Sub-agents

| Agent | Purpose | When to use |
|-------|---------|-------------|
| `researcher` | Internet + library/source research | State-of-the-art, unfamiliar APIs/libraries |
| `oracle` | Deep reasoning + second opinion | Complex debugging, architecture, review |

Use sub-agents when they materially improve outcome; avoid for trivial work.

---

## Session Completion

Work is not complete until push succeeds:
1. Run quality gates (tests/lint/build)
2. Update task/workflow state
3. Capture reusable learnings in `LEARNINGS.md` (if any)
4. `git pull --rebase && git push`
5. Confirm `git status` is up to date

---

## Golden Rule

> If not confident, do not act.

State uncertainty, list assumptions, and ask.
