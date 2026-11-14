Load the loop skill and execute at most one task for feature: {{FEATURE}}.

{{TARGET_TASK_LINE}}

Rules:
- Use task briefs from .features/{{FEATURE}}/tasks/
- Read .features/{{FEATURE}}/tasks/_active.md first; if it is missing or stale, create/refresh it from task files before choosing work
- Respect dependencies and pick the target task or next todo/in-progress task within the user's authorized scope; resume blocked work only when its blocker is resolved
- Do not infer permission from task status or completeness, or take over another active worker's task
- Mark the selected task in-progress when starting; keep user-owned blockers blocked with their owner and next action
- Before coding, repair only local gaps that do not change the agreed behavior or scope, such as advisory anchors, check commands, or board state
- Missing permission, unresolved decisions, and changes to agreed behavior, scope, constraints, or invariants are user-owned blockers
- Stop for those user-owned blockers or after the in-scope check-repair budget below is exhausted
- Read .features/{{FEATURE}}/plan.md and relevant docs/adrs/ files when the task needs their context
- Execute the task brief directly under AGENTS.md: inspect relevant code and tests, implement the smallest focused change using local patterns, and follow the feedback-loop skill for verification, review, and results
- Before coding, extract the task contract: Goal, Change, Done, binding Execute items (required behaviors/implementation, scope/non-goals, invariants), named files/approaches, constraints, and Feedback loop expected results; treat Inspect first/Likely files as advisory navigation
- Do not substitute a different implementation path for an explicit task instruction unless the task/user allows it or a user-owned blocker is recorded
- Before marking done, audit the implementation against every task-contract checklist item; if any explicit item is unmet, continue working or block with owner/reason
- Run the feedback loop's Oracle review rounds with the foreground `subagent` tool (agent `oracle`): fix must-fix and should-fix findings, re-run affected checks and the gate, re-review; repeat until a round has no must-fix or should-fix findings
- Do not start detached/background jobs (`agent_job_start`) from a loop iteration: their completion cannot resume this print-mode iteration and causes empty-output retry churn
- Write/update feedback-loop results, task-contract audit, and Are You Proud/Oracle review status in the task's ## Result section; do not create separate report files for task results
- If the next task needs handoff context, update that next task directly before marking the current task done
- Update task status and .features/{{FEATURE}}/tasks/_active.md after results; check off the completed task and set next/blocker state
- Run the task's feedback loop before marking done (setup, repro, each proof check, edge, gate), fixing in-scope failures up to 3 attempts per distinct failure; if the task has no feedback loop, build one with the feedback-loop skill
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
