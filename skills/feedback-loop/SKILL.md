---
name: feedback-loop
description: "Define actionable feedback loops for verifying features. Use when creating acceptance criteria, defining how to test a feature, or setting up verification strategies. Ensures agents can validate their own work against reality. Triggers on: feedback loop, how to test, verification plan, define testing, acceptance criteria."
---

# Feedback Loop

Define **how** to verify that a feature works — not vaguely, but with concrete, reproducible steps that an agent can execute independently.

> "Agents are most powerful when they can validate their work against reality. When they have feedback loops."
> — Lewis Metcalf, Amp

---

## The Problem

Saying "verify it works" is useless. An agent needs to know:
- **Where** to look (URL, command, test file)
- **What** to do (actions, inputs, scenarios)
- **What** to expect (specific output, visual result, passing tests)

Without this, the agent either skips verification or takes random screenshots hoping for the best.

---

## The Job

Given a user story or feature, produce a **Feedback Loop** section that defines:

1. **What type of verification** applies (automated tests, browser, CLI, API)
2. **Exact steps** to reproduce and verify
3. **Expected results** — what "correct" looks like
4. **Edge cases** to check — experiments that stress the happy path

The output should be concrete enough that an agent can copy-paste commands and know immediately if something is wrong.

---

## Verification Types

Pick the right verification for the work. Most features need more than one.

### 1. Automated Tests (Fastest — always prefer)

The inner loop should be as fast as possible. Tests are text, agents love text.

```markdown
**Feedback Loop:**
1. Run `npm run test -- --grep "priority"` → all tests pass
2. Run `npm run typecheck` → no errors
3. Run `npm run lint` → no warnings in changed files
```

**When to use:** Always. Every story should have at least one automated check.

### 2. CLI / Headless Verification (Fast — great for logic)

When the feature has complex logic, build or use a CLI tool to validate without a browser.

```markdown
**Feedback Loop:**
1. Run `npx tsx scripts/validate-invoice.ts --status=overdue --days=45`
2. Expected output: `Invoice #123: status=overdue, penalty=4.5%`
3. Run with edge case: `--days=0` → Expected: `status=current, penalty=0%`
4. Run with edge case: `--days=-1` → Expected: error "Invalid days value"
```

**When to use:** Business logic, data processing, calculations, API logic — anything that can be validated without a UI.

### 3. API Verification (Medium speed — for backend features)

Test endpoints directly with curl or a script.

```markdown
**Feedback Loop:**
1. Start dev server: `npm run dev`
2. Create: `curl -X POST localhost:3000/api/tasks -d '{"title":"Test","priority":"high"}' -H 'Content-Type: application/json'`
   → Expected: 201, response includes `"priority": "high"`
3. Read back: `curl localhost:3000/api/tasks/{id}`
   → Expected: task has `"priority": "high"`
4. Default: `curl -X POST localhost:3000/api/tasks -d '{"title":"No priority"}'`
   → Expected: 201, response includes `"priority": "medium"`
```

**When to use:** New or modified API endpoints, backend logic.

### 4. Agent-Browser Verification (Slowest — for visual/UI work)

Use the **agent-browser** skill for UI verification. This is the slowest loop — use it for final visual confirmation, not for debugging.

```markdown
**Feedback Loop:**
1. Navigate to `http://localhost:3000/tasks`
2. Verify: each task card shows a colored badge (red=high, yellow=medium, gray=low)
3. Click "Edit" on a task with priority "medium"
4. Verify: priority dropdown shows "Medium" selected
5. Change to "High" → close modal
6. Verify: task now shows red badge
7. Edge case: create a task without setting priority → verify it defaults to yellow (medium) badge
```

**When to use:** UI components, visual design, layout, interactions. Always after automated tests pass first.

---

## Structure of a Good Feedback Loop

Every feedback loop should have these elements:

### Setup
What needs to be running or configured before testing:
```markdown
**Setup:** Run `npm run dev` (server on localhost:3000). Seed DB: `npm run db:seed`
```

### Verification Steps
Ordered, numbered steps. Each step has an action and expected result:
```markdown
1. [Action] → Expected: [specific result]
2. [Action] → Expected: [specific result]
```

### Edge Cases / Experiments
At least 2-3 edge cases that stress the happy path. Use the "experiment" mindset — make the feature break:
```markdown
**Edge cases:**
- Empty input: [action] → Expected: [validation error / graceful handling]
- Boundary value: [action] → Expected: [correct behavior at limits]
- Rapid interaction: [action] → Expected: [no race conditions / debounce works]
```

### Regression Check
Verify existing functionality isn't broken:
```markdown
**Regression:** Run `npm run test` → all existing tests still pass
```

---

## Examples

### Example 1: Data Model Change (US-001: Add priority field)

```markdown
**Feedback Loop:**

