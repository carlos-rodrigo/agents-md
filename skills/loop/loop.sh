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
POLL_SECONDS="${LOOP_POLL_SECONDS:-3}"
RATE_LIMIT_MAX_STREAK="${LOOP_RATE_LIMIT_MAX_STREAK:-3}"
AGENT=""
AGENT_FILE=""
AGENT_MODEL=""
PI_MODEL="${LOOP_PI_MODEL:-gpt-5.3-codex}"
PI_THINKING="${LOOP_PI_THINKING:-high}"
OPENCODE_MODEL="${LOOP_OPENCODE_MODEL-$PI_MODEL}"
OPENCODE_VARIANT="${LOOP_OPENCODE_VARIANT-$PI_THINKING}"

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

validate_non_negative_int() {
  local name="$1"
  local value="$2"

  if ! [[ "$value" =~ ^[0-9]+$ ]]; then
    echo "Error: $name must be a non-negative integer (got '$value')"
    return 1
  fi

  return 0
}

is_rate_limit_error_output() {
  local file="$1"
  grep -Eiq 'rate_limit_error|too[[:space:]]+many[[:space:]]+requests|\bHTTP[[:space:]]*429\b|\b429\b' "$file"
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
  --agent <name>           Use a specific agent (e.g. crafter). Resolves system prompt
                           from ~/.pi/agent/agents/{name}.md. Forces --tool pi.
  --sleep <seconds>        Delay between iterations (default: 2)
  --poll <seconds>         Heartbeat log interval while tool runs (default: 3)
                           Set 0 to disable heartbeat logging
  --rate-limit-streak <n>  Stop loop after n consecutive rate-limit failures (default: 3)
  -h, --help               Show this help

Environment overrides:
  LOOP_PI_MODEL            Pi model (default: gpt-5.3-codex)
  LOOP_PI_THINKING         Pi thinking level (default: high)
  LOOP_OPENCODE_MODEL      OpenCode model (default: same as LOOP_PI_MODEL)
  LOOP_OPENCODE_VARIANT    OpenCode variant/reasoning (default: same as LOOP_PI_THINKING)
                           Set LOOP_OPENCODE_VARIANT='' to omit --variant
  LOOP_RATE_LIMIT_MAX_STREAK  Consecutive rate-limit failures before stopping (default: 3)

Examples:
  ~/agents/skills/loop/loop.sh --feature agentic-finance --project-root "$PWD" --tool pi --poll 1 20
  ~/agents/skills/loop/loop.sh --agent crafter --feature user-auth --project-root "$PWD" 20
  ~/agents/skills/loop/loop.sh --feature pwa-hardening --project-root /path/to/repo --tool-order "amp,claude,pi"
  LOOP_TOOL_ORDER="claude,opencode,pi,amp" LOOP_POLL_SECONDS=1 ~/agents/skills/loop/loop.sh --feature billing --project-root "$PWD"
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agent)
      AGENT="${2:-}"
      shift 2
      ;;
    --agent=*)
      AGENT="${1#*=}"
      shift
      ;;
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
    --poll)
      POLL_SECONDS="${2:-}"
      shift 2
      ;;
    --poll=*)
      POLL_SECONDS="${1#*=}"
      shift
      ;;
    --rate-limit-streak)
      RATE_LIMIT_MAX_STREAK="${2:-}"
      shift 2
      ;;
    --rate-limit-streak=*)
      RATE_LIMIT_MAX_STREAK="${1#*=}"
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

if ! validate_non_negative_int "--sleep" "$SLEEP_SECONDS"; then
  exit 1
fi

if ! validate_non_negative_int "--poll" "$POLL_SECONDS"; then
  exit 1
fi

if ! validate_non_negative_int "--rate-limit-streak" "$RATE_LIMIT_MAX_STREAK"; then
  exit 1
fi

if [[ "$RATE_LIMIT_MAX_STREAK" -le 0 ]]; then
  echo "Error: --rate-limit-streak must be > 0"
  exit 1
fi

