# Artifact Patterns

Load only the pattern required by the named reader question.

## Canonical flow

Use 3–7 ordered steps. Each step names actor/trigger, action, visible or system effect, and next meaningful state. Put material conflict/recovery beside the step it branches from.

Mark the list `data-motion="flow"` only when timing materially clarifies order.

## Concrete scenario

Use trigger → expected effect → invariant → recovery/next action. Lead with one canonical scenario; add an exception only when outcome, trust, authority, or recovery changes.

## Decision

State chosen direction, why, evidence, plausible alternatives, tradeoffs, reversibility, owner, and next action. Do not present fake options.

## Before/after

Preserve the same baseline and object identity. Use side-by-side layout only for 2 compact equivalent states; otherwise stack in reading order. State what changed and what remained invariant.

## Evidence

Put a source anchor beside the claim it supports. Separate observation, interpretation, assumption, and decision. Keep raw logs, screenshots, and research notes in disclosures or owning artifacts.

## Contracts and code-like shapes

Give code blocks full width. Stack multiple shapes vertically. Put one property per line where scanability matters. Use semantic labels and avoid hiding code from assistive technology.

## Interface evidence

Inspect the real product first. Reproduce recognizable shell, navigation, density, terminology, controls, and state treatment. Compare the smallest material placement/workflow delta. Rich HTML wireframes use `<figure>/<figcaption>` and retain child semantics.

Use `frontend-design` when an embedded artifact becomes a real interactive surface. Reuse the product's component/UI library where available; for a standalone app-like artifact, evaluate any library through repository dependency policy and explicit approval.

## Reviewer controls

Use native radio/checkbox/text controls with labels and fieldset/legend. Keep choices adjacent to evidence. Include free text only when the known option set may be incomplete. Controls in a static HTML report communicate review intent; do not imply persistence unless implemented.

## Data visual

State question, claim, units, baseline, source, transformation, freshness, uncertainty, unavailable behavior, and text equivalent. Never use animation to conceal the final values or method.

## System figure

Use `system-diagram`. Require:

- explicit question and decision/understanding unlocked;
- accessible SVG title/description and caption;
- semantic legend tied to this figure;
- labelled causal edges;
- readable text and explicit boundaries;
- adjacent numbered walkthrough;
- stable review IDs;
- static final state plus optional flow motion.

Use the build-time Excalidraw renderer when sketch geometry helps and the figure gate passed. The renderer is a medium, not a reason to create a diagram.

## Open question

Name impact, owner, blocker status, evidence needed, resolution path, and next decision. An unanswered architecture question does not become product scope, and vice versa.
