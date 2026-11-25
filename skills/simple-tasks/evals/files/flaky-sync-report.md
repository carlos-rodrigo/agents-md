# Report: intermittent sync test failure

Status: the user authorized a fix task for this failure.

## Symptom
`npm test` fails about once in ten CI runs at `sync.test.ts` "pushes queued edits after reconnect" with `expected 3 edits, received 2`. It has never failed locally on a single run. Nobody knows the cause.

## Done (from the user)
- The test passes reliably under CI-like load, and the cause of the dropped edit is fixed, not masked.
- `npm test` passes.

## Known so far
- The test uses a fake socket and a 500 ms wait for the third edit.
- The sync queue flushes on reconnect and on a 2 s timer.
