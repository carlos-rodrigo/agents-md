# Scrollytelling Product Stories

Use scrollytelling only when scroll position helps a reader follow a meaningful sequence, retained identity, or causal state change. A long page is not sufficient justification. Product UI, evidence, and consequences remain the story; motion is the camera.

## Eligibility

Choose this pattern when all are true:

- 3–8 approved beats form one causal sequence;
- the same fact, object, or product surface persists across beats;
- showing states in place is clearer than stacking screenshots;
- the source order is useful without motion;
- the implementation can preserve native vertical scrolling and complete fallbacks.

Prefer ordinary sections, a stepper, before/after, or a native horizontal gallery when the sequence is short, independent, primarily referential, or too dense for a viewport-height stage.

## Story unit

Pair every beat with:

```text
product state → visible change → reader meaning → retained proof
```

Use real or honestly illustrative product UI as primary evidence. Explanatory copy names what changed and why it matters; a compact proof line preserves the factual result. Do not substitute an architecture diagram, decorative shape, or atmospheric animation for a product consequence.

Let important states dwell. Use `hold → transition → hold` pacing so readers encounter complete, legible states more often than awkward half-panels. The transition should show continuity; the hold should support understanding.

## Composition and rhythm

- Normal vertical scrolling advances one bounded horizontal sequence. Do not intercept wheel or replace native page scrolling.
- Keep one sticky stage active at a time and provide ordinary document sections before and after it.
- Use a small spacing scale for stage insets, panel padding, UI internals, and chapter gaps. Give adjacent frames a real gutter rather than letting rounded borders touch.
- Keep editorial copy to a readable measure and reserve enough width for balanced headings.
- Reserve the strongest shadow for the focal product surface. Prefer tonal grouping and quiet borders for nested cards.
- Avoid scaling product mockups until labels become unreadable. Reflow, increase available space, crop a nonessential continuation honestly, or switch to the static/native layout first.
- A subtle subject-specific material may reinforce meaning, such as ledger ruling for retained records, but it must not compete with content.

## Progressive enhancement layers

Build in this order:

1. **Static source order.** Semantic headings, copy, states, proof, and controls exist in the DOM and remain visible. A native vertical stack or horizontal overflow/snap gallery is complete without scripts or advanced CSS.
2. **CSS scroll timelines.** Inside `@supports (animation-timeline: view())`, a sticky stage may bind track movement and progress to a view timeline. This is the core motion path for a JS-stripped review environment.
3. **JavaScript enhancement.** After loading, a class may opt into precise progress, focus, controls, interruption, and bidirectional horizontal/vertical synchronization. JavaScript must not be required to reveal content.
4. **Explicit fallbacks.** `<noscript>`, unsupported-browser, reduced-motion, short-viewport, enlarged-text, mobile, and print rules restore readable static/native composition.

A reviewer may remove every source `<script>` while preserving HTML and CSS. Treat that rendered output as a first-class target, not an error case. Do not infer support from the raw file working in a normal browser.

### Geometry rules

- Put the long scroll distance on a runway and the pinned composition on its sticky child.
- Do not put `overflow: hidden`, `auto`, or `scroll` on a non-scrolling runway ancestor; it can prevent sticky positioning. Clip horizontal movement at the track shell or viewport instead.
- Express frame count, track width, frame width, translation, runway height, and animation range as explicit variables.
- Account for frame gutters in the occupied width so each stop still aligns.
- Prefer transforms for track movement; avoid scroll handlers that continuously force layout.
- Keep native horizontal overflow available when the sticky stage is disabled.

## Interaction contract

Vertical scroll is primary, not exclusive. Preserve, where appropriate:

- Previous/Next controls and progress text;
- Left/Right and Home/End keys;
- touch swipe and manual horizontal scrolling;
- focus-visible states and stable DOM order;
- polite progress announcements without narrating every animation frame;
- synchronization from manual horizontal movement back to the corresponding story position.

Controls may be JavaScript enhancements. The states and reading path may not be.

## Fallback matrix

- **JS-stripped review:** CSS timeline runs when supported; otherwise the static/native gallery is complete.
- **No JavaScript:** source content is visible, controls that require scripts are absent, and native overflow/snap works.
- **Reduced motion:** remove continuous spatial interpolation and smooth scrolling. Show static states or discrete instant state changes while preserving composition and meaning.
- **Unsupported CSS:** do not pin an inert stage; expose normal document or gallery flow.
- **Mobile/reflow:** stack copy and UI, keep effective text readable, and avoid two-dimensional page overflow.
- **Short viewport or enlarged root text:** disable the sticky stage before it clips headings, controls, or evidence; use native horizontal or vertical flow.
- **Print:** expand every state in source order, remove sticky positioning/transforms, and include proof and boundaries.

## Review-environment test

Verify both the authored file and a script-stripped copy. A simple local emulation may remove source scripts before loading the result in Playwright:

```js
const stripped = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
```

For raw and stripped modes, capture the first, intermediate, and final state. Confirm changing transforms or discrete state changes while scrolling, then verify readable complete states at intentional stops.

Also test:

- 320px, intermediate, and wide viewports;
- reduced motion and no-JS;
- short viewport and enlarged text;
- keyboard, rapid interruption, swipe/manual scroll, and synchronization;
- page-level horizontal overflow;
- print expansion;
- console errors and stable review anchors.

A source check or one static screenshot cannot prove this pattern.
