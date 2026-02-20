#!/usr/bin/env bash
# Loop runner (background mode) colocated with the loop skill.
# Runs from any project that uses .features/{feature}/tasks.

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TOOL=""
TOOL_ORDER="${LOOP_TOOL_ORDER:-pi,amp,claude,opencode}"
FEATURE=""
PROJECT_ROOT=""
MAX_ITERATIONS=10
SLEEP_SECONDS=2

is_supported_tool() {
  case "$1" in
    amp|claude|opencode|pi) return 0 ;;
    *) return 1 ;;
  esac
}

validate_tool_order() {
  local raw="$1"
  local count=0
  local token

  for token in $(printf '%s' "$raw" | tr ',' ' '); do
    token="$(printf '%s' "$token" | xargs)"
    [[ -z "$token" ]] && continue

    if ! is_supported_tool "$token"; then
      echo "Error: invalid tool in --tool-order/LOOP_TOOL_ORDER: '$token'"
      echo "Allowed: amp, claude, opencode, pi"
      return 1
    fi

    count=$((count + 1))
  done

  if [[ "$count" -eq 0 ]]; then
    echo "Error: --tool-order/LOOP_TOOL_ORDER is empty"
    return 1
  fi

  return 0
}

usage() {
  cat <<'EOF'
Usage: loop.sh [options] [max_iterations]

Options:
  --feature <name>         Feature folder name under .features/
  --project-root <path>    Project root to run in (default: current directory)
  --tool <name>            amp | claude | opencode | pi (explicit; overrides order)
  --tool-order <csv>       Tool priority for auto-detect, e.g. "pi,amp,claude,opencode"
                           Can also be set via LOOP_TOOL_ORDER env var
  --sleep <seconds>        Delay between iterations (default: 2)
  -h, --help               Show this help

Examples:
  ~/agents/skills/loop/loop.sh --feature agentic-finance --project-root "$PWD" --tool pi 20
  ~/agents/skills/loop/loop.sh --feature pwa-hardening --project-root /path/to/repo --tool-order "amp,claude,pi"
  LOOP_TOOL_ORDER="claude,opencode,pi,amp" ~/agents/skills/loop/loop.sh --feature billing --project-root "$PWD"
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tool)
      TOOL="$(printf '%s' "${2:-}" | tr '[:upper:]' '[:lower:]')"
      shift 2
      ;;
    --tool=*)
      TOOL="$(printf '%s' "${1#*=}" | tr '[:upper:]' '[:lower:]')"
      shift
      ;;
    --tool-order)
      TOOL_ORDER="${2:-}"
      shift 2
      ;;
    --tool-order=*)
      TOOL_ORDER="${1#*=}"
      shift
      ;;
    --feature)
      FEATURE="${2:-}"
      shift 2
      ;;
    --feature=*)
      FEATURE="${1#*=}"
      shift
      ;;
    --project-root)
      PROJECT_ROOT="${2:-}"
      shift 2
      ;;
    --project-root=*)
      PROJECT_ROOT="${1#*=}"
      shift
      ;;
    --sleep)
      SLEEP_SECONDS="${2:-}"
      shift 2
      ;;
    --sleep=*)
      SLEEP_SECONDS="${1#*=}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        MAX_ITERATIONS="$1"
      else
        echo "Unknown argument: $1"
        usage
        exit 1
      fi
      shift
      ;;
  esac
done

if [[ -z "$PROJECT_ROOT" ]]; then
  PROJECT_ROOT="$PWD"
fi

if [[ ! -d "$PROJECT_ROOT" ]]; then
  echo "Error: project root does not exist: $PROJECT_ROOT"
  exit 1
fi

cd "$PROJECT_ROOT"

if [[ ! -d ".features" ]]; then
  echo "Error: .features/ not found in project root: $PROJECT_ROOT"
  exit 1
fi

if ! validate_tool_order "$TOOL_ORDER"; then
  exit 1
fi

# Resolve tool.
if [[ -n "$TOOL" ]]; then
  if ! is_supported_tool "$TOOL"; then
    echo "Error: invalid --tool '$TOOL'. Allowed: amp, claude, opencode, pi"
    exit 1
  fi
else
  for candidate in $(printf '%s' "$TOOL_ORDER" | tr ',' ' '); do
    candidate="$(printf '%s' "$candidate" | xargs)"
    [[ -z "$candidate" ]] && continue

    if command -v "$candidate" >/dev/null 2>&1; then
      TOOL="$candidate"
      break
    fi
  done

  if [[ -z "$TOOL" ]]; then
    echo "Error: no supported agent found in tool order: $TOOL_ORDER"
    echo "Install one of: amp, claude, opencode, pi"
    exit 1
  fi
fi

