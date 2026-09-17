---
name: frontend-design
description: "Design or implement truthful, accessible, responsive interfaces and proposed review mockups. Triggers on: build UI, design a page, create a mockup, redesign, frontend interface."

# Frontend Design

Build or propose one coherent interface that fits the product, makes the primary job obvious, and remains usable across states and screen sizes.

## Before designing

Inspect product authority, nearby UI, terminology, assets, tokens, components, accessibility conventions, and rendered screens. Separate established behavior from proposed behavior. Ask when missing authority changes product behavior, permissions, data, or interaction model.

Choose one surface mode: **Operate**, **Read**, **Persuade**, or **Experience**. Preserve the existing visual system unless a redesign is explicitly approved.

## Proposed mockup

For an explicit pre-approval mockup request:

- create one self-contained `mockups.html`; do not modify application code;
- label it **Proposed / not approved** and invented records **Illustrative**;
- use the repository's canonical mockup renderer and visual system when available;
- keep feature-specific UI inside the product surface, not the shared shell;
- show the primary path and only consequential states;
- verify the rendered artifact, not just its source.

## Design the complete path

Cover the applicable sequence:

```text
arrival → intent → action → feedback → progress → completion → recovery
```

Include relevant initial, loading, empty, success, validation/error, conflict, disabled, permission, offline, pending, and unsaved states. Keep action names stable, preserve recoverable input, prevent unsafe duplicate actions, and never rely on color or motion alone.

Use semantic HTML, real labels, links for navigation, buttons for actions, visible keyboard focus, logical focus movement, accessible names, readable contrast, and reduced-motion behavior. Check long content, narrow/intermediate/wide layouts, 200% text resize, and 400% reflow where relevant. Treat dark mode as a real state.

Use intrinsic layout and semantic tokens. Avoid page-level horizontal scrolling, absolute positioning for meaning-bearing relationships, decorative noise, fabricated evidence, and dependencies without a current need.

## Review

Check:

- product authority and invented behavior;
- primary interaction and one meaningful recovery path;
- keyboard/focus and non-color meaning;
- light/dark contrast and semantic states;
- responsive and content resilience;
- reduced motion and no-script/static fallback when promised;
- self-contained assets and available lint, typecheck, tests, accessibility, build, and visual checks.

## Output

```text
Frontend: {paths}
Artifact: implementation | Proposed / not approved mockup
Mode: {Operate | Read | Persuade | Experience}
Authority: {sources | unresolved questions}
States: {covered states}
Verification: {commands and manual/rendered checks}
Risks: {none | concise list}
```
