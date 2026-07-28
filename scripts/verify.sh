#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

required_artifacts=(
  "docs/features/canonical-document-renderer/prd.document.json"
  "docs/features/canonical-document-renderer/prd.html"
  "docs/features/canonical-document-renderer/design.document.json"
  "docs/features/canonical-document-renderer/design.html"
  "docs/features/html-report-validation/prd.document.json"
  "docs/features/html-report-validation/prd.html"
  "docs/features/canonical-document-renderer/diagrams/product-review-flow.json"
  "docs/features/canonical-document-renderer/diagrams/product-review-flow.svg"
  "docs/features/canonical-document-renderer/diagrams/canonical-rendering-path.json"
  "docs/features/canonical-document-renderer/diagrams/canonical-rendering-path.svg"
  "docs/features/html-report-validation/diagrams/report-validation-flow.json"
  "docs/features/html-report-validation/diagrams/report-validation-flow.svg"
  "skills/system-diagram/resources/excalidraw-slice-example.json"
  "skills/system-diagram/resources/excalidraw-slice-example.svg"
  "skills/system-diagram/resources/excalidraw-domain-interaction-example.json"
  "skills/system-diagram/resources/excalidraw-domain-interaction-example.svg"
)
for artifact in "${required_artifacts[@]}"; do
  [[ -f "$ROOT/$artifact" ]] || { echo "Missing required artifact: $artifact" >&2; exit 1; }
done

cd "$ROOT"
npm run test:skills
npm run test:reports
npm run test:diagram
node "$ROOT/scripts/test-artifact-motion.mjs"
node "$ROOT/scripts/build-html-report-css.mjs" --check
while IFS= read -r -d '' scene; do
  svg="${scene%.json}.svg"
  [[ -f "$svg" ]] || { echo "Missing rendered SVG for $scene" >&2; exit 1; }
  node "$ROOT/scripts/render-excalidraw-diagram.mjs" --check "$scene" "$svg"
done < <(find "$ROOT/skills/system-diagram/resources" "$ROOT/docs/features" -type f -name '*.json' \( -path "$ROOT/skills/system-diagram/resources/*" -o -path '*/diagrams/*' \) -print0)
node "$ROOT/scripts/test-frontend-design-contract.mjs"
bash "$ROOT/skills/loop/loop.test.sh"
node "$ROOT/scripts/test-simple-tasks-skill.mjs"

node "$ROOT/scripts/validate-html-report.mjs" --allow-placeholders \
  "$ROOT/skills/html-report-designer/resources/report-template.html"

while IFS= read -r -d '' spec; do
  html="${spec%.document.json}.html"
  [[ -f "$html" ]] || { echo "Missing rendered report for $spec" >&2; exit 1; }
  node "$ROOT/scripts/render-canonical-report.mjs" --check "$spec" "$html"
  node "$ROOT/scripts/validate-html-report.mjs" "$html"
done < <(find "$ROOT/docs/features" -type f -name '*.document.json' -print0)