# Auto-detect feature if omitted.
if [[ -z "$FEATURE" ]]; then
  FEATURES_LIST="$(ls -d .features/*/ 2>/dev/null | grep -v '/archive/' | xargs -I{} basename {} || true)"
  FEATURE_COUNT="$(printf '%s\n' "$FEATURES_LIST" | sed '/^$/d' | wc -l | tr -d ' ')"

  if [[ "$FEATURE_COUNT" == "0" ]]; then
    echo "Error: no feature folders found in .features/"
    exit 1
  elif [[ "$FEATURE_COUNT" == "1" ]]; then
    FEATURE="$(printf '%s\n' "$FEATURES_LIST" | sed '/^$/d' | head -n 1)"
  else
    echo "Multiple features found:"
    printf '%s\n' "$FEATURES_LIST" | sed '/^$/d' | sed 's/^/  - /'
    echo "Use --feature <name>"
    exit 1
  fi
fi

if [[ ! -d ".features/$FEATURE/tasks" ]]; then
  echo "Error: feature '$FEATURE' not found at .features/$FEATURE/tasks"
  exit 1
fi

mkdir -p scripts/loop
PROGRESS_FILE="scripts/loop/progress-${FEATURE}.txt"
LOG_FILE="scripts/loop/tmux-loop-${FEATURE}.log"

if [[ ! -f "$PROGRESS_FILE" ]]; then
  {
    echo "# Loop Progress Log"
    echo "Started: $(date)"
    echo "Feature: $FEATURE"
    echo
    echo "## Codebase Patterns"
    echo
    echo "---"
  } > "$PROGRESS_FILE"
fi

PROMPT_TEMPLATE_FILE="$SCRIPT_DIR/prompt.md"
if [[ ! -f "$PROMPT_TEMPLATE_FILE" ]]; then
  echo "Error: prompt template not found: $PROMPT_TEMPLATE_FILE"
  exit 1
fi

PROMPT_TEMPLATE="$(<"$PROMPT_TEMPLATE_FILE")"
PROMPT="${PROMPT_TEMPLATE//\{\{FEATURE\}\}/$FEATURE}"
PROMPT="${PROMPT//\{\{PROGRESS_FILE\}\}/scripts/loop/progress-$FEATURE.txt}"

echo "=== loop start $(date) ===" | tee -a "$LOG_FILE"
echo "project=$PROJECT_ROOT feature=$FEATURE tool=$TOOL tool_order=$TOOL_ORDER max_iterations=$MAX_ITERATIONS" | tee -a "$LOG_FILE"
echo "log_file=$LOG_FILE (follow with: tail -f $LOG_FILE)" | tee -a "$LOG_FILE"

for i in $(seq 1 "$MAX_ITERATIONS"); do
  echo "" | tee -a "$LOG_FILE"
  echo "[iteration $i/$MAX_ITERATIONS]" | tee -a "$LOG_FILE"

  TEMP_OUTPUT="$(mktemp -t "loop_${TOOL}")"

  set +e
  case "$TOOL" in
    pi)
      (pi -p "$PROMPT" 2>&1 | tee "$TEMP_OUTPUT" | tee -a "$LOG_FILE") &
      CMD_PID=$!
      ;;
    amp)
      (printf "%s\n" "$PROMPT" | amp --dangerously-allow-all 2>&1 | tee "$TEMP_OUTPUT" | tee -a "$LOG_FILE") &
      CMD_PID=$!
      ;;
    claude)
      (printf "%s\n" "$PROMPT" | claude --dangerously-skip-permissions --print 2>&1 | tee "$TEMP_OUTPUT" | tee -a "$LOG_FILE") &
      CMD_PID=$!
      ;;
    opencode)
      (opencode run "$PROMPT" 2>&1 | tee "$TEMP_OUTPUT" | tee -a "$LOG_FILE") &
      CMD_PID=$!
      ;;
    *)
      echo "Error: unknown tool '$TOOL'" | tee -a "$LOG_FILE"
      rm -f "$TEMP_OUTPUT"
      exit 1
      ;;
  esac

  START_TS=$(date +%s)
  while kill -0 "$CMD_PID" 2>/dev/null; do
    sleep 30
    if kill -0 "$CMD_PID" 2>/dev/null; then
      ELAPSED=$(( $(date +%s) - START_TS ))
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] iteration $i still running (${ELAPSED}s elapsed)..." | tee -a "$LOG_FILE"
    fi
  done

  wait "$CMD_PID"
  TOOL_EXIT=$?
  set -e

  if [[ $TOOL_EXIT -ne 0 ]]; then
    echo "Tool exited non-zero (exit=$TOOL_EXIT). Continuing loop." | tee -a "$LOG_FILE"
  fi

  if grep -Eq "Loop complete|<promise>COMPLETE</promise>" "$TEMP_OUTPUT"; then
    echo "Loop complete detected." | tee -a "$LOG_FILE"
    rm -f "$TEMP_OUTPUT"
    echo "=== loop end $(date) ===" | tee -a "$LOG_FILE"
    exit 0
  fi

  rm -f "$TEMP_OUTPUT"
  sleep "$SLEEP_SECONDS"
done

echo "Reached max iterations ($MAX_ITERATIONS)." | tee -a "$LOG_FILE"
echo "=== loop end $(date) ===" | tee -a "$LOG_FILE"
exit 1
