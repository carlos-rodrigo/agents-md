---
name: review-pr
description: "Code review a pull request. Triggers on: review pr, review this pr, code review, check this branch."
---

# Review PR

Perform a thorough code review focused on correctness, maintainability, and alignment with codebase patterns.

## Process

### 1. Get Context

```bash
# If PR number given
gh pr view <number> --json title,body,additions,deletions,files
gh pr diff <number>

# If branch given
git diff main...<branch>
```

Understand: What is this PR trying to do?

### 2. Review Checklist

**Correctness**
- [ ] Does it do what the PR description says?
- [ ] Edge cases handled?
- [ ] Error handling adequate?

**Architecture**
- [ ] Follows existing patterns in codebase?
- [ ] Changes in the right layer? (not UI logic in API, etc.)
- [ ] Appropriate abstraction level?

**Code Quality**
- [ ] Clear naming?
- [ ] No unnecessary complexity?
- [ ] DRY without over-abstraction?

**Testing**
- [ ] Tests cover the behavior change?
- [ ] Tests are behavior-focused, not implementation-focused?

**Security** (if applicable)
- [ ] Input validation?
- [ ] Auth checks?
- [ ] No secrets exposed?

### 3. Explore if Needed

If something looks off, explore the codebase to understand existing patterns before commenting.

### 4. Provide Feedback

Format:

```markdown
## Summary

One paragraph: what this PR does and overall assessment.

## Must Fix

Critical issues that block merge:
- **[file:line]** Issue description

## Should Fix

Non-blocking but important:
- **[file:line]** Issue description

## Suggestions

Optional improvements:
- **[file:line]** Suggestion

## Questions

Things to clarify:
- Question about design choice?
```

## Guidelines

- **Be specific** — reference file:line, show code
- **Explain why** — don't just say "bad", explain the problem
- **Suggest alternatives** — if you critique, offer a better approach
- **Acknowledge good work** — call out clever solutions
- **Assume good intent** — ask before assuming mistakes