Setup: `npm run db:migrate` then `npm run dev`

Verification:
1. Run `npm run test -- --grep "priority"` → migration test passes
2. Run `npm run typecheck` → Task type includes priority field, no errors
3. API check: `curl -X POST localhost:3000/api/tasks -d '{"title":"Test"}' -H 'Content-Type: application/json'`
   → 201, response body includes `"priority": "medium"` (default)
4. API check: `curl -X POST localhost:3000/api/tasks -d '{"title":"Test","priority":"high"}'`
   → 201, response body includes `"priority": "high"`

Edge cases:
- Invalid priority: POST with `"priority": "urgent"` → 400 validation error
- Missing title: POST with `"priority": "high"` only → 400 (title required)

Regression: `npm run test` → all existing tests pass
```

### Example 2: UI Component (US-002: Priority badges on task cards)

```markdown
**Feedback Loop:**

Setup: `npm run dev`, ensure DB has tasks with all three priority levels

Verification:
1. Run `npm run test -- --grep "PriorityBadge"` → component tests pass
2. Run `npm run typecheck` → no errors
3. Agent-browser: Open http://localhost:3000/tasks
   → Each task card shows a small colored badge: red for high, yellow for medium, gray for low
   → Badge is visible without hovering — it's inline next to the task title
4. Agent-browser: Open http://localhost:3000/tasks, find a "high" priority task
   → Badge is red, text says "High" (or shows a red dot — match design spec)

Edge cases:
- Agent-browser: If a task somehow has no priority value → verify no crash, show gray/default badge
- Agent-browser: Page with 50+ tasks → verify badges render without layout shift

Regression: `npm run test` → all existing tests pass
```

### Example 3: Complex Logic (Invoice penalty calculation)

```markdown
**Feedback Loop:**

Setup: `npm run dev`

Verification:
1. Run `npx tsx scripts/test-penalty.ts --days=30 --amount=1000`
   → Output: `penalty=0, total=1000` (grace period)
2. Run `npx tsx scripts/test-penalty.ts --days=31 --amount=1000`
   → Output: `penalty=15, total=1015` (1.5% after grace period)
3. Run `npx tsx scripts/test-penalty.ts --days=90 --amount=1000`
   → Output: `penalty=50, total=1050` (capped at 5%)

Edge cases:
- `--days=0` → `penalty=0` (same day, no penalty)
- `--days=-5` → error: "Days overdue cannot be negative"
- `--amount=0` → `penalty=0, total=0`
- `--days=365 --amount=1000000` → `penalty=50000` (cap applies to large amounts too)

Regression: `npm run test` → all existing tests pass
```

---

## Principles

1. **Fastest loop first.** Prefer tests > CLI > API > browser. Use browser only for visual verification after everything else passes.
2. **Reproducible.** Every verification step must produce the same result every time. No "check if it looks right" — specify what "right" is.
3. **Experiments, not spot checks.** Don't just test the happy path. Find the edges. What happens with empty input? Boundary values? Concurrent access? The goal is to break it.
4. **Agent-executable.** Every step must be something an agent can do with its tools (bash, agent-browser). No "ask a human to check" or "manually verify."
5. **Progressive confidence.** Start with fast automated checks, escalate to slower visual checks only when the fast ones pass. This keeps the inner loop tight.
6. **Build playgrounds.** For complex or visual features, consider creating a dedicated test page or CLI tool that makes the feature's behavior inspectable. URL query params for state, headless mode for logic — make it easy to set up and share experiments.

---

## When This Skill Is Used

This skill is referenced by other skills in the workflow:

- **PRD skill**: Uses this to define the feedback loop section in each user story's acceptance criteria
- **Design skill**: Uses this to validate the implementation plan per user story has testable outcomes
- **Implement-task skill**: Uses this to know exactly how to verify the work is done

The feedback loop defined at PRD time becomes the **definition of done** that flows through design and implementation. It should be refined as the design becomes more specific (e.g., exact URLs, exact test commands).

---

## Checklist

Before finalizing a feedback loop:

- [ ] At least one automated test verification (test command + expected result)
- [ ] Verification steps are numbered with specific actions and expected results
- [ ] At least 2-3 edge cases that stress the happy path
- [ ] Browser verification (if UI) describes page, actions, and expected visual result
- [ ] Regression check included (run full test suite)
- [ ] Every step is agent-executable (no human-only verification)
- [ ] Setup instructions are explicit (what to run, what to seed)
