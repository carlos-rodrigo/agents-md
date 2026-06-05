---
name: product-strategy
description: "Shape a raw product idea into a buildable strategy before PRD/design/tasks. Triggers on: product idea, product strategy, shape this idea, find the MVP, what should we build first, right interface, first wedge."
---

# Product Strategy

Use this skill when the user has a raw or ambiguous product idea and needs to shape it into a buildable strategy before writing a PRD, technical design, or tasks.

This skill is upstream of `prd`, `design-solution`, and `simple-tasks`.

## When to use

Use when:
- the user says they have a product idea,
- the user asks what to build first,
- the product direction, interface, or MVP is unclear,
- the work involves a broad new product or major feature,
- agent behavior, domain boundaries, trust, privacy, or workflow semantics matter,
- a normal PRD would be premature because the first wedge is not yet clear.

Skip when:
- requirements are already clear enough for a PRD,
- the user only needs implementation planning,
- the change is small or bounded.

If skipping, say so and suggest `prd`, `design-solution`, `simple-tasks`, or direct implementation.

## Process

### 1. Capture the raw idea

Save the starting brief or summarize it in chat. If the feature name is known, prefer:

```text
docs/features/{feature}/prd.md
```

or a strategy section inside that PRD. If the idea is still too early for a PRD, use:

```text
docs/features/{feature}/strategy.md
```

Do not force a final feature name too early; propose one and confirm when needed.

### 2. Identify the product thesis

Clarify only what changes strategic direction:
- core problem,
- target user/customer,
- product promise,
- emotional outcome,
- key concepts,
- non-goals,
- why existing tools are insufficient.

Prefer concise strategy statements over long requirements prose.

### 3. Choose the first wedge

Force the most important strategic decision:

```text
The first repeated behavior we want is: ____.
```

A wedge is not a feature list. It is the habit or loop the product must earn first.

Examples:
- capture anything and never lose it,
- prepare a weekly planning ritual,
- approve agent-proposed changes,
- monitor a workflow until resolution.

### 4. Challenge interface assumptions

Before writing scope, discuss the right primary interface:
- conversation-first,
- dashboard-first,
- workflow-first,
- mobile-first,
- messaging-channel-first,
- API/control-plane-first,
- ambient notification-first.

Ask:
- What should users do naturally?
- What should users never have to learn?
- What is visible experience vs hidden system of record?
- What must be inspectable for trust?

### 5. Define the MVP loop

Write the MVP as an end-to-end loop, not just a list of features:

```text
user action
-> system interpretation/action
-> stored truth or result
-> feedback/resurfacing
-> success moment
```

Include a 7-day or first-use success metric when possible.

### 6. Define domain boundaries

Name the concepts the product must keep distinct. For each concept, define:
- what it means,
- what it is not,
- when it is created,
- whether it is source of truth,
- whether approval is required.

For agentic products, explicitly separate:
- raw input,
- model interpretation,
- proposed action,
- accepted domain truth,
- audit/source history.

### 7. Define trust, permission, and authority rules

For products involving users, agents, private data, or external actions, define:
- who can see what,
- who can approve what,
- what the agent can do directly,
- what the agent can only propose,
- what the agent may not do,
- what must be audited,
- how source/citation/inspection works.

### 8. Use Oracle for strategy review when useful

Use an oracle review when:
- scope is broad or ambiguous,
- MVP risk is high,
- domain boundaries are non-obvious,
- agent autonomy or trust is central,
- multi-tenant/security/privacy concerns exist,
- there are multiple plausible interface directions.

Ask Oracle to review:
- strongest decisions,
- ambiguities and risks,
- MVP scope discipline,
- interface fit,
- domain boundaries,
- trust/permission gaps,
- next decisions before implementation.

### 9. Write durable outputs

When direction stabilizes, write concise docs under:

```text
docs/features/{feature}/
```

Recommended outputs:
- `prd.md` — product strategy, wedge, goals, scope, non-goals, verification.
- `mvp-scope.md` — first loop, in/out of scope, success metric, open decisions.
- `system-domain-model.md` — domain concepts and source-of-truth boundaries, when useful.

Keep docs decision-grade, not exhaustive.

### 10. Hand off to design/tasks

After strategy is stable:
- use `design-solution` when technical tradeoffs remain,
- use `simple-tasks` when implementation should be split into executable tasks,
- use `implement-task` only after tasks are implementation-ready.

## Output style

Prefer a clear change story:

```text
Current unclear idea
-> chosen first wedge
-> interface thesis
-> MVP loop
-> domain/trust boundaries
-> next artifact
```

Be opinionated but mark uncertainty. Do not invent business logic; ask when a decision changes scope or risk.

## Checklist

Before leaving product strategy, confirm:
- [ ] First wedge is explicit.
- [ ] Primary interface thesis is explicit.
- [ ] MVP loop is written as an end-to-end behavior.
- [ ] Non-goals are clear.
- [ ] Core domain concepts are distinct.
- [ ] Agent/user/system authority boundaries are defined if relevant.
- [ ] Trust, audit, privacy, and permissions are addressed if relevant.
- [ ] Success metric or verification signal exists.
- [ ] Next step is PRD, design, tasks, or implementation.
