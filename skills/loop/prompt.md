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
- Load and follow the implement-task skill before executing: /Users/carlosrodrigo/agents/skills/implement-task/SKILL.md
- Follow Understand → Tighten → Plan → Implement/check/fix loop → Review → Result/finalize from the implement-task skill
- Before coding, extract an explicit task-contract checklist from the task brief: Goal, Done, Execute bullets, required files/components, named approaches, constraints, Do/Do not language, and Feedback loop expected results
- Do not substitute a different implementation path for an explicit task instruction unless the task/user allows it or a user-owned blocker is recorded
- Before marking done, audit the implementation against every task-contract checklist item; if any explicit item is unmet, continue working or block with owner/reason
- Use adaptive review: load /Users/carlosrodrigo/agents/skills/are-you-proud/SKILL.md and apply it as self-review for small low-risk diffs; use oracle with the Are You Proud rubric for complex/high-risk diffs
- Resolve must-fix Are You Proud/Oracle findings before marking done, or record skipped review with reason
- Write/update feedback-loop results, task-contract audit, and Are You Proud/Oracle review status in the task's ## Result section; do not create separate report files for task results
- If the next task needs handoff context, update that next task directly before marking the current task done
- Update task status and .features/{{FEATURE}}/tasks/_active.md after results; check off the completed task and set next/blocker state
- Run required validation commands before marking done: Fast → User/system → Edge → Gate, fixing in-scope failures up to 3 attempts per distinct failure
- Append a compact iteration report to {{PROGRESS_FILE}}
- Write the latest iteration report to {{SUMMARY_FILE}} with: task, explicit contract audit, changed files, feedback-loop evidence, gate, active board update, next action/blocker
- Do not produce a continuation or new-session template
- Final response must report back before the required final marker: task id/title, changed files, explicit contract audit, feedback-loop evidence, gate, result path, active board path, and next action
- If one task completes and more may remain, output a final line starting exactly: Loop iteration complete:
- If you resolve an agent-owned blocker but do not complete a task in this iteration, output a final line starting exactly: Loop iteration complete:
- If a user-owned blocker remains, output a final line starting exactly: Loop blocked: user-owned —
- If an agent-owned blocker/failure remains after the retry budget is exhausted, output a final line starting exactly: Loop blocked: exhausted —
- Do not output `Loop blocked:` for blockers you can fix locally
- If all targeted tasks are complete, output exactly: Loop complete
