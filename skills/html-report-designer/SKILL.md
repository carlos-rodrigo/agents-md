---
name: html-report-designer
description: "Design and generate self-contained, reviewable HTML reports for PRDs, feature designs, architecture diagrams, research briefs, and decision documents. Triggers on: html report, report design, enjoyable document, prd.html, design.html, reviewable html, document UI/UX."
---

# HTML Report Designer

Use this skill when a durable agent-generated document should be read and reviewed in a browser, not as a flat Markdown file.

Default durable artifacts:

```text
docs/features/{feature}/prd.html    # product source of truth and review artifact
docs/features/{feature}/design.html # high-level solution/design source of truth and review artifact
```

Markdown variants are legacy/compatibility outputs. Do not create a separate `.md` version by default unless the user asks or the repo already requires one.

## Research basis

This skill is grounded in these patterns:

- Google Technical Writing: large docs need a clear outline, useful introduction, task/reader-oriented headings, navigation, signposting, and progressive disclosure.
- NN/g long-form content research: readers scan; summaries, concise bullets, callouts, selective emphasis, in-page links, and informational visuals improve comprehension and engagement.
- Diátaxis: choose document form by reader need. PRDs and designs are usually explanation/decision artifacts, not tutorials or reference dumps.
- web.dev / W3C accessibility guidance: use semantic HTML landmarks, meaningful heading order, lists/tables, skip links, labelled regions, and keyboard-friendly structure.
- Elastic dashboard guidance: understand audience/time/goal, put most important content first, group related panels, use hierarchy/margins, make labels self-explanatory, and use color consistently.
- Vercel Geist `design.md`: define explicit design tokens, semantic color scales, 4px spacing rhythm, restrained shadows, focus-visible rings, reduced-motion-aware interactions, and precise UI copy.
- Tailwind Typography / utility layout patterns: use constrained prose where reading matters, responsive `minmax()` grids where cards matter, `overflow-wrap:anywhere` for paths/code, and utilities as a discipline for predictable spacing rather than random one-off CSS.
- Primer, Carbon, Atlassian, and Radix Themes: production documentation UIs rely on tokens, accessible primitives, concise content labels, clear action states, and themeable components rather than decorative containers.
- NN/g layer-cake scanning: strong descriptive headings, visible subheads, chunks, labels, and summaries help readers scan long technical documents without reading every word.

## Report design system

Use a compact token system inspired by Vercel’s `design.md`: explicit tokens first, then components. Do not hand-tune random sizes/colors per report.

Core token families:

```css
:root {
  /* surfaces */
  --surface-100: ...; /* page/card surface */
  --surface-200: ...; /* subtle separation only */
  --surface-300: ...; /* raised/selected surface */

  /* text */
  --text-1000: ...; /* primary */
  --text-900: ...;  /* secondary */
  --text-700: ...;  /* disabled/muted */

  /* borders and overlays */
  --border-400: ...;
  --border-500: ...;
  --alpha-100: ...;

  /* semantic accents */
  --accent-700: ...;
  --info-700: ...;
  --success-700: ...;
  --warning-700: ...;
  --danger-700: ...;

  /* rhythm */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-16: 64px;
  --space-24: 96px;

  /* shape */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}
```

Layout rhythm:

- `8px` inside tight groups.
- `16px` between related groups.
- `24px` card padding.
- `32–40px` between report sections.
- `64–96px` for major page breaks or hero spacing.

Hierarchy rules:

- Prefer tonal surfaces, borders, spacing, and type scale before heavy shadows.
- Use one radius family per report; do not mix very sharp and very rounded shapes without reason.
- Use no more than two font weights in the same view unless code/metadata requires it.
- Use solid accent color only for state, focus, and the most important review action.
- Pair every color state with text/icon/pattern; color alone is not enough.

## UX contract

Every HTML report should be:

