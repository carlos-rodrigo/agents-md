---
name: prd
description: "Frame a feature strategy packet and PRD with BDD-style requirements. Triggers on: create a prd, write prd, plan feature, requirements for, feature strategy, user stories."
---

# Feature Strategy / PRD Compatibility

Use this skill when the user needs product/system intent clarified before design or implementation.

Default artifact:

```text
docs/features/{feature}/strategy.md
```

Create `prd.md` only when the user asks for a PRD, BDD requirements, user stories, or an external process needs it.

## Layers

| Layer | Artifact | Owns |
| --- | --- | --- |
| Strategy | `strategy.md` | why, target user, outcome, scope, constraints |
| Product definition | `prd.md` | accepted behavior, BDD scenarios, acceptance criteria |
| System model | `system-model.md` | current intended architecture, workflows, boundaries |
| ADRs | `docs/adrs/{architecture,api,web}.md` | system-level architecture rationale |
| Execution | `.features/.../tasks/*.md` | one vertical slice, task-level design, feedback loop |

Default flow:

```text
raw idea → strategy.md → optional prd.md → system-model.md → optional ADR update → compact tasks with feedback loops
```

Do not create generic `decisions.md` or `proof.md` by default.

## Progressive disclosure rule

Strategy/PRD can be human-readable, but keep them layered:

- Put outcome, scope, and open questions near the top.
- Keep requirements observable and design-ready, not implementation-heavy.
- Link to architecture/tasks instead of duplicating details.
- Defer task-level checks to task feedback loops.

## Process

1. Ask only questions that affect scope, constraints, acceptance behavior, or risk.
2. Read/search enough reality to avoid invented requirements.
3. Capture strategy: user, problem, outcome, behavior, scope, constraints, risks.
4. Identify user-owned decisions and agent-owned implementation choices.
5. Name success evidence at the product level; detailed verification goes in task feedback loops.
6. Write/update `strategy.md`; write/update `prd.md` only when needed.
7. Hand off to `design-solution` or `simple-tasks` when behavior is clear enough.

## Strategy template

```markdown
# Strategy: {Feature Name}

## Outcome

- Target user:
- Problem:
- Desired result:
- Success signal:

## Desired behavior

Plain-language system behavior after the change.

## Scope

- In:
- Out:

## Constraints

- Product/UX/API/security/performance/migration constraints.

## Open questions

| Question | Owner | Blocks |
| --- | --- | --- |
| ... | user/agent | design/task/none |

## Risks / assumptions

- Risk: ... → how we will know:

## Agent-owned choices

- Local implementation choices the agent may make without changing intent.

## Next

- PRD: needed/not needed
- System model: needed/not needed
- Tasks: needed/not needed
```

## PRD template (only when needed)

````markdown
# PRD: {Feature Name}

## Summary

- User:
- Capability:
- Outcome:

## Requirements

### Story: {Capability}

As a {actor}, I want {capability}, so that {outcome}.

```gherkin
Scenario: Main path
  Given ...
  When ...
  Then ...

Scenario: Edge/error/permission case
  Given ...
  When ...
  Then ...
```

Acceptance:
- [ ] Observable result:
- [ ] Boundary/error result:
- [ ] Permission/empty state, if relevant:

## Non-goals

- ...

## Constraints / dependencies

- ...

## Open questions

- ...
````

A PRD is ready for design when stories, acceptance criteria, constraints, and open questions are clear enough that architecture does not need to invent product behavior.

## Next step

After approval:

- use `design-solution` for high-level architecture/workflows/boundaries,
- update `docs/adrs/` if system-level architecture rationale changes,
- use `simple-tasks` for compact agent-readable tasks with feedback loops,
- execute only ready tasks.
