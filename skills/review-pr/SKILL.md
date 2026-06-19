---
name: review-pr
description: "Code review a pull request or branch, including PRD, architecture, and feedback-loop alignment when feature packets are present. Triggers on: review pr, review this pr, code review, check this branch."
---

# Review PR

Review correctness, maintainability, verification, and alignment with product/system intent.

## Context to inspect

If present, read only what is relevant:

```text
docs/features/{slug}/prd.html
docs/features/{slug}/design.html
docs/adrs/{architecture,api,web}.md
.features/{slug}/tasks/       # local/ignored tasks/results, if available
.features/{slug}/artifacts/   # local/ignored large logs/screenshots, if available
```

Do not expect `.features/` task-loop state in the PR.

## Review flow

1. Get PR/branch diff.
2. Identify claimed behavior and changed files.
3. Check PRD/architecture alignment when docs exist.
4. Check tests and feedback-loop evidence.
5. Leave specific file:line findings.

Commands:

```bash
gh pr view <number> --json title,body,additions,deletions,files
gh pr diff <number>
# or
git diff main...<branch>
```

## Checklist

### Correctness
- [ ] Code matches claimed behavior.
- [ ] Edge/error/empty/permission cases handled.
- [ ] No silent scope expansion.

### Architecture alignment
- [ ] Matches `design.html` when present.
- [ ] Preserves relevant ADRs in `docs/adrs/`.
- [ ] Changes live in the right layer with appropriate abstraction.
- [ ] API/schema/auth/persistence changes are intentional and documented.

### Task/result alignment
- [ ] Done/blocked tasks have current `## Result` sections when `.features/` exists.
- [ ] Results record changed files, feedback-loop results, deviations, and follow-up needed by later tasks.
- [ ] Regression gate passed or exception is explicit.

### Code quality
- [ ] Clear names and simple control flow.
- [ ] Nearby patterns followed or intentional deviation explained.
- [ ] No unrelated refactor/formatting churn.
- [ ] No secrets/PII or validation/auth weakening.

## Feedback format

```markdown
## Summary

One paragraph: what changed and review outcome.

## Must Fix

- **file:line** Issue, impact, recommended fix.

## Should Fix

- **file:line** Issue, impact, recommended fix.

## Suggestions

- **file:line** Optional improvement.

## Alignment

- PRD/architecture: aligned | mismatch | not checked
- Feedback loop: passed | missing | partial | not applicable
- Follow-up: none | ...

## Questions

- ...
```

## Guidelines

- Be specific and concise.
- Explain impact, not just preference.
- Do not block on style-only concerns unless repo conventions require them.
- Stop and ask when product/architecture intent is unclear.
