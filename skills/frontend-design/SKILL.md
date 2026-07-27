---
name: frontend-design
description: "Create distinctive, production-grade frontend interfaces with high design quality. Use when building web components, pages, or applications. Do not use for pure UI review/accessibility audit; use web-design-guidelines. For React/Next performance patterns, pair with vercel-react-best-practices."
---

# Frontend Design

Build working user interfaces that are truthful to the product, complete across relevant states, accessible, resilient, and visually intentional.

Use this skill for implementation or approved redesign work. For review-only accessibility or UX findings, use `web-design-guidelines`. For React or Next.js performance and rendering shape, pair with `vercel-react-best-practices`.

## Quality precedence

When goals compete, use this order:

1. approved product truth and user safety;
2. task completion, accessibility, and recovery;
3. continuity with the established product system;
4. clear hierarchy and content resilience;
5. product-specific visual character;
6. novelty or decorative polish.

A memorable surface that invents behavior, hides state, or breaks the surrounding product is a failed design.

## Surface mode

Name one primary mode before designing. A secondary mode may support it, but should not compete with it.

- **Operate:** help someone complete a task, monitor state, or recover from failure. Familiar controls, speed, state clarity, and safe actions lead.
- **Read:** help someone understand, compare, or retrieve dense information. Hierarchy, measure, navigation, and evidence lead.
- **Persuade:** help someone understand a product promise and trust its proof. Real mechanisms, outcomes, and credible evidence lead.
- **Experience:** make exploration or interaction itself meaningful. Orientation, control, fallback, and purposeful motion still remain explicit.

## Workflow

1. Inspect the request, approved product source, nearby UI, theme tokens, component library, accessibility conventions, and representative rendered screens.
2. Identify the audience scene, primary job, current state, expected result, and meaningful failure or recovery path.
3. Run the product-authority check before adding controls, rules, data, or capabilities.
4. Select the surface mode and preserve the existing visual authority unless a redesign is explicitly approved.
5. Define the smallest representative state set and content needed to prove the flow.
6. Implement with project-native components and patterns where available.
7. Exercise the primary path, one material recovery path, responsive/content stress, keyboard/focus, and relevant repository gates.

Ask only when an unresolved answer materially changes product behavior, scope, risk, or the interaction model. State uncertainty instead of filling it with plausible UI.

## Product truth and authority

Every required behavior needs authority from the user request, an approved PRD/design, or the existing product.

Do not invent required controls, fields, roles, domain categories, validation, completion rules, storage behavior, export behavior, or product capabilities. Keep unsupported content generic, label a proposal as conditional, or ask when the answer changes the result.

Example quantities describe scale, not limits or business rules. Representative records, names, and values must be truthful or clearly illustrative. Missing data must not silently become zero, success, permission, or an empty result.

For established products, continuity is the default:

- preserve shell, navigation, terminology, typography, density, controls, and state treatment;
- reuse the product's component and token system;
- inspect the rendered interface, not only design-system files;
- keep feature distinctiveness inside the product rather than making it look like another application.

Read `references/interaction-and-states.md` before designing behavior with incomplete product authority.

## State completeness

Design the complete path, not one polished screenshot. Cover only states the product can encounter, but do not omit a relevant state because it complicates the composition.

At minimum, reason through:

```text
arrival → intent → action → feedback → progress → completion → recovery
```

Depending on the feature, this may require initial, loading, partial/stale, empty, success, validation/error, conflict, disabled, permission, offline, or unsaved-change states. Keep action names stable through transitions, preserve recoverable input/context, prevent unsafe duplicate actions, and make status understandable without color or motion alone.

Use semantic controls, explicit labels, predictable focus movement, and links for navigation versus buttons for actions. Read `references/interaction-and-states.md` for the state matrix, forms, navigation, motion, and app-like artifact guidance.

## Visual direction

Derive visual choices from the product, audience, task, content, brand, and real-world subject matter. Do not choose from canned aesthetic extremes or add novelty as proof of design quality.

