# Accessibility and Motion

## Structural access

- Exactly one `<h1>` and a non-skipping heading hierarchy.
- Skip link to `<main id="main">`.
- Semantic landmarks and native controls.
- Visible `:focus-visible` treatment and logical focus/DOM order.
- Strong text/control contrast and no color-only meaning.
- Tables use caption, headers, and scope.
- Closed disclosures print expanded.
- Rich HTML is never hidden behind `role="img"`.

## Figures

Every complex figure has:

- a visible question/how-to-read note;
- `<figure>/<figcaption>`;
- SVG `<title>` and `<desc>` or equivalent accessible naming;
- readable labels, at least 12px effective size for diagrams;
- nearby structured text equivalent tied to the figure;
- stable review anchors on consequential groups.

## Motion

Motion belongs to this document system and is optional. Add it only after naming the approved relationship, state change, causal order, or review destination it clarifies. Durable artifacts use only semantic values:

```html
data-motion="enter"
data-motion="flow"
data-motion="state"
data-motion="target"
```

Use the bundled `../resources/artifact-motion.js`. Do not add a motion dependency or richer runtime unless repository policy and the user explicitly approve it.

- Source HTML starts visible.
- No-JS, JS-stripped review, and unsupported browsers preserve every state and conclusion.
- When review tooling removes source scripts, core scrollytelling uses a supported CSS timeline or falls back to static/native source order; JavaScript-only visibility or movement is not acceptable.
- Reduced motion removes continuous opacity/spatial entrance, stagger, path drawing, and smooth scrolling while preserving composition and semantic states.
- Do not animate paragraphs, code lines, table rows, every card, or every section.
- Keep first-viewport title, conclusion, warning, and review action immediately available.
- Sequence one local causal group at a time; default documents should have no entrance choreography.
- Preserve Excalidraw `.diagram-reveal` wrappers and renderer-authored order when a diagram uses them.
- Print exposes every final state.

## Interaction

- Copy, feedback, filter, selector, and disclosure behavior remains keyboard accessible.
- Async result text uses appropriate live-region semantics.
- Review controls do not claim persistence unless it exists.
- A UI library must preserve native semantics, labels, focus, offline bundling, and print/static summary.

## Fallback checks

Test:

1. JavaScript enabled, normal motion.
2. JavaScript disabled.
3. Source scripts stripped as the review environment will render them.
4. `prefers-reduced-motion: reduce`.
5. Keyboard-only navigation and manual horizontal movement when applicable.
6. Narrow/reflow, short-height, enlarged-text, and wide viewport.
7. Print rendering.

The conclusion, source, boundary, and next action must survive every mode.
