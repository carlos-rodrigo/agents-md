Load the loop skill and execute at most one ready task for feature: {{FEATURE}}.

{{TARGET_TASK_LINE}}

Rules:
- Use task briefs from .features/{{FEATURE}}/tasks/
- Respect dependencies and pick the target task or next ready/open task
- Do not execute draft or blocked tasks
- If a ready task has stale/missing low-level design or feedback-loop details that are local and agent-owned, update the task before coding
- Stop for user-owned product/architecture/API/schema/auth/persistence/rollout/feedback-loop blockers instead of inventing requirements
- Read durable docs from docs/features/{{FEATURE}}/ only when relevant
- Follow Understand → Plan → Code → Review → Report from the implement-task skill
- Use adaptive review: self-review for small low-risk diffs; oracle review for complex/high-risk diffs
- Update task status and .features/{{FEATURE}}/tasks/_active.md if present
- Write/update execution evidence under .features/{{FEATURE}}/execution/
- Run required validation commands before marking done
- Append progress to {{PROGRESS_FILE}}
- Do not produce a continuation or new-session template
- If one task completes and more may remain, output a final line starting exactly: Loop iteration complete:
- If no executable task is ready or feedback-loop evidence cannot be produced, output a final line starting exactly: Loop blocked:
- If all targeted tasks are complete, output exactly: Loop complete
