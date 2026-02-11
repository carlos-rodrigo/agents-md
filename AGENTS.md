# AGENTS.md

> Baseline methodology for all projects. Project AGENTS.md adds context and may override specifics.

## Precedence

1. Project AGENTS.md (context + overrides)
2. This file (methodology defaults)
3. Agent built-ins (last resort)

## Scope

- **Global (this file)**: How we work — workflow, test discipline, change discipline, safety, autonomy.
- **Project AGENTS.md**: What we work on — stack, commands, architecture, conventions, domain rules.

---

## Non-Negotiables

**Never:**

- Ship behavior change without test update (or documented exception)
- Guess requirements or invent business logic
- Large rewrites without explicit approval
- Log secrets/PII, bypass security, weaken auth/validation
- Use `@ts-ignore`; avoid unscoped `as any` (if unavoidable: constrain + comment)

**Allowed without approval:**

- Bug fixes, readability improvements, duplication reduction, documentation

**Requires approval:**

- Schema changes, API contract changes, auth/financial logic, infra patterns, major dependency upgrades

---

## Change Discipline

- **One task = one behavior.** Keep diffs small, focused, reversible.
- Keep the system working after each step.
- Don't mix formatting with logic changes (split commits).
- Before removing/changing code, understand why it exists and who depends on it.

---

## Development Workflow

> Plan → Create Tasks → Loop (Work → Review → Compound) → Ship

### Session Start (Triage)

For non-trivial requests, ask before acting:

> **How do you want to work on this?**
> 1. **Plan first** — Collaborative planning → PRD → tasks → implementation
> 2. **Straight to code** — Skip planning, go to Work → Review → Compound → Ship
> 3. **Run the loop** — Pick up existing tasks and execute autonomously

Skip triage for trivial requests (typos, small fixes, quick questions).

---

### Phase 1: Plan (PRD)

**Collaborative: Agent + Human. Requires human approval.**

1. Research codebase: search for patterns, prior art, `git log`, docs, `AGENTS.md`, `LEARNINGS.md`
2. Ask clarifying questions (use lettered options for fast answers)
3. Load the `prd` skill
4. Generate PRD and save to `.prd/prd-[feature-name].md`
5. Present PRD to user for approval
6. If changes needed → iterate until approved

**Detail level:** Minimal (< 2h), Standard (1-2d), Comprehensive (multi-day)

**Do NOT proceed to tasks until human approves the PRD.**

---

### Phase 2: Create Tasks

After PRD is approved:

1. Load the `simple-tasks` skill
2. Read the approved PRD from `.prd/`
3. Derive feature name from PRD filename (`prd-user-auth.md` → `user-auth`)
4. Create feature folder: `.tasks/{feature}/`
5. Break user stories into implementable tasks in `.tasks/{feature}/`
6. Create `.tasks/{feature}/_active.md` with progress checklist
7. Each task must be completable in one iteration (one context window)

**Parallel features:** Each feature gets its own folder. Multiple agents can work different features simultaneously.

**Rule of thumb:** If you can't describe the change in 2-3 sentences, split it.

---

### Phase 3: Work (BDD/TDD)

> No behavior change without a test.

1. Create a new branch if on main
2. Write failing test (behavior-focused)
3. Make minimal code pass test
4. Refactor only after green
5. Commit incrementally
6. Verify acceptance criteria pass

Run tests after every meaningful change. If something fails, understand why before proceeding.

---

### Phase 4: Review

**Before committing**, spawn one agent per perspective using Task tool. Each agent MUST fix issues (not just report):

| Agent        | Focus                              | Fixes                                 |
| ------------ | ---------------------------------- | ------------------------------------- |
| Code Quality | Patterns, naming, complexity       | Refactor to match patterns, simplify  |
| Security     | Secrets, validation, data handling | Add validation, sanitize inputs       |
| Performance  | N+1 queries, caching, bottlenecks  | Optimize queries, add caching         |
| Testing      | Coverage, edge cases, brittleness  | Add missing tests, improve assertions |

After all agents complete: run full test suite, resolve conflicts, commit separately.

**Always announce phase transitions with visible markers.**

---

### Phase 5: Compound

After review passes, capture learnings in project's `LEARNINGS.md`:

- **Patterns**: Reusable solutions discovered
- **Decisions**: Why an approach was chosen
- **Failures**: Bugs and how to prevent them
- **Gotchas**: Non-obvious behavior, edge cases

**Format:**

```markdown
## [Category]: [Brief Title]

**Date:** YYYY-MM-DD
**Context:** [What were you trying to do?]
**Learning:** [What did you discover?]
**Applies to:** [Where else might this be relevant?]
```

**Always compound at the end of the flow**. Show compound execution by:

```
<Starting Compound>
  Analyzing changes for learnings...
</Compound Complete>

I learned:
1. [First learning]
2. [Second learning]
3. [Third learning]
```

**Rules:**

- Review and Compound phases are **mandatory** after completing implementation work
- Never skip these phases silently
- If no learnings worth capturing, state: "No significant learnings from this task."

---

### Phase 6: Ship

After development, review, and compound:

- Create a new PR with a short description mentioning What, Why, How

---

## Exceptions

Test-first exceptions are rare and auditable. Allowed only when:

- Test harness absent/broken
- Unreachable legacy code
- Trivial docs/comments
- Emergency hotfix

**Required guardrails:**

1. Document why in task
2. Define manual verification steps
3. Create follow-up task to add tests
4. Keep change minimal—no refactors

---

## Session Completion

Work is NOT complete until `git push` succeeds.

1. Compound learnings → `LEARNINGS.md`
2. File issues for remaining work
3. Run quality gates (tests, lints, builds)
4. Update issue status
5. `git pull --rebase && git push`
6. Verify: `git status` shows "up to date with origin"

---

## Golden Rule

> If not confident, do not act.

Stop. State uncertainty. List assumptions. Ask.
