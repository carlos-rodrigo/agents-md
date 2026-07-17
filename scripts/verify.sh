#!/bin/bash
set -euo pipefail

ROOT="/Users/carlosrodrigo/agents"

node "$ROOT/scripts/build-html-report-css.mjs" --check
node "$ROOT/scripts/render-excalidraw-diagram.mjs" --check \
  "$ROOT/skills/html-report-designer/resources/excalidraw-slice-example.json" \
  "$ROOT/skills/html-report-designer/resources/excalidraw-slice-example.svg"
node "$ROOT/scripts/render-excalidraw-diagram.mjs" --check \
  "$ROOT/skills/html-report-designer/resources/excalidraw-domain-interaction-example.json" \
  "$ROOT/skills/html-report-designer/resources/excalidraw-domain-interaction-example.svg"
node "$ROOT/scripts/test-excalidraw-diagram.mjs"
node "$ROOT/scripts/test-html-report-validator.mjs"
node "$ROOT/scripts/test-html-report-layout.mjs"
bash "$ROOT/skills/loop/loop.test.sh"
node "$ROOT/scripts/test-simple-tasks-skill.mjs"

node "$ROOT/scripts/validate-html-report.mjs" --allow-placeholders \
  "$ROOT/skills/html-report-designer/resources/report-template.html" \
  "$ROOT/skills/html-report-designer/resources/prd-template.html" \
  "$ROOT/skills/html-report-designer/resources/design-template.html" \
  "$ROOT/skills/system-diagram/resources/system-diagram-template.html"

# Run Pi configuration tests because several skills target Pi workflows.
cd /Users/carlosrodrigo/Developer/pi-config
bash scripts/verify.sh "$@"
