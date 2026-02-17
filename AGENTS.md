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

> Plan → Design → Create Tasks → Implement → Ship

### Session Start (Triage)

For non-trivial requests, ask before acting:

> **How do you want to work on this?**
> 1. **Plan first** — Collaborative planning → PRD → Design → tasks → implementation
> 2. **Straight to code** — Skip planning, go to Implement → Ship
> 3. **Run the loop** — Pick up existing tasks and execute autonomously

Skip triage for trivial requests (typos, small fixes, quick questions).

---

### Phase 1: Plan (PRD)

**Collaborative: Agent + Human. Requires human approval.**

1. **Research** using sub-agents: researcher (state of the art) + librarian (library APIs) in parallel
2. Research codebase: search for patterns, prior art, `git log`, docs, `AGENTS.md`, `LEARNINGS.md`
3. Ask clarifying questions informed by research (use lettered options for fast answers)
4. Load the `prd` skill
5. Generate PRD and save to `.features/{feature}/prd.md`
6. Present PRD to user for approval
7. If changes needed → iterate until approved

**Detail level:** Minimal (< 2h), Standard (1-2d), Comprehensive (multi-day)

**Do NOT proceed to design until human approves the PRD.**

---

### Phase 2: Design

**Collaborative: Agent + Human. Requires human approval.**

After PRD is approved:

1. Load the `design-solution` skill
2. Read the approved PRD from `.features/{feature}/prd.md`
3. **Scout** the codebase (sub-agent, fast/cheap) to map reusable components, hooks, APIs, services, patterns
4. **Librarian** (sub-agent) to investigate library internals for integration points
5. Generate a technical design document and save to `.features/{feature}/design.md`
6. **Oracle** (sub-agent) to validate architecture trade-offs and edge cases
7. Present design to user for approval
8. If changes needed → iterate until approved

**Do NOT proceed to tasks until human approves the design.**

---

### Phase 3: Create Tasks

After design is approved:

1. Load the `simple-tasks` skill
2. Read the approved PRD and design from `.features/{feature}/`
3. Create tasks folder: `.features/{feature}/tasks/`
4. Break user stories into implementable tasks derived from the design
5. Create `.features/{feature}/tasks/_active.md` with progress checklist
6. Each task must be completable in one iteration (one context window)

**Parallel features:** Each feature gets its own folder. Multiple agents can work different features simultaneously.

**Rule of thumb:** If you can't describe the change in 2-3 sentences, split it.

---

### Phase 4: Implement Task

For each task:

1. Load the `implement-task` skill
2. Pass the task file path: `.features/{feature}/tasks/NNN-task-name.md`

The skill handles four phases: Context → Code → Review → Compound.

- **Review** uses 4 oracle sub-agents in parallel (code quality, security, performance, testing) — read-only analysis, then main agent applies fixes.

Create a new branch if on main before starting. One task per session.

**Do NOT skip any phase.** The skill defines each phase in detail.

---

### Phase 5: Ship

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

## Sub-agents

Specialized agents available via the `subagent` tool. Each runs in an isolated context window with its own model.

| Agent | Model | Purpose | When to use |
|-------|-------|---------|-------------|
| **oracle** | gpt-5.3-codex | Deep reasoning, second opinion | Complex debugging, architecture decisions, code review |
| **librarian** | Sonnet | Code research via GitHub | Understanding library internals, cross-repo investigation |
| **researcher** | Sonnet | Internet research | State of the art, technology comparisons, best practices |
| **scout** | Haiku | Fast codebase recon | Quick mapping before deeper analysis (cheap, use liberally) |

**Modes:** single (one agent), parallel (multiple agents simultaneously), chain (sequential with `{previous}` handoff).

**When to use autonomously:** Use scout and researcher freely. Use oracle for non-trivial decisions. Use librarian when integrating unfamiliar libraries. The main agent can decide when sub-agents add value — don't force them on trivial tasks.

---

## Golden Rule

> If not confident, do not act.

Stop. State uncertainty. List assumptions. Ask.
