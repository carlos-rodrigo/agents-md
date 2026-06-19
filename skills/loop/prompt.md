Load the loop skill and execute at most one ready task for feature: {{FEATURE}}.

{{TARGET_TASK_LINE}}

Rules:
- Use task briefs from .features/{{FEATURE}}/tasks/
- Read .features/{{FEATURE}}/tasks/_active.md first; if it is missing or stale, create/refresh it from task files before choosing work
- Respect dependencies and pick the target task or next ready/open/locally-blocked task
- Do not execute draft tasks
- For blocked tasks, inspect the blocker/result/_active.md: keep user-owned blockers blocked; if the blocker is local and agent-owned, document the unblock action, set the task back to ready, refresh _active.md, and continue
- If a ready/open/locally-blocked task has stale/missing low-level design or feedback-loop details that are local and agent-owned, update the task before coding
- Resolve agent-owned blockers instead of stopping: stale task metadata, missing/stale _active.md, stale anchors, missing local checks, result/status drift, and in-scope feedback-loop failures
- Stop only for user-owned product/architecture/API/schema/auth/persistence/rollout/feedback-loop blockers, or after the implement-task retry budget is exhausted
- Read durable docs from docs/features/{{FEATURE}}/ only when relevant
- Follow Understand → Tighten → Plan → Implement/check/fix loop → Review → Result/finalize from the implement-task skill
- Use adaptive review: self-review for small low-risk diffs; oracle review for complex/high-risk diffs
- Write/update feedback-loop results in the task's ## Result section; do not create separate report files for task results
- If the next task needs handoff context, update that next task directly before marking the current task done
- Update task status and .features/{{FEATURE}}/tasks/_active.md after results; check off the completed task and set next/blocker state
- Run required validation commands before marking done: Fast → User/system → Edge → Gate, fixing in-scope failures up to 3 attempts per distinct failure
- Append progress to {{PROGRESS_FILE}}
- Do not produce a continuation or new-session template
- If one task completes and more may remain, output a final line starting exactly: Loop iteration complete:
- If you resolve an agent-owned blocker but do not complete a task in this iteration, output a final line starting exactly: Loop iteration complete:
- If a user-owned blocker remains, output a final line starting exactly: Loop blocked: user-owned —
- If an agent-owned blocker/failure remains after the retry budget is exhausted, output a final line starting exactly: Loop blocked: exhausted —
- Do not output `Loop blocked:` for blockers you can fix locally
- If all targeted tasks are complete, output exactly: Loop complete