if [[ "$MAX_ITERATIONS" -le 0 ]]; then
  echo "Error: max_iterations must be > 0"
  exit 1
fi

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

# Resolve agent (--agent flag).
if [[ -n "$AGENT" ]]; then
  AGENT_FILE="${HOME}/.pi/agent/agents/${AGENT}.md"
  if [[ ! -f "$AGENT_FILE" ]]; then
    echo "Error: agent file not found: $AGENT_FILE"
    exit 1
  fi

  # Optional: extract model from frontmatter for logging only.
  AGENT_MODEL="$(awk '/^---$/{n++; next} n==1 && /^model:/{sub(/^model:[[:space:]]*/, ""); print; exit}' "$AGENT_FILE")"
  if [[ -z "$AGENT_MODEL" ]]; then
    AGENT_MODEL="unspecified"
  fi

  # Agent mode forces pi as the tool (using enforced pi model/thinking).
  TOOL="pi"
  echo "Agent: $AGENT (agent_model=$AGENT_MODEL, prompt=$AGENT_FILE, pi_model=$PI_MODEL, pi_thinking=$PI_THINKING)"
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

TOOL_RUNTIME=""
if [[ "$TOOL" == "pi" ]]; then
  TOOL_RUNTIME=" pi_model=$PI_MODEL pi_thinking=$PI_THINKING"
elif [[ "$TOOL" == "opencode" ]]; then
  TOOL_RUNTIME=" opencode_model=${OPENCODE_MODEL:-none} opencode_variant=${OPENCODE_VARIANT:-none}"
fi

LOOP_START_TS=$(date +%s)
echo "=== loop start $(date '+%Y-%m-%d %H:%M:%S') ===" | tee -a "$LOG_FILE"
if [[ -n "$AGENT" ]]; then
  echo "project=$PROJECT_ROOT feature=$FEATURE agent=$AGENT model=$AGENT_MODEL tool=$TOOL max_iterations=$MAX_ITERATIONS sleep=$SLEEP_SECONDS poll=$POLL_SECONDS rate_limit_streak_limit=$RATE_LIMIT_MAX_STREAK$TOOL_RUNTIME" | tee -a "$LOG_FILE"
else
  echo "project=$PROJECT_ROOT feature=$FEATURE tool=$TOOL tool_order=$TOOL_ORDER max_iterations=$MAX_ITERATIONS sleep=$SLEEP_SECONDS poll=$POLL_SECONDS rate_limit_streak_limit=$RATE_LIMIT_MAX_STREAK$TOOL_RUNTIME" | tee -a "$LOG_FILE"
fi
echo "log_file=$LOG_FILE (follow with: tail -f $LOG_FILE)" | tee -a "$LOG_FILE"

RATE_LIMIT_STREAK=0

