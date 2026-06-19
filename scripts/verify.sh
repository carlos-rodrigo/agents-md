#!/bin/bash
set -euo pipefail

ROOT="/Users/carlosrodrigo/agents"

node "$ROOT/scripts/validate-html-report.mjs" --allow-placeholders \
  "$ROOT/skills/html-report-designer/resources/report-template.html" \
  "$ROOT/skills/html-report-designer/resources/prd-template.html" \
  "$ROOT/skills/html-report-designer/resources/design-template.html" \
  "$ROOT/skills/system-diagram/resources/system-diagram-template.html"

# Run Pi configuration tests because several skills target Pi workflows.
cd /Users/carlosrodrigo/Developer/pi-config
bash scripts/verify.sh "$@"
