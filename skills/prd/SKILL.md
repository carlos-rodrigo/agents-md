---
name: prd
description: "Generate a Product Requirements Document (PRD) for a new feature. Use when planning a feature, starting a new project, or when asked to create a PRD. Triggers on: create a prd, write prd for, plan this feature, requirements for, spec out."
---

# PRD Generator

Create detailed Product Requirements Documents that are clear, actionable, and suitable for implementation.

---

## The Job

1. Receive a feature description from the user
2. **Research** the landscape using sub-agents (researcher + librarian)
3. Ask 3-5 essential clarifying questions (with lettered options)
4. Generate a structured PRD informed by research
5. Save to `.features/{feature}/prd.md`
6. Call `open_file` for the PRD you just created (`mode: "view"`) so the user can review it immediately

**Important:** Do NOT start implementing. Just create the PRD.

---

## Step 0: Research (Sub-agents)

Before asking clarifying questions, gather intelligence using sub-agents. Use the `subagent` tool in **parallel** to run both simultaneously:

- **Researcher**: Investigate the state of the art, common approaches, and best practices for the problem domain
- **Librarian**: Search for how relevant libraries/frameworks solve this, check APIs you'll likely integrate with

```
subagent({ tasks: [
  { agent: "researcher", task: "Research the state of the art for: {feature description}. Focus on common approaches, best practices, and trade-offs." },
  { agent: "librarian", task: "Search for how relevant libraries and frameworks handle: {feature description}. Show key APIs, patterns, and integration points." }
]})
```

**Use research findings to:**
- Inform clarifying questions (offer options based on what you found)
- Identify approaches the user may not have considered
- Spot potential pitfalls early
- Reference real-world implementations in the PRD

**When to skip research:** Trivial features, well-understood domains, or when the user explicitly says to skip it.

---

## Step 1: Clarifying Questions

Ask only critical questions where the initial prompt is ambiguous. Focus on:

- **Problem/Goal:** What problem does this solve?
- **Core Functionality:** What are the key actions?
- **Scope/Boundaries:** What should it NOT do?
- **Success Criteria:** How do we know it's done?

### Format Questions Like This:

```
1. What is the primary goal of this feature?
   A. Improve user onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Other: [please specify]

2. Who is the target user?
   A. New users only
   B. Existing users only
   C. All users
   D. Admin users only

3. What is the scope?
   A. Minimal viable version
   B. Full-featured implementation
   C. Just the backend/API
   D. Just the UI
```

This lets users respond with "1A, 2C, 3B" for quick iteration.

---

## Step 2: PRD Structure

Generate the PRD with these sections:

### 1. Introduction/Overview

Brief description of the feature and the problem it solves.

### 2. Goals

Specific, measurable objectives (bullet list).

### 3. User Stories

Each story needs:

- **Title:** Short descriptive name
- **Description:** "As a [user], I want [feature] so that [benefit]"
- **Acceptance Criteria:** Verifiable checklist of what "done" means

Each story should be small enough to implement in one focused session.

**Format:**

```markdown
### US-001: [Title]

**Description:** As a [user], I want [feature] so that [benefit].

**BDD Spec:**
- Given: [precondition/context]
- When: [action taken]
- Then: [expected outcome]

**Acceptance Criteria:**

- [ ] Specific verifiable criterion
- [ ] Another criterion
- [ ] npm run typecheck passes

**Feedback Loop:**

Setup: [what needs to be running]

Verification:
1. [Action] → Expected: [specific result]
2. [Action] → Expected: [specific result]

Edge cases:
- [Edge case action] → Expected: [result]

Regression: [run full test suite command]
```

**Important:**

- Load the **feedback-loop** skill for guidance on writing actionable feedback loops.
- Every user story MUST have a **Feedback Loop** section — not just acceptance criteria checkboxes, but concrete, numbered steps an agent can execute to verify the work.
- Fastest loop first: prefer automated tests > CLI > API > browser. Use agent-browser only for visual verification.
- Each step must specify the **action** AND the **expected result**. "Verify it works" is not a step.
- Include at least 2-3 **edge cases** that stress the happy path.
- For UI stories: describe the page URL, exact actions to perform, and what the agent should see.

### 4. Functional Requirements

Numbered list of specific functionalities:

- "FR-1: The system must allow users to..."
- "FR-2: When a user clicks X, the system must..."

Be explicit and unambiguous.

### 5. Non-Goals (Out of Scope)

What this feature will NOT include. Critical for managing scope.

### 6. Design Considerations (Optional)

- UI/UX requirements
- Link to mockups if available
- Relevant existing components to reuse

### 7. Technical Considerations (Optional)

- Known constraints or dependencies
- Integration points with existing systems
- Performance requirements

### 8. Success Metrics

How will success be measured?

- "Reduce time to complete X by 50%"
- "Increase conversion rate by 10%"

### 9. Open Questions

Remaining questions or areas needing clarification.

---

## Writing for Junior Developers

The PRD reader may be a junior developer or AI agent. Therefore:

- Be explicit and unambiguous
- Avoid jargon or explain it
- Provide enough detail to understand purpose and core logic
- Number requirements for easy reference
- Use concrete examples where helpful

---

## Output

- **Format:** Markdown (`.md`)
- **Location:** `.features/{feature}/prd.md`
- **Feature folder:** kebab-case derived from feature name (e.g., "User Auth" → `.features/user-auth/prd.md`)
- **After saving:** Call `open_file({ path: ".features/{feature}/prd.md", mode: "view" })`

---

## Example PRD

