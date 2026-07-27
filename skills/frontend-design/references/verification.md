# Frontend Verification

Choose checks that prove the actual behavior and quality risk. Do not treat a clean static screenshot as sufficient.

## Automated

Run repository equivalents of:

- lint, typecheck, unit/integration tests, and production build;
- primary-task browser/E2E test;
- automated accessibility scan;
- visual or state regression where available;
- bundle/performance comparison when assets, dependencies, or rendering changed.

## Source-of-truth audit

List every newly required control, field, role, domain category, completion rule, persistence/export behavior, and product capability. For each, cite approved requirements or an existing implementation. Remove, generalize, or explicitly condition anything without authority. Treat example counts as test scale, not inferred limits.

## Manual path

Complete the primary task and one material failure/recovery path. Verify:

- state and next action are always clear;
- duplicate/rapid input is safe;
- input and context survive recoverable failures;
- destructive/cancel/back behavior matches the product;
- focus moves and returns predictably;
- status/errors are announced and visible without motion or color alone.

## Responsive and content

Inspect at least narrow/reflow, intermediate, and wide layouts. Include:

- 320 CSS-pixel width or 400% reflow where applicable;
- 200% text resize;
- long/localized and unbroken content;
- touch targets and mobile keyboard behavior;
- RTL and safe areas when supported;
- print for durable/app-like artifacts that need a static review record, otherwise when the product promises it;
- variable-height localized timeline items with connectors/rails at 320px and 400% reflow.

No essential horizontal scrolling, clipped controls, hidden labels, reordered meaning, or absolutely positioned semantic rail overlapping or detaching from variable-height content. Do not accept product mockups scaled until their effective labels are unreadable; switch composition or allocate space.

## Accessibility

Target project policy and WCAG 2.2 AA where applicable:

- semantic landmarks and controls;
- accessible names, descriptions, errors, and live status;
- keyboard completion and visible, unobscured focus;
- contrast and non-color cues;
- zoom/reflow and target size;
- reduced motion and alternatives to drag/gesture;
- screen-reader smoke for consequential custom interactions.

## Performance

Use project budgets. For user-facing web products, check field-oriented targets where applicable:

- LCP ≤2.5s at the 75th percentile;
- INP ≤200ms;
- CLS ≤0.1.

Also inspect image dimensions/loading, font behavior, JavaScript cost, hydration/console errors, and layout stability. Do not claim improvement without a before/after measurement.

## Visual critique

Capture representative desktop and mobile states. Compare against the brief and neighboring product surfaces:

- hierarchy and primary action;
- optical alignment and spacing rhythm;
- type wrapping and density;
- component/system consistency;
- state completeness;
- product-specific character without decorative noise.

For self-contained HTML review artifacts, capture the target renderer with source scripts removed. Confirm that CSS motion still advances when supported or that the static/native fallback exposes the complete sequence; a working raw file does not prove the review path.

Fix material issues and re-capture. Record commands, observations, skipped checks, and remaining risk.
