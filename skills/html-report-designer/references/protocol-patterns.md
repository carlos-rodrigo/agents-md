# Protocol Pattern Library

This reference translates the local Tailwind Plus Protocol source into an independently authored static-document vocabulary. It describes visual behavior and selection rules; it does not redistribute Protocol component source or prescribe report content.

Local visual authority:

```text
~/Developer/tailwind-plus-protocol/protocol-ts/
```

Source areas reviewed:

```text
src/components/Layout.tsx
src/components/Header.tsx
src/components/Navigation.tsx
src/components/MobileNavigation.tsx
src/components/Prose.tsx
src/components/Heading.tsx
src/components/mdx.tsx
src/components/Code.tsx
src/components/Guides.tsx
src/components/Resources.tsx
src/components/Tag.tsx
typography.ts
```

## Fidelity principles

Protocol feels like documentation because it relies on a few disciplined choices:

- a persistent 18rem rail, expanding to 20rem on extra-wide screens;
- a quiet 3.5rem top bar with a hairline boundary and translucent white surface;
- a 48rem prose spine inside a wider 66rem artifact canvas;
- compact 14px body text with generous 28px line height;
- restrained 24px/32px page titles and 18px/28px section headings;
- zinc text and hairlines, with emerald reserved for navigation, links, focus, and small semantic emphasis;
- 64px section rhythm instead of a card around every thought;
- richer surfaces only when an object genuinely behaves like a note, code sample, resource, comparison, or figure.

Do not imitate the preview wrapper, application search, sign-in, theme switcher, global product links, or page-to-page navigation in a standalone report. Those belong to the hosted documentation application, not the report artifact.

## Pattern selection

| Pattern | Use when | Avoid when | Static construction |
| --- | --- | --- | --- |
| **Prose spine** | Narrative, rationale, rules, evidence, and conclusions lead | A real figure or comparison needs more width | Keep direct narrative content within 48rem; let only explicit wide artifacts use the 66rem canvas |
| **Section rail** | The authored document has at least two useful `h2[id]` destinations | The document is too short to benefit | Derive links progressively from authored headings; use a zinc rail, subtle active wash, and 1px emerald marker |
| **Compact top bar** | Persistent identity/status helps orientation while scrolling | It would become an application toolbar | Show document identity and status only; keep it 3.5rem high with a hairline and translucent paper surface |
| **Lead paragraph** | One sentence should frame the page outcome | Every paragraph wants emphasis | Use 16px/28px secondary text directly under the title |
| **Metadata tag** | A short method, status, category, or evidence label aids scanning | The value is long prose or decoration | Use tiny monospaced text; pair semantic color with readable text |
| **Document note** | A compact fact changes readiness, interpretation, or next action | The content is the main thesis or a whole section | Use a subtle emerald-tinted 1px border, 16px radius, compact icon/marker, and 16px padding |
| **Property list** | Named terms, responsibilities, states, acceptance categories, or contracts need definition | Items are steps or unrelated cards | Use divided rows with a narrow term column and flexible description; stack at narrow widths |
| **Ordered path** | Sequence or causality matters | Items are independent facts | Use a quiet divided list with numbered markers; avoid gradient cards and heavy containers |
| **Split row** | Two bodies of evidence must be compared at the same scale | Reading order matters more than comparison | Stack by default and form two columns only on wide screens; never squeeze long prose side by side |
| **Code group** | Code, payload, command, or contract shape is primary evidence | A short inline token is sufficient | Use a zinc-900 surface, 16px radius, quiet header strip, horizontal overflow, and searchable text |
| **Resource grid** | Several equivalent navigable resources or references deserve discovery | Requirements, risks, or decisions merely need grouping | Use 2–4 sparse columns with a top hairline or restrained resource cards; do not create dashboard tiles |
| **Resource card** | The whole object is a meaningful link or bounded resource | The object is ordinary prose | Use a quiet zinc surface, inset hairline, restrained radius, and minimal hover enhancement |
| **Section divider** | A major conceptual reset benefits from a pause | Every section boundary | Use one zinc hairline with 64px vertical rhythm; do not border every section automatically |
| **Hero wash** | A true overview/landing document needs one memorable orientation moment | Routine PRDs, designs, decisions, or long review documents | Optional only; use a faint emerald/lime wash and grid behind the opening, never behind dense content |
| **Figure canvas** | A supplied diagram/comparison needs wider geometry | The content is ordinary prose | Use the 66rem canvas, paper surface, accessible caption/walkthrough, and narrow-screen overflow |

## Hierarchy rules

- Page title: 24px, 32px line height, bold, compact measure.
- Lead: 16px, 28px line height, zinc secondary.
- Body: 14px, 28px line height, zinc-700 equivalent.
- Section heading: 18px, 28px line height, semibold.
- Subheading: 16px, 28px line height, semibold.
- Tiny labels/tags: 10–12px, monospaced only when the value behaves like metadata.
- Links: emerald with a transparent underline that becomes visible on hover/focus.
- Horizontal rules: zinc at very low opacity; use margin, not more decoration, to create hierarchy.

A report should read as prose with occasional instruments. If most sections are boxed, the composition has drifted into a dashboard and should be simplified.

## Responsive translation

Protocol uses a JavaScript drawer; the static report uses native `<details>` instead. Preserve the behavior, not the framework:

- hide the fixed rail at 64rem and below;
- keep the 3.5rem top bar;
- expose a native section control only when authored headings exist;
- render the mobile panel as a left-aligned sheet no wider than 24rem, with the remaining viewport acting as quiet backdrop;
- keep the article complete when JavaScript is unavailable;
- stack property lists and split rows without changing source order;
- allow wide figures/code to scroll locally rather than widening the page.

## Motion translation

Protocol animates application navigation and route transitions. Static reports should not copy that choreography.

- Default report content is fully visible and static.
- Use motion only for a supplied causal figure, state transition, or explicit review destination.
- Never add `data-motion-sections="enter"` to the shared shell or ordinary recipes.
- Keep reduced-motion, no-JavaScript, script-stripped, and print states complete.

## Anti-patterns

Do not use:

- 40–48px marketing titles in routine documentation;
- a border or tinted card around every section;
- equal-weight card galleries for requirements, risks, or acceptance criteria;
- bespoke decision cards when a heading, prose, and optional property rows carry the same meaning;
- hero gradients on every PRD/design;
- copied Protocol logos, application controls, or template source;
- dense two-column prose below wide desktop sizes;
- section animation as a default;
- ornamental tags, icons, and grids that carry no retrieval or semantic value.

## Build check

Before shipping a Protocol-derived report, confirm:

1. the reading spine is visually dominant;
2. the rail and top bar orient without competing with content;
3. type matches the compact 14/16/18/24 scale;
4. section rhythm comes primarily from whitespace;
5. every richer surface has a named semantic job;
6. narrow and no-JavaScript states preserve the full article;
7. print removes application chrome and preserves artifacts;
8. the output remains an independently authored static implementation.