1. **Glanceable** — the first viewport answers: what is this, status, decision needed, and next action.
2. **Navigable** — sticky table of contents, semantic headings, stable anchors, and skip link.
3. **Scannable** — short sections, bullets, cards, labels, tables, and callouts instead of walls of text.
4. **Reviewable** — stable `data-review-id` anchors on sections/cards/diagram nodes; visible anchor labels when helpful.
5. **Truthful** — product facts, assumptions, open questions, and design decisions are clearly separated.
6. **Enjoyable** — an intentional visual point of view: editorial, calm, warm, and precise; not a generic white-page dump.
7. **Portable** — one self-contained `.html` file with inline CSS/SVG and no required external network assets.
8. **Accessible** — semantic HTML, contrast-safe colors, keyboard navigation, reduced-motion respect, and no text trapped only in images.

## Generation quality contract

Every generated report must pass this definition of done before handoff:

- first viewport states the reader goal, status, owner, audience, readiness, source path, and next review action;
- no unresolved `{{PLACEHOLDER}}` tokens remain in generated docs;
- exactly one `<h1>`, a skip link to `<main id="main">`, semantic landmarks, and non-skipping heading order;
- stable, unique `data-review-id` anchors on sections, cards, tables rows, and important diagram groups;
- no external network assets are required to read or print the report;
- tables have captions and scoped headers; SVG diagrams have `<title>`/`<desc>` or a surrounding figure caption;
- assumptions, facts, decisions, risks, and open questions are visually separated;
- motion is optional progressive enhancement and respects `prefers-reduced-motion`;
- print view is usable;
- PRDs do not leak architecture and designs do not invent product behavior.

When available, run the validator on generated reports:

```bash
node /Users/carlosrodrigo/agents/scripts/validate-html-report.mjs docs/features/{feature}/prd.html
node /Users/carlosrodrigo/agents/scripts/validate-html-report.mjs docs/features/{feature}/design.html
```

Use `--allow-placeholders` only for validating templates, never for finished reports.

## When to use

Use for:

- PRDs (`prd.html`),
- feature designs (`design.html`),
- system/architecture diagram pages,
- research briefs,
- ADR explainers or decision review packets,
- any long-form agent output the user will review visually.

Do not use for tiny notes, task briefs, or throwaway logs. Task briefs stay Markdown under `.features/{feature}/tasks/` because agents read them more than humans do.

## Page architecture

Use a self-contained HTML report shell:

```html
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="hero" data-review-id="summary">...</header>
  <div class="report-layout">
    <nav class="toc" aria-label="Table of contents">...</nav>
    <main id="main">...</main>
    <aside class="review-rail" aria-label="Review guide">...</aside>
  </div>
</body>
```

Required landmarks:

- one `<header>` for title/summary/status,
- one `<nav aria-label="Table of contents">`,
- one `<main id="main">`,
- optional `<aside>` for review guide/metadata,
- meaningful `<section aria-labelledby="..." data-review-id="...">` blocks,
- one `<footer>` for provenance/update info when useful.

Template starting points:

```text
resources/report-template.html # shared component system and generic review packet
resources/prd-template.html    # PRD-specific product review packet
resources/design-template.html # design-specific architecture review packet
```

Start from the most specific template. Use `report-template.html` when creating research, ADR, decision, or custom review packets.

## Information design pattern

### Top viewport

The first screen should include:

- document title,
- status pill: Draft / Review / Approved / Blocked / Superseded,
- owner/audience when known,
- one-paragraph summary,
- 3-5 key takeaways or decisions,
- next review action,
- source links/paths.

### Main body

Prefer sections with a one-sentence point at the top, then details.

Use these named components instead of inventing one-off containers:

- **Executive dashboard / status strip** for status, owner, audience, readiness, source path, and next action.
- **Takeaway list** for 3-5 review-critical points in the first viewport.
- **Decision cards** for chosen direction, rejected alternatives, tradeoffs, and open risks.
- **Requirement/story cards** for PRD behavior with stable STORY/REQ/AC IDs.
- **BDD example panels** for main, edge, error, empty, loading, and permission examples.
- **Coverage matrices** for PRD requirement → design mechanism → verification hook.
- **Open-question and assumption tables** with owner, blocker status, impact, and resolution path.
- **Flow panels / figure cards** for current/intended behavior and component communication.
- **Callouts** for assumption, risk, blocker, note, open question, and readiness.
- **Details disclosures** for long examples, raw evidence, or lower-priority scenarios.
- **Source/provenance lists** for paths, ADRs, tasks, and verification state.

