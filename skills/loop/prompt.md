Load the loop skill and execute at most one ready task/work order for feature: {{FEATURE}}.

Rules:
- Use execution units from .features/{{FEATURE}}/tasks/
- Respect dependencies and pick the next ready/open unit
- Read durable docs from docs/features/{{FEATURE}}/ only when relevant
- Follow Understand → Plan → Code → Review → Report
- Use adaptive review: self-review for small low-risk diffs; oracle review for complex/high-risk diffs
- Update task status and .features/{{FEATURE}}/tasks/_active.md if present
- Write/update execution evidence under .features/{{FEATURE}}/execution/
- Run required validation commands before marking done
- Append progress to {{PROGRESS_FILE}}
- Do not produce a continuation or new-session template
- If one unit completes and more may remain, output a final line starting exactly: Loop iteration complete:
- If no executable unit is ready or proof cannot be produced, output a final line starting exactly: Loop blocked:
- If all tasks are complete, output exactly: Loop complete