```markdown
# PRD: Task Priority System

## Introduction

Add priority levels to tasks so users can focus on what matters most. Tasks can be marked as high, medium, or low priority, with visual indicators and filtering to help users manage their workload effectively.

## Goals

- Allow assigning priority (high/medium/low) to any task
- Provide clear visual differentiation between priority levels
- Enable filtering and sorting by priority
- Default new tasks to medium priority

## User Stories

### US-001: Add priority field to database

**Description:** As a developer, I need to store task priority so it persists across sessions.

**BDD Spec:**
- Given: The tasks table exists
- When: A new task is created without specifying priority
- Then: The task is saved with priority 'medium'

**Acceptance Criteria:**

- [ ] Add priority column to tasks table: 'high' | 'medium' | 'low' (default 'medium')
- [ ] Generate and run migration successfully
- [ ] npm run typecheck passes

**Feedback Loop:**

Setup: `npm run db:migrate` then `npm run dev`

Verification:
1. Run `npm run test -- --grep "priority"` → migration test passes
2. Run `npm run typecheck` → Task type includes priority field, no errors
3. `curl -X POST localhost:3000/api/tasks -d '{"title":"Test"}' -H 'Content-Type: application/json'` → 201, response includes `"priority": "medium"`
4. `curl -X POST localhost:3000/api/tasks -d '{"title":"Test","priority":"high"}' -H 'Content-Type: application/json'` → 201, response includes `"priority": "high"`

Edge cases:
- POST with `"priority": "urgent"` → 400 validation error
- POST with `"priority": ""` → 400 or defaults to "medium"

Regression: `npm run test` → all existing tests pass

### US-002: Display priority indicator on task cards

**Description:** As a user, I want to see task priority at a glance so I know what needs attention first.

**BDD Spec:**
- Given: A task with priority 'high' exists
- When: The task list is displayed
- Then: The task shows a red priority badge

**Acceptance Criteria:**

- [ ] Each task card shows colored priority badge (red=high, yellow=medium, gray=low)
- [ ] Badge is visible without hovering or clicking
- [ ] npm run typecheck passes

**Feedback Loop:**

Setup: `npm run dev`, seed DB with tasks at all three priority levels

Verification:
1. Run `npm run test -- --grep "PriorityBadge"` → component tests pass
2. Run `npm run typecheck` → no errors
3. Agent-browser: Open http://localhost:3000/tasks → each task card shows a small colored badge next to the title (red for high, yellow for medium, gray for low)
4. Agent-browser: Confirm badge is always visible — not hidden behind hover or click

Edge cases:
- Agent-browser: Task with no priority value → should show gray/default badge, not crash
- Agent-browser: Page with 50+ tasks → badges render without layout shift or overlap

Regression: `npm run test` → all existing tests pass

### US-003: Add priority selector to task edit

**Description:** As a user, I want to change a task's priority when editing it.

**BDD Spec:**
- Given: A task edit modal is open
- When: I select 'high' from the priority dropdown
- Then: The task priority is saved as 'high'

**Acceptance Criteria:**

- [ ] Priority dropdown in task edit modal
- [ ] Shows current priority as selected
- [ ] Saves immediately on selection change
- [ ] npm run typecheck passes

**Feedback Loop:**

Setup: `npm run dev`, ensure at least one task with priority "medium" exists

Verification:
1. Run `npm run test -- --grep "priority selector"` → tests pass
2. Run `npm run typecheck` → no errors
3. Agent-browser: Open http://localhost:3000/tasks → click "Edit" on a medium-priority task → verify dropdown shows "Medium" selected
4. Agent-browser: Change dropdown to "High" → close modal → verify task now shows red badge
5. `curl localhost:3000/api/tasks/{id}` → confirm response has `"priority": "high"`

Edge cases:
- Agent-browser: Open edit, change priority, then cancel → priority should NOT change
- Agent-browser: Rapidly toggle priority between values → no flickering, final value persists

Regression: `npm run test` → all existing tests pass

### US-004: Filter tasks by priority

**Description:** As a user, I want to filter the task list to see only high-priority items when I'm focused.

**BDD Spec:**
- Given: Tasks with mixed priorities exist
- When: I select 'High' from the priority filter
- Then: Only high-priority tasks are displayed

**Acceptance Criteria:**

- [ ] Filter dropdown with options: All | High | Medium | Low
- [ ] Filter persists in URL params
- [ ] Empty state message when no tasks match filter
- [ ] npm run typecheck passes

**Feedback Loop:**

Setup: `npm run dev`, seed DB with tasks across all three priority levels

Verification:
1. Run `npm run test -- --grep "priority filter"` → tests pass
2. Run `npm run typecheck` → no errors
3. Agent-browser: Open http://localhost:3000/tasks → select "High" from priority filter → only tasks with red badges visible
4. Agent-browser: Check URL → should contain `?priority=high`
5. Agent-browser: Refresh page → filter should persist (URL-driven state)
6. Agent-browser: Select "Low" → verify URL updates to `?priority=low`, only gray badges shown

Edge cases:
- Agent-browser: Select filter with no matching tasks → empty state message appears (not blank page)
- Agent-browser: Select "All" → all tasks visible again, URL param removed
- Direct URL: Navigate to `/tasks?priority=high` → page loads with filter pre-applied

Regression: `npm run test` → all existing tests pass

## Functional Requirements

- FR-1: Add `priority` field to tasks table ('high' | 'medium' | 'low', default 'medium')
- FR-2: Display colored priority badge on each task card
- FR-3: Include priority selector in task edit modal
- FR-4: Add priority filter dropdown to task list header
- FR-5: Sort by priority within each status column (high → medium → low)

## Non-Goals

- No priority-based notifications or reminders
- No automatic priority assignment based on due date
- No priority inheritance for subtasks

## Technical Considerations

- Reuse existing badge component with color variants
- Filter state managed via URL search params
- Priority stored in database, not computed

## Success Metrics

- Users can change priority in <2 clicks
- High-priority tasks immediately visible at top of lists
- No regression in task list performance

## Open Questions

- Should priority affect task ordering within a column?
- Should we add keyboard shortcuts for priority changes?
```

---

## Checklist

Before saving the PRD:

- [ ] Asked clarifying questions with lettered options
- [ ] Incorporated user's answers
- [ ] User stories are small and specific (one behavior each)
- [ ] Each user story has BDD spec (Given/When/Then)
- [ ] Each user story has a **Feedback Loop** section (load feedback-loop skill for guidance)
- [ ] Feedback loops include setup, numbered verification steps, edge cases, and regression checks
- [ ] Functional requirements are numbered and unambiguous
- [ ] Non-goals section defines clear boundaries
- [ ] Saved to `.features/{feature}/prd.md`
- [ ] Opened `.features/{feature}/prd.md` with `open_file` in `view` mode

---

## Next Step

After PRD is reviewed and approved, create the technical design:

> Say **"create design"** (or **"pro"**) to generate the technical design document using the design-solution skill.
> The design will be saved to `.features/{feature}/design.md` alongside the PRD.
> After design is approved, say **"create tasks"** to break it into implementable tasks.
> Then say **"run the loop"** to start autonomous execution.
