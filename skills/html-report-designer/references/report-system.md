# Report System

## Page architecture

PRDs and designs use a static Protocol-derived documentation shell: one focused article column, a restrained fixed section rail on wide screens, a compact top bar, and a native `<details>` navigation panel on narrow screens. The body still has one unconstrained composition slot; the owning skill decides every section and its order.

The section rail is presentation, not content. A progressive inline script derives it only from authored `h2[id]` headings, while the full article remains readable without scripts. Hide all chrome in print. Do not add breadcrumbs, document switchers, dashboard strips, search, feedback widgets, sign-in, or other application controls. Generic reports remain one-column artifacts unless retrieval genuinely requires navigation.

## Protocol documents and Editorial Ink diagrams

Protocol is the visual authority for generated PRDs and designs: white and zinc surfaces, emerald emphasis, compact sans-serif typography, subtle rails, and almost no shadow. Editorial Ink remains the semantic color language for diagrams and the default visual system for generic reports. Consistency comes from tokens and behavior, never a fixed content order.

An established repository document system or explicit user direction may override the theme. Product interfaces do not inherit this palette; `frontend-design` follows the product's own visual authority.

Use one 48rem readable article column inside a 66rem Protocol canvas. Allow the wider canvas only for a real comparison, contract, resource group, or figure. Use the system sans stack throughout PRDs and designs; no remote font is required. Match Protocol's compact hierarchy: 14px/28px body, 16px/28px lead, 18px/28px section heading, and 24px/32px page title.

A technical-atlas composition may give figures more room, but it retains the same palette, typography, review anchors, static reading order, and print behavior.

## Canonical tokens

PRD/design shells use `#fff` page/paper, zinc `#18181b` / `#52525b` / `#71717a` text, zinc `#e4e4e7` borders, and AA-safe emerald `#047857` links/accent. Use the following Editorial Ink defaults for generic reports and semantic diagram categories:

```css
:root {
  --surface-page: #f3f0e9;
  --surface-paper: #fffefa;
  --surface-muted: #f7f4ed;
  --surface-strong: #ebe5d9;
  --text-primary: #211f1b;
  --text-secondary: #625d54;
  --text-tertiary: #766f64;
  --border: #d8d1c5;
  --border-strong: #aaa092;
  --accent: #a33b20;
  --link: #7e2f1b;
  --info: #285a75;
  --success: #276544;
  --warning: #8b4d00;
  --danger: #a11c1c;
  --external: #654a80;
  --info-soft: #eaf2f8;
  --success-soft: #e8f2eb;
  --warning-soft: #f8eedb;
  --danger-soft: #f8e8e5;
  --external-soft: #f1ecf6;
  --focus-ring: 0 0 0 3px rgba(163, 59, 32, .28);

  --type-body: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --type-display: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  --type-mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-16: 64px;

  --motion-feedback: 140ms;
  --motion-enter: 220ms;
  --motion-flow: 320ms;
  --motion-emphasis: 420ms;
  --motion-ease: cubic-bezier(.16, 1, .3, 1);
}
```

The primary, secondary, tertiary, accent, link, and semantic foregrounds meet WCAG AA for normal text against `--surface-paper`. Pair every color state with text, icon, shape, pattern, or line style. Use tonal surfaces, borders, spacing, and type before shadows. Use one restrained radius family and avoid arbitrary local values.

## Hierarchy

- First viewport: restrained title, status, one-sentence promise/conclusion, and compact source context.
- Section: conclusion-bearing heading, one-sentence point, supporting prose/example/evidence, optional detail.
- Keep narrative direct children on the 48rem prose spine.
- Use roughly 64px between major sections; do not draw a border between every section.
- Reserve the 66rem canvas for true comparisons, contracts, resource groups, and diagrams.
- Use cards only for bounded linked resources or genuinely interactive objects; requirements, risks, decisions, and acceptance evidence usually belong in prose, notes, or divided property lists.
- Avoid equal-weight card galleries that force readers to synthesize the story.

## Component semantics

- A **document note** changes risk, assumption, readiness, interpretation, or next action.
- A **property list** names terms, responsibilities, states, acceptance categories, contract values, or supplied decision tradeoffs in divided rows.
- A **decision** remains a Protocol heading and prose, with property rows only when named tradeoffs improve scanning; it is not a bespoke card.
- An **ordered path** explains sequence or causality with quiet numbered rows.
- A **split row** compares two equivalent evidence bodies and stacks outside wide layouts.
- A **code group** presents command, payload, or contract evidence on a zinc-900 surface.
- A **resource card** is a bounded navigable object—not default section chrome.
- A **table** represents a real matrix or comparison.
- A **disclosure** contains supporting detail, not the conclusion or primary recovery path.
- A **figure** answers a named question and owns caption, evidence, review anchors, and text equivalent.
- A **selector** represents a real reviewer choice, not ceremony.

Read `protocol-patterns.md` before selecting or constructing these patterns.

## Diagram language

The calling skill and `system-diagram` decide whether a figure exists and what it says. This design system controls its appearance:

- paper or muted-paper background;
- 2px ink or semantic strokes;
- soft semantic fills with matching dark labels/strokes;
- verb-labelled arrows in ink;
- neutral dashed ownership or system boundaries;
- 12px minimum effective SVG text;
- semantic categories paired with labels and a legend;
- title, description, caption, text equivalent, and stable review anchors;
- optional `flow` motion in `context → action → result → recovery` order.

Recommended semantic mapping: information/source uses blue, result/success uses green, decision/warning uses ochre, blocker/risk uses red, and external/secondary systems use violet. Excalidraw remains available when its authored visual character helps, but no renderer or diagram is mandatory.

## Trust layer

Include generated/updated date, source paths, approved authority, assumptions, open questions/owners, related artifacts, and validation state where useful. Keep provenance compact and close enough to verify claims.
