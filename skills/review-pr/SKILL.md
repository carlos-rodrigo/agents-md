---
name: review-pr
description: "Code review a pull request or branch, including feature-flow strategy/proof alignment when docs/features packets are present. Triggers on: review pr, review this pr, code review, check this branch."
---

# Review PR

Review a pull request or branch for correctness, maintainability, verification, and alignment with the stated product/system intent.

If the change includes a feature-flow packet under `docs/features/{slug}/`, review both code and the packet:
- strategy,
- system model,
- decisions,
- proof,
- work orders,
- execution reports,
- review/teach-back.

---

## 1. Get Context

```bash
# If PR number given
gh pr view <number> --json title,body,additions,deletions,files
gh pr diff <number>

# If branch given
git diff main...<branch>
```

Understand:
- what the PR claims to do,
- what behavior changed,
- which files and docs changed,
- what proof was run.

If a feature packet exists, inspect:

```text
docs/features/{slug}/strategy.md
docs/features/{slug}/system-model.md
docs/features/{slug}/decisions.md
docs/features/{slug}/proof.md
docs/features/{slug}/work-orders/
docs/features/{slug}/execution/
docs/features/{slug}/review.md
```

---

## 2. Review Checklist

### Correctness
- [ ] Does the code do what the PR/strategy says?
- [ ] Edge cases handled?
- [ ] Error handling adequate?
- [ ] No silent behavior changes outside scope?

### Strategy alignment (feature-flow)
- [ ] Implementation preserves decisions in `decisions.md`.
- [ ] Work Orders, if present, are `done` only when execution reports exist.
- [ ] Execution reports record repo-relative changed files, proof, deviations, and follow-up.
- [ ] `review.md` or PR summary teaches the final system rule.
- [ ] No durable local absolute path leakage.

### Architecture
- [ ] Follows existing codebase patterns?
- [ ] Changes in the right layer?
- [ ] Appropriate abstraction level?
- [ ] No unnecessary coupling?

### Code Quality
- [ ] Clear names?
- [ ] No unnecessary complexity?
- [ ] DRY without premature abstraction?
- [ ] No formatting-only churn mixed with behavior change?

### Testing / Proof
- [ ] Tests cover behavior change?
- [ ] Proof uses real inputs/boundaries when relevant?
- [ ] Regression gate passed?
- [ ] Manual/E2E checks recorded when needed?

### Security / contracts
- [ ] Input validation?
- [ ] Auth/permission checks preserved?
- [ ] No secrets/PII exposed?
- [ ] Schema/API/contract changes are intentional and documented?

---

## 3. Explore if Needed

If something looks off, inspect existing patterns before commenting.

Use targeted search/read. Do not assume behavior from filenames alone.

---

## 4. Feedback Format

```markdown
## Summary

One paragraph: what this PR does and overall assessment.

## Must Fix

Merge blockers:
- **[file:line]** Issue description, why it matters, recommended fix.

## Should Fix

Important but not necessarily blocking:
- **[file:line]** Issue description, why it matters, recommended fix.

## Suggestions

Optional improvements:
- **[file:line]** Suggestion.

## Strategy / Proof Alignment

If a feature packet exists:
- Alignment: match/mismatch with strategy and decisions.
- Proof: what passed, what is missing.
- Follow-up: review/reown/memory recommendation if useful.

## Questions

- Clarifying question about a design/product choice.
```

---

## Guidelines

- Be specific: file:line, concrete behavior, concrete fix.
- Explain why; do not just label code as bad.
- Prefer small fixes over rewrites.
- Ask when intent is unclear.
- Acknowledge good work.
- Do not invent requirements beyond the PR/strategy.
