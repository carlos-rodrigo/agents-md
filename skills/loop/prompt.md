Load the loop skill and execute exactly one ready task for feature: {{FEATURE}}.

Rules:
- Use tasks from .features/{{FEATURE}}/tasks/
- Respect dependencies and pick the next ready open task
- Follow Context → Code → Review → Compound
- Update task status and .features/{{FEATURE}}/tasks/_active.md
- Run required validation commands before marking done
- Append progress to {{PROGRESS_FILE}}
- If all tasks are complete, output exactly: Loop complete