### Visual/UX patterns from research

Bake these patterns into every future generated report:

- **Executive dashboard first viewport** — status, owner, audience, readiness, sources, next action, and key takeaways before long-form content.
- **Layer-cake scanning** — heading → one-sentence summary → cards/tables/callouts → optional details. Do not bury the point in prose.
- **Diátaxis-specific shapes** — PRDs are product explanation/acceptance packets; designs are architecture decision/communication packets.
- **Review-first anchors** — review IDs are visible enough for humans to reference and stable enough for `/review` comments.
- **Decision cards over paragraphs** — architecture/product choices should show chosen direction, why, alternatives, tradeoffs, and risks.
- **Matrices for trust** — acceptance, coverage, assumptions, and questions belong in tables when structure matters.
- **Diagram-as-figure** — every diagram needs a title, how-to-read note or caption, legend, review IDs, and uncertainty if relevant.
- **Tokenized visual system** — use semantic tokens and component classes; avoid local color/spacing improvisation.
- **Editorial technical atlas aesthetic** — warm paper, high-contrast ink, restrained accent, calm density, first-class diagrams.
- **Trust/provenance layer** — generated/updated date, source paths, related docs, owners, assumptions, open questions, and validation state.

### Review rail

The optional right rail should guide review instead of duplicating content:

- “Review these first” list,
- open questions count,
- anchor IDs that reviewers can mention,
- readiness checklist,
- links to PRD/design/ADRs/tasks.

## PRD report pattern

For `docs/features/{feature}/prd.html`, include:

```text
summary                  # status, user, capability, outcome, success signal
problem                  # why now, pain, opportunity
users-and-jobs           # users/actors and desired jobs/outcomes
scope                    # in, out, non-goals
constraints              # product/UX/API/security/performance/migration constraints
requirements             # story cards with stable STORY/REQ IDs
examples                 # BDD examples, main/edge/error/empty/permission
acceptance               # AC checklist grouped by story
assumptions              # explicit assumptions with impact if wrong
open-questions           # owner, blocks design/task/none, resolution
ready-for-design         # readiness checklist and next action
```

PRD HTML must avoid architecture leakage. It can link to `design.html`, but product acceptance stays in `prd.html`.

## Design report pattern

For `docs/features/{feature}/design.html`, include:

```text
summary                  # feature, PRD link, status, review action
pattern-research         # sources and design-shaping insights
design-thesis            # chosen solution shape and why it fits
current-flow             # current behavior/system map
intended-flow            # intended behavior/system map
component-communication  # boundaries and handoffs
domain-model             # concepts, states, lifecycle
design-decisions         # decisions, alternatives, tradeoffs
operational-concerns     # rollout, rollback, observability, migration
requirement-coverage     # how PRD requirements map to design
tasks-and-feedback       # task boundary hints and feedback-loop hooks
open-questions           # blockers and owner
```

Use the `system-diagram` skill for diagrams inside the design report. Use this skill for the report shell, layout, visual hierarchy, and review UX.

## Visual direction

Default aesthetic: **editorial technical atlas**.

Characteristics:

- warm paper background and high-contrast ink,
- one strong accent plus semantic colors,
- generous spacing and calm density,
- cards with subtle borders/shadows,
- readable type scale,
- diagrams treated as first-class figures with captions,
- code/IDs as small chips, not noisy monospace everywhere,
- restrained motion; scroll appearance may guide reading, but never hide meaning or distract from review.

Avoid:

- generic purple/blue gradient SaaS look,
- tiny SVG text,
- giant walls of text,
- low-contrast pastel labels,
- decorative visuals that do not explain anything,
- hidden navigation,
- remote fonts/images required to read the doc,
- JavaScript-only content.

## Motion and scroll appearance

