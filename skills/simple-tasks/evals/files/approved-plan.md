# Plan: Recovery workflow

Status: approved by the user on 2026-07-31.

## Outcome
When a save fails, the user keeps what they entered and sees why it failed.

## Behavior
### Scenario: save fails (AC-004)
- Given a user has entered data in the form
- When saving fails
- Then the entered data stays in the form and the error is visible

## Design
Reuse the existing retry-state seam in the form controller. Rollback invariant: a failed save leaves stored data unchanged. See `docs/adrs/architecture.md`.

## Verification
- AC-004 → browser: submit with the API failing; the form keeps its values and shows the error.

## Build order
1. Keep entered data on a failed save — observable result: values remain after a failed submit.
2. Show the save error — observable result: the error message is visible next to the form.