for i in $(seq 1 "$MAX_ITERATIONS"); do
  echo "" | tee -a "$LOG_FILE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
  echo "[iteration $i/$MAX_ITERATIONS] started at $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

  TEMP_OUTPUT="$(mktemp -t "loop_${TOOL}")"
  START_TS=$(date +%s)

  set +e
  case "$TOOL" in
    pi)
      PI_CMD=(pi --model "$PI_MODEL" --thinking "$PI_THINKING")
      if [[ -n "$AGENT_FILE" ]]; then
        PI_CMD+=(--append-system-prompt "$AGENT_FILE")
      fi
      PI_CMD+=(-p "$PROMPT")
      ("${PI_CMD[@]}" 2>&1 | tee -a "$LOG_FILE" "$TEMP_OUTPUT") &
      CMD_PID=$!
      ;;
    amp)
      (printf "%s\n" "$PROMPT" | amp --dangerously-allow-all 2>&1 | tee -a "$LOG_FILE" "$TEMP_OUTPUT") &
      CMD_PID=$!
      ;;
    claude)
      (printf "%s\n" "$PROMPT" | claude --dangerously-skip-permissions --print 2>&1 | tee -a "$LOG_FILE" "$TEMP_OUTPUT") &
      CMD_PID=$!
      ;;
    opencode)
      OPENCODE_CMD=(opencode run)
      if [[ -n "$OPENCODE_MODEL" ]]; then
        OPENCODE_CMD+=(--model "$OPENCODE_MODEL")
      fi
      if [[ -n "$OPENCODE_VARIANT" ]]; then
        OPENCODE_CMD+=(--variant "$OPENCODE_VARIANT")
      fi
      OPENCODE_CMD+=("$PROMPT")
      ("${OPENCODE_CMD[@]}" 2>&1 | tee -a "$LOG_FILE" "$TEMP_OUTPUT") &
      CMD_PID=$!
      ;;
    *)
      echo "Error: unknown tool '$TOOL'" | tee -a "$LOG_FILE"
      rm -f "$TEMP_OUTPUT"
      exit 1
      ;;
  esac

  if [[ "$POLL_SECONDS" -gt 0 ]]; then
    while ps -p "$CMD_PID" >/dev/null 2>&1; do
      STATUS="$(ps -o stat= -p "$CMD_PID" 2>/dev/null | tr -d '[:space:]')"
      [[ -z "$STATUS" || "$STATUS" == Z* ]] && break

      sleep "$POLL_SECONDS"

      if ps -p "$CMD_PID" >/dev/null 2>&1; then
        STATUS="$(ps -o stat= -p "$CMD_PID" 2>/dev/null | tr -d '[:space:]')"
        if [[ -n "$STATUS" && "$STATUS" != Z* ]]; then
          ELAPSED=$(( $(date +%s) - START_TS ))
          echo "[$(date '+%Y-%m-%d %H:%M:%S')] iteration $i still running (${ELAPSED}s elapsed)..." | tee -a "$LOG_FILE"
        fi
      fi
    done
  fi

  wait "$CMD_PID" 2>/dev/null
  TOOL_EXIT=$?

  set -e

  # Calculate duration
  END_TS=$(date +%s)
  DURATION=$((END_TS - START_TS))
  MINUTES=$((DURATION / 60))
  SECONDS=$((DURATION % 60))
  if [[ $MINUTES -gt 0 ]]; then
    DURATION_STR="${MINUTES}m ${SECONDS}s"
  else
    DURATION_STR="${SECONDS}s"
  fi

  echo "" | tee -a "$LOG_FILE"
  echo "──────────────────────────────────────────────────────────" | tee -a "$LOG_FILE"
  echo "[iteration $i/$MAX_ITERATIONS] finished at $(date '+%Y-%m-%d %H:%M:%S') (duration: $DURATION_STR)" | tee -a "$LOG_FILE"

  if [[ $TOOL_EXIT -ne 0 ]]; then
    echo "⚠️  Tool exited non-zero (exit=$TOOL_EXIT). Continuing loop." | tee -a "$LOG_FILE"
  fi

  if grep -Eq "Loop complete|<promise>COMPLETE</promise>" "$TEMP_OUTPUT"; then
    echo "✅ Loop complete detected." | tee -a "$LOG_FILE"
    rm -f "$TEMP_OUTPUT"

    # Calculate total duration
    LOOP_END_TS=$(date +%s)
    TOTAL_DURATION=$((LOOP_END_TS - LOOP_START_TS))
    TOTAL_MINUTES=$((TOTAL_DURATION / 60))
    TOTAL_SECONDS=$((TOTAL_DURATION % 60))
    if [[ $TOTAL_MINUTES -ge 60 ]]; then
      TOTAL_HOURS=$((TOTAL_MINUTES / 60))
      TOTAL_MINUTES=$((TOTAL_MINUTES % 60))
      TOTAL_DURATION_STR="${TOTAL_HOURS}h ${TOTAL_MINUTES}m ${TOTAL_SECONDS}s"
    elif [[ $TOTAL_MINUTES -gt 0 ]]; then
      TOTAL_DURATION_STR="${TOTAL_MINUTES}m ${TOTAL_SECONDS}s"
    else
      TOTAL_DURATION_STR="${TOTAL_SECONDS}s"
    fi

    echo "──────────────────────────────────────────────────────────" | tee -a "$LOG_FILE"
    echo "=== loop end $(date '+%Y-%m-%d %H:%M:%S') ===" | tee -a "$LOG_FILE"
    echo "📊 Total: $i iterations in $TOTAL_DURATION_STR" | tee -a "$LOG_FILE"
    exit 0
  fi

  if is_rate_limit_error_output "$TEMP_OUTPUT"; then
    RATE_LIMIT_STREAK=$((RATE_LIMIT_STREAK + 1))
    echo "⚠️  Rate-limit error detected (streak $RATE_LIMIT_STREAK/$RATE_LIMIT_MAX_STREAK)." | tee -a "$LOG_FILE"

    if [[ "$RATE_LIMIT_STREAK" -ge "$RATE_LIMIT_MAX_STREAK" ]]; then
      rm -f "$TEMP_OUTPUT"

      LOOP_END_TS=$(date +%s)
      TOTAL_DURATION=$((LOOP_END_TS - LOOP_START_TS))
      TOTAL_MINUTES=$((TOTAL_DURATION / 60))
      TOTAL_SECONDS=$((TOTAL_DURATION % 60))
      if [[ $TOTAL_MINUTES -ge 60 ]]; then
        TOTAL_HOURS=$((TOTAL_MINUTES / 60))
        TOTAL_MINUTES=$((TOTAL_MINUTES % 60))
        TOTAL_DURATION_STR="${TOTAL_HOURS}h ${TOTAL_MINUTES}m ${TOTAL_SECONDS}s"
      elif [[ $TOTAL_MINUTES -gt 0 ]]; then
        TOTAL_DURATION_STR="${TOTAL_MINUTES}m ${TOTAL_SECONDS}s"
      else
        TOTAL_DURATION_STR="${TOTAL_SECONDS}s"
      fi

      echo "🛑 Stopping loop after $RATE_LIMIT_STREAK consecutive rate-limit failures." | tee -a "$LOG_FILE"
      echo "   Adjust with --rate-limit-streak <n> or LOOP_RATE_LIMIT_MAX_STREAK." | tee -a "$LOG_FILE"
      echo "=== loop end $(date '+%Y-%m-%d %H:%M:%S') ===" | tee -a "$LOG_FILE"
      echo "📊 Total: $i iterations in $TOTAL_DURATION_STR" | tee -a "$LOG_FILE"
      exit 2
    fi
  else
    RATE_LIMIT_STREAK=0
  fi

  rm -f "$TEMP_OUTPUT"
  echo "──────────────────────────────────────────────────────────" | tee -a "$LOG_FILE"
  sleep "$SLEEP_SECONDS"