Motion is allowed when it improves orientation, especially for long reports and diagrams, but it must be progressive enhancement.

Use motion for:

- section/card reveal as the reader scrolls,
- diagram node reveal in reading order,
- anchor-target emphasis after following a TOC/review link,
- small disclosure transitions around optional details.

Do not use motion for:

- looping decoration,
- parallax that competes with reading,
- moving text while the user is trying to inspect it,
- hiding content until JavaScript loads.

Implementation rules:

- Default content must be visible without JavaScript.
- If JavaScript is used, add a `.js` class and reveal `.reveal` elements with `IntersectionObserver`.
- Respect `prefers-reduced-motion: reduce` by disabling animation and showing everything immediately.
- Keep reveal distance small: `8–16px` vertical movement.
- Keep reveal duration short: `160–260ms` for cards, `260–420ms` for diagram groups.
- Stagger only within a local group; avoid long page-wide choreography.
- Use `:focus-visible` rings on links, summaries, buttons, and review anchors.

Recommended pattern:

```html
<section class="section-card reveal" data-review-id="scope">...</section>
<script>
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => observer.observe(el));
  }
</script>
```

## Voice and content

Copy is part of the interface. Keep report text precise and review-oriented.

- Use Title Case for labels, badges, navigation items, and action-like headings.
- Use sentence case for body text, helper text, and explanations.
- Name next actions with a verb and noun: `Review Scope`, `Resolve Open Questions`, `Approve PRD`.
- Write blockers/errors as what happened plus what to do next.
- Empty states point to the first action: `No open questions. Review acceptance criteria next.`
- Use numerals for counts: `3 open questions`.
- Use the ellipsis character for progress states: `Reviewing…`.
- Avoid filler, “successfully”, “please”, and marketing superlatives.

## Review anchors

Add stable anchors to all review-worthy units:

```html
<section data-review-id="requirements.story-001" aria-labelledby="story-001-title">
<article data-review-id="decision.cache-strategy">
<g data-review-id="diagram.worker-retry-boundary">
<tr data-review-id="acceptance.ac-003">
```

Anchor naming rules:

- use lowercase dot/kebab IDs,
- tie IDs to durable concepts (`story-001`, `decision.retry-policy`), not visual order,
- never reuse an ID in the same file,
- do not use generated/random IDs,
- preserve IDs when editing so review comments remain meaningful.

## Accessibility checklist

Before finishing, check:

- [ ] exactly one `<h1>`;
- [ ] heading levels do not skip randomly;
- [ ] all major regions use semantic landmarks;
- [ ] skip link exists and targets `<main id="main">`;
- [ ] color is not the only signal;
- [ ] contrast is strong enough for body text and labels;
- [ ] SVG has `<title>`/`<desc>` or surrounding figure caption;
- [ ] diagram text is at least 12px effective size;
- [ ] tables use `<caption>`, `<th>`, and `scope` where appropriate;
- [ ] interactive disclosure uses native `<details>/<summary>`;
- [ ] print view is usable;
- [ ] content remains understandable with CSS/JS disabled.

## Build rules

- Use one `.html` file with inline CSS.
- Use inline SVG for diagrams.
- Avoid external dependencies unless the user explicitly wants a richer app. For self-contained reports, borrow proven patterns from Tailwind/Radix/Primer/Carbon but implement them as local tokens and CSS.
- If adding JavaScript, it must be optional enhancement only.
- Prefer native HTML components over custom widgets.
- Keep CSS organized with variables, components, and print styles.
- Include provenance: generated/updated date and source paths.
- Validate finished reports with `scripts/validate-html-report.mjs` when available.
- Open the file in a browser when possible:

```bash
open docs/features/{feature}/prd.html
open docs/features/{feature}/design.html
```

## Output

End with:

```text
HTML report: {path}
Mode: {PRD | design | diagram | research | decision}
Status: {Draft | Review | Approved | Blocked}
Review anchors: {yes | no + reason}
Validation: {passed | not run + reason | failed + key issue}
Opened: {yes | no + reason}
Next review action: {what the user should inspect first}
```
