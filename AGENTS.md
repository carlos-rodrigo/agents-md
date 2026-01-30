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

> Plan → Work → Review → Compound

### Phase 1: Plan

**Before writing code**, research and plan:

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
- Search codebase for similar patterns and prior art
- Super concise and direct to the point
- Check `git log`, docs, AGENTS.md files, `LEARNINGS.md`
- Create task with: BDD spec, acceptance criteria, test plan, feedback loop, risks
- If it is a PRD use the PRD skill

**Detail level:** Minimal (< 2h), Standard (1-2d), Comprehensive (multi-day with plan doc)

**Feedback Loop:** For tasks with observable outputs (UI, API, files), use the `feedback-loop` skill to design verification criteria. For UI tasks, use `agent-browser` for automated visual/interaction testing.

### Phase 2: Work (BDD/TDD)

> No behavior change without a test.

1. Write failing test (behavior-focused)
2. Make minimal code pass test
3. Refactor only after green
4. Commit incrementally

Run tests after every meaningful change. If something fails, understand why before proceeding.

### Phase 3: Review

**Before committing**, spawn one agent per perspective using Task tool. Each agent MUST fix issues (not just report):

| Agent        | Focus                              | Fixes                                 |
| ------------ | ---------------------------------- | ------------------------------------- |
| Code Quality | Patterns, naming, complexity       | Refactor to match patterns, simplify  |
| Security     | Secrets, validation, data handling | Add validation, sanitize inputs       |
| Performance  | N+1 queries, caching, bottlenecks  | Optimize queries, add caching         |
| Testing      | Coverage, edge cases, brittleness  | Add missing tests, improve assertions |

After all agents complete: run full test suite, resolve conflicts, commit separately.

**Always announce phase transitions with visible markers.** This helps the user track what the agent is doing.

Use these exact formats:

```
<Starting Review>
  <Sub-Agent: Code Quality> started
  <Sub-Agent: Code Quality> completed — [summary]
  <Sub-Agent: Security> started
  <Sub-Agent: Security> completed — [summary]
  <Sub-Agent: Performance> started
  <Sub-Agent: Performance> completed — [summary]
  <Sub-Agent: Testing> started
  <Sub-Agent: Testing> completed — [summary]
</Review Complete>
```

### Phase 4: Compound

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

**If using Ralph:** `progress.txt` = short-term (feature-scoped), `LEARNINGS.md` = long-term (project-scoped). Migrate valuable learnings when archiving progress.txt.

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
