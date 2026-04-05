# AGENTS.md

> Baseline methodology for all projects. Project `AGENTS.md` adds context and may override specifics.

Precedence: Project `AGENTS.md` > this file > built-ins.

---

## Response Style

Be concise. No preamble, no summaries unless asked. Short answers for simple questions.

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
- Schema, API contract, auth/financial, infra pattern changes; major dependency upgrades

---

## Change Discipline

- One task = one behavior (small, focused, reversible diffs)
- Keep system working after each step
- Don't mix formatting with logic changes
- Before removing/changing code, understand why it exists and who depends on it

### Anti-Slop Policy

- Prefer minimal, surgical changes over rewrites
- Follow existing code style and local patterns first
- Find 2-3 prior-art examples in the repo and mirror them
- Do not introduce new abstractions unless clearly necessary
- Avoid opportunistic cleanup/refactors unrelated to the requested behavior

---

## Documentation Policy

Projects use `docs/` as the single place for agent-facing knowledge:
- `docs/playbooks/` — curated how-to guides, auto-maintained by agents during Finalize
- `docs/features/` — feature specs (PRD, design) + verification workflows
- `AGENTS.md` — small, always loaded; points to `docs/` for details
- `.features/` — ephemeral task files only

Load playbooks on demand during research — don't read everything upfront.
Auto-doc sub-agent updates `docs/` during Finalize (no manual step).

---

## Session Start (Triage)

For non-trivial requests, ask before acting:

> **How do you want to work on this?**
> 1. **Plan first** — PRD → Design → Tasks → Implementation
> 2. **Straight to code** — Implement directly
> 3. **Run the loop** — Execute ready tasks autonomously

Skip triage for trivial requests.

---

## Workflow

> Plan → Design → Create Tasks → Implement → Ship

Skills: `prd`, `design-solution`, `simple-tasks`, `implement-task`, `loop`

### Phase gates

- Do **not** start Design before PRD is human-approved
- Do **not** start Tasks before Design is human-approved
- Implement one task at a time

---

## Testing Policy

Prefer TDD. Exceptions (harness absent, trivial docs, emergency hotfix) must be documented in the task with manual verification steps and a follow-up task for tests.

---

## Sub-agents

| Agent | When to use |
|-------|-------------|
| `researcher` | Unfamiliar APIs/libraries, state-of-the-art |
| `oracle` | Blocked after 2 failed attempts, pre-merge deep review, architecture trade-offs |

Chain `researcher` → `oracle` when uncertainty is high. Accepted recommendations must become code/tests/docs.

---

## Session Completion

1. Run quality gates (tests/lint/build)
2. Update task/workflow state
3. `git pull --rebase && git push`

> **Golden Rule:** If not confident, do not act. State uncertainty and ask.
