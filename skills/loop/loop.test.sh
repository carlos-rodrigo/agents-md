#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP_ROOT="$(mktemp -d -t loop_provider_test)"
trap 'rm -rf "$TMP_ROOT"' EXIT

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

assert_contains() {
  local file="$1"
  local text="$2"
  grep -Fq -- "$text" "$file" || fail "$file does not contain: $text"
}

new_project() {
  local name="$1"
  local project="$TMP_ROOT/$name/project"
  mkdir -p "$project/.features/demo/tasks"
  cat > "$project/.features/demo/tasks/_active.md" <<'EOF'
# Current Feature

- [ ] TASK-004 — Govern and lock trusted references (ready)
EOF
  printf '%s' "$project"
}

new_fake_pi() {
  local name="$1"
  local body="$2"
  local bin="$TMP_ROOT/$name/bin"
  mkdir -p "$bin"
  cat > "$bin/pi" <<EOF
#!/usr/bin/env bash
set -Eeuo pipefail
count=0
if [[ -f "\$LOOP_TEST_STATE" ]]; then count="\$(cat "\$LOOP_TEST_STATE")"; fi
count=\$((count + 1))
printf '%s' "\$count" > "\$LOOP_TEST_STATE"
$body
EOF
  chmod +x "$bin/pi"
  printf '%s' "$bin"
}

run_loop() {
  local project="$1"
  local bin="$2"
  local state="$3"
  local output="$4"
  shift 4
  if PATH="$bin:$PATH" LOOP_TEST_STATE="$state" bash "$SCRIPT_DIR/loop.sh" \
    --feature demo \
    --project-root "$project" \
    --tool pi \
    --sleep 0 \
    --poll 0 \
    --provider-retry-delay 0 \
    "$@" > "$output" 2>&1; then
    return 0
  else
    return $?
  fi
}

# A provider interruption must skip task classification and retry with a fresh iteration.
project="$(new_project retry)"
before="$(shasum -a 256 "$project/.features/demo/tasks/_active.md" | awk '{print $1}')"
bin="$(new_fake_pi retry 'if [[ "$count" -eq 1 ]]; then echo "fetch failed"; else echo "Loop complete: simulated provider recovery"; fi')"
state="$TMP_ROOT/retry/count"
output="$TMP_ROOT/retry/output.log"
run_loop "$project" "$bin" "$state" "$output" --provider-error-streak 3 3 || fail "retry case should exit 0"
[[ "$(cat "$state")" == "2" ]] || fail "retry case should invoke pi exactly twice"
after="$(shasum -a 256 "$project/.features/demo/tasks/_active.md" | awk '{print $1}')"
[[ "$before" == "$after" ]] || fail "provider interruption must not alter TASK-004 state"
assert_contains "$output" "Provider/WebSocket interruption detected; task state will not be classified"
assert_contains "$output" "No task completion, blocker, or TASK status was inferred"
assert_contains "$output" "[iteration 2/3] started"
assert_contains "$output" "Loop complete detected"

# Empty output must also skip task classification and retry rather than silently consuming an iteration.
project="$(new_project empty_output)"
bin="$(new_fake_pi empty_output 'if [[ "$count" -gt 1 ]]; then echo "Loop complete: recovered after empty output"; fi')"
state="$TMP_ROOT/empty_output/count"
output="$TMP_ROOT/empty_output/output.log"
run_loop "$project" "$bin" "$state" "$output" --provider-error-streak 3 3 || fail "empty-output retry case should exit 0"
[[ "$(cat "$state")" == "2" ]] || fail "empty-output retry case should invoke pi exactly twice"
assert_contains "$output" "Empty agent output detected; task state will not be classified"
assert_contains "$output" "[iteration 2/3] started"

# Application text containing a longer fetch-failure phrase must not be mistaken for provider transport failure.
project="$(new_project false_positive)"
bin="$(new_fake_pi false_positive 'echo "Loop complete: application diagnostic was fetch failed while importing"')"
state="$TMP_ROOT/false_positive/count"
output="$TMP_ROOT/false_positive/output.log"
run_loop "$project" "$bin" "$state" "$output" --provider-error-streak 3 2 || fail "false-positive case should exit 0"
[[ "$(cat "$state")" == "1" ]] || fail "false-positive case should invoke pi once"
if grep -Fq "Provider/WebSocket interruption detected" "$output"; then
  fail "longer application diagnostic was misclassified as provider transport failure"
fi

# Consecutive provider failures must stop with the distinct provider exit code and not spin forever.
project="$(new_project exhausted)"
bin="$(new_fake_pi exhausted 'echo "provider_transport_failure: WebSocket idle timeout after 300000ms"')"
state="$TMP_ROOT/exhausted/count"
output="$TMP_ROOT/exhausted/output.log"
if run_loop "$project" "$bin" "$state" "$output" --provider-error-streak 2 5; then
  code=0
else
  code=$?
fi
[[ "$code" -eq 4 ]] || fail "provider exhaustion should exit 4, got $code"
[[ "$(cat "$state")" == "2" ]] || fail "provider exhaustion should stop after two attempts"
assert_contains "$output" "Stopping loop after 2 consecutive provider/WebSocket/empty-output interruptions"
assert_contains "$project/.features/demo/artifacts/loop/latest-iteration.md" "- Outcome: provider_transport_interruption"
assert_contains "$project/.features/demo/artifacts/loop/latest-iteration.md" "- Task classification: skipped"

printf 'PASS: provider/empty-output retry, TASK-state isolation, false-positive guard, and retry exhaustion\n'