For an existing product, extend its current visual language. For a genuinely new surface or approved redesign:

- inspect real assets, terminology, mechanisms, and audience context;
- compare materially different structural directions only when a real decision remains;
- define type, color roles, spacing, shape, imagery, hierarchy, and one product-specific signature when earned;
- keep surrounding UI quiet enough for task clarity and evidence;
- remove any decorative detail that cannot explain its relationship to meaning, hierarchy, or interaction.

Use semantic design tokens instead of scattered values. Cards should represent bounded objects or actions, not become default section wrappers. Read `references/visual-direction.md`; for greenfield or approved redesign work also read `references/new-surface.md`.

## Content and layout resilience

Build intrinsic layouts with stable source and reading order. Verify short, representative, long, localized, missing, multiline, and unbroken content where relevant.

Do not use absolute positioning for meaning-bearing connectors, timeline rails, labels, or state relationships that can detach from variable-height content. Prefer flow-relative borders, grid tracks, per-item markers, or removal of purely decorative connectors.

Check narrow and intermediate widths, 200% text resize, and 400% reflow where applicable. Support RTL and safe areas when the product requires them. Essential controls and meaning must not clip, overlap, become unreadably scaled, or force page-level horizontal scrolling.

## Interaction and motion

Motion must clarify feedback, state, continuity, causal order, or spatial origin. It is not a default polish layer.

- Keep routine feedback prompt and consequential layout motion restrained.
- Preserve object identity instead of replacing every state with an entrance animation.
- Make motion interruptible when input, navigation, server state, or cancellation supersedes it.
- Reduced motion removes delay and spatial/opacity choreography while preserving state, focus, and completion.
- Prefer CSS and project-native primitives; add a dependency only when repeated timelines, gestures, or shared-layout cleanup justify it.

For app-like interactive browser artifacts that filter, compare, select, or export substantial data, evaluate native controls against an appropriate bundled accessible UI library. Preserve explicit state and failure behavior, work offline when promised, and preserve a printable or static summary that remains understandable without the interactive runtime.

## Implementation

- Use semantic HTML and accessible names before custom roles.
- Reuse repository components, tokens, utilities, and state conventions.
- Keep controls keyboard-completable with visible, unobscured focus.
- Pair color with text, shape, icon, line style, or pattern where meaning depends on it.
- Keep dependencies and client-side JavaScript proportional to the current requirement.
- Use real or honestly illustrative content and imagery; do not fabricate product evidence.
- Do not turn implementation convenience into a new product rule.

## Verification

Run the smallest checks that prove the actual risk, then the repository gate. A clean screenshot alone is not completion.

Verify as applicable:

- lint, typecheck, unit/integration tests, and production build;
- primary interaction and one meaningful failure/recovery path;
- keyboard completion, focus movement, names, announcements, and contrast;
- narrow, intermediate, wide, 200% text, 400% reflow, long/localized content, and RTL;
- reduced motion and static/no-script fallback when promised;
- automated accessibility, visual regression, performance, and bundle checks available in the repository;
- captured desktop/mobile states compared with the brief and neighboring product surfaces.

Audit newly introduced controls, roles, rules, persistence, export, and capabilities against their product authority before finishing. Read `references/verification.md` for the complete verification matrix.

## References

Load only what the task needs:

- `references/interaction-and-states.md` — product authority, state matrix, forms, navigation, resilience, motion, and app-like artifacts;
- `references/visual-direction.md` — product-grounded visual hierarchy and specificity;
- `references/new-surface.md` — discovery and direction contract for greenfield or approved redesign work;
- `references/verification.md` — source audit, browser/manual checks, accessibility, resilience, performance, and visual critique.

## Output

Report:

```text
Frontend: {paths changed}
Mode: {Operate | Read | Persuade | Experience}
Product authority: {sources inspected | unresolved questions}
States covered: {representative states}
Verification: {commands and rendered/manual checks}
Remaining risk: {none | concise list}
```