done

# Calculate total duration
LOOP_END_TS=$(date +%s)
TOTAL_DURATION=$((LOOP_END_TS - LOOP_START_TS))
TOTAL_MINUTES=$((TOTAL_DURATION / 60))
TOTAL_SECONDS=$((TOTAL_DURATION % 60))
if [[ $TOTAL_MINUTES -ge 60 ]]; then
  TOTAL_HOURS=$((TOTAL_MINUTES / 60))
  TOTAL_MINUTES=$((TOTAL_MINUTES % 60))
  TOTAL_DURATION_STR="${TOTAL_HOURS}h ${TOTAL_MINUTES}m ${TOTAL_SECONDS}s"
elif [[ $TOTAL_MINUTES -gt 0 ]]; then
  TOTAL_DURATION_STR="${TOTAL_MINUTES}m ${TOTAL_SECONDS}s"
else
  TOTAL_DURATION_STR="${TOTAL_SECONDS}s"
fi

echo "" | tee -a "$LOG_FILE"
echo "⏹️  Reached max iterations ($MAX_ITERATIONS)." | tee -a "$LOG_FILE"
echo "=== loop end $(date '+%Y-%m-%d %H:%M:%S') ===" | tee -a "$LOG_FILE"
echo "📊 Total: $MAX_ITERATIONS iterations in $TOTAL_DURATION_STR" | tee -a "$LOG_FILE"
exit 1
