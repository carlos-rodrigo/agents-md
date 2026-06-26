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
- Mintlify / Stripe / Twilio / Pinecone-style developer docs: organize around real user journeys, make examples and errors first-class, keep search/navigation obvious, and optimize time-to-confidence.
- Vercel Docs / Primer / Docusaurus / MkDocs Material: use a docs-app shell with collapsible side navigation, breadcrumbs, explicit heading IDs, prev/next links, admonitions, tabs, and feedback affordances. Keep page content clean, default to a Vercel-like light neutral documentation surface, and avoid a top menu or right rail for this template family unless explicitly requested.
- GitHub Docs content model: keep “get started” content minimal, separate concepts/how-tos/reference, use reusable content patterns, and make next steps obvious.
- Atlassian Design System: use page headers, breadcrumbs, badges/lozenges, section messages, tables, tabs, focus primitives, and design tokens as composable primitives.

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

1. **Glanceable** — the first viewport answers: what is this, why it matters, and what decision/review is needed.
2. **Navigable** — sticky table of contents, semantic headings, stable anchors, and skip link.
3. **Scannable** — short sections, bullets, cards, labels, tables, and callouts instead of walls of text.
4. **Reviewable** — stable `data-review-id` anchors on sections/cards/diagram nodes; visible anchor labels when helpful.
5. **Truthful** — product facts, assumptions, open questions, and design decisions are clearly separated.
6. **Enjoyable** — an intentional visual point of view: editorial, calm, warm, and precise; not a generic white-page dump.
7. **Portable** — one self-contained `.html` file with inline CSS/SVG and no required external network assets.
8. **Accessible** — semantic HTML, contrast-safe colors, keyboard navigation, reduced-motion respect, and no text trapped only in images.

## Generation quality contract

Every generated report must pass this definition of done before handoff:

- first viewport states the reader goal, current review state, and what the reviewer should focus on without using a dashboard-style metric strip;
- Vercel-like docs shell exists: breadcrumbs, collapsible left sidebar, no top menu, no right sidebar, prev/next, related links, feedback widget, and back-to-top affordance;
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

Use a self-contained Vercel-like docs shell:

```html
<body data-visual-mode="vercel-docs-packet">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="doc-shell">
    <aside class="side-nav" aria-label="Document navigation">
      <details class="index-details" open>
        <summary><span class="nav-title">Document</span></summary>
        <nav aria-label="Table of contents">...</nav>
      </details>
    </aside>
    <main id="main">...</main>
  </div>
  <a class="back-to-top" href="#main">...</a>
</body>
```

Required landmarks and shell components:

- no top navigation menu unless the user explicitly asks for one,
- breadcrumbs before the article header,
- one collapsible left sidebar/document index grouped by reader journey,
- one `<nav aria-label="Table of contents">` inside the left index for active in-page headings,
- one `<main id="main">`,
- one article header for title/summary/status/meta,
- meaningful `<section aria-labelledby="..." data-review-id="...">` blocks,
- previous/next document links,
- related links/artifacts block,
- feedback widget,
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

- **Docs shell**: `.breadcrumbs`, `.doc-shell`, `.side-nav`, `.index-details`, `.prev-next`, `.related-links`, `.feedback-widget`, `.back-to-top`.
- **Article metadata** for status/date/type as compact pills; avoid owner/outcome/next-action metric-card strips unless explicitly requested.
- **Takeaway list** for 3-5 review-critical points in the first viewport.
- **Step lists** for review paths, setup/review sequence, and approval flow.
- **Tabs** for paired perspectives such as scenario/evidence, current/intended, or decision/alternative.
- **Copyable code/evidence blocks** for prompts, commands, API examples, or exact source snippets.
- **Conceptual contract lists** for multiple code-like data shapes; stack them in a single column with `contract-list` instead of a multi-column card grid. Each item is two rows: entity name, then one full-width colored `schema-code` block.
- **Decision cards** for chosen direction, rejected alternatives, tradeoffs, and open risks.
- **Requirement/story cards** for PRD behavior with stable STORY/REQ/AC IDs.
- **BDD example panels** for main, edge, error, empty, loading, and permission examples with stable `EX-*` IDs.
- **Example pairs / before-after panels** for concrete behavioral or system changes.
- **Acceptance checklists** for concise `AC-*` criteria; use matrices only when traceability would otherwise be unclear.
- **Design coverage matrices** only when traceability would otherwise be unclear: PRD story/BDD/acceptance → slice → architecture delta → feedback hook.
- **Approval checklists** for review readiness and release confidence.
- **Architecture overview figures** for existing/new/changed components, boundaries, and communication direction.
- **Architecture delta cards/lists** for added/changed packages, controllers, APIs, jobs, events, ports, adapters, and data stores.
- **Outside-in slice design cards/lists and SVG diagrams** for `SLICE-*` narratives: external need → route/endpoint/API contract → application service/use case → domain model/service/rule → repository/DB model/table → observable feedback hook → spike/escalation condition.
- **Scope/non-goal lists** for adjacent behavior intentionally out of scope.
- **Open-question lists** with owner, blocker status, impact, and resolution path. Use a compact table only when there are many owners/statuses to compare.
- **Evidence cards** for source anchors, examples, logs, tests, or research observations.
- **Flow panels / figure cards** for current/intended behavior and component communication.
- **Callouts/admonitions** for note, tip, warning, danger, success, assumption, risk, blocker, and readiness.
- **Details disclosures** for long examples, raw evidence, or lower-priority scenarios.
- **Source/provenance lists** for paths, ADRs, tasks, changelog/update state, and validation state.

### Visual/UX patterns from research

Bake these patterns into every future generated report:

- **Focused first viewport** — title, concise summary, compact status metadata, and key takeaways before long-form content; do not add a dashboard/status-strip row by default.
- **Layer-cake scanning** — heading → one-sentence summary → prose/bullets/examples → optional details. Do not bury the point in large tables.
- **Diátaxis-specific shapes** — PRDs are product explanation/acceptance packets; designs are architecture decision/communication packets.
- **Review-first anchors** — review IDs are visible enough for humans to reference and stable enough for `/review` comments.
- **Decision cards over paragraphs** — architecture/product choices should show chosen direction, why, alternatives, tradeoffs, and risks.
- **Tables only for true matrices** — use tables for comparison/traceability, not as the default section shape. Prefer prose, bullets, cards, examples, and diagrams for explanation. A normal design should have 0-2 tables; if there are more, collapse reference detail into cards, lists, or `<details>`.
- **Code blocks follow code-block convention** — code-like snippets need enough horizontal room, should not be clipped, and should not be placed in responsive multi-column grids. If a section has several code/data shapes, render them as a vertical list (`contract-list`): first row is the entity name, second row is a colored `schema-code` block, and each property appears on its own line. Use restrained spans: `code-key` for properties, `code-enum` for enum/status values, and `code-punctuation` for braces, commas, colons, and union bars.
- **Diagram-as-figure** — every diagram needs a title, how-to-read note or caption, legend, review IDs, and uncertainty if relevant.
- **ELK-laid-out architecture diagrams** — for multi-node architecture/slice diagrams, prefer the build-time ELK renderer (`scripts/render-elk-diagram.mjs`) over hand-positioning. It produces inline SVG with automatic spacing, orthogonal routed arrows, foreground edge-label pills, and the shared diagram CSS primitives.
- **Tokenized visual system** — use semantic tokens and component classes; avoid local color/spacing improvisation.
- **Editorial technical atlas aesthetic** — warm paper, high-contrast ink, restrained accent, calm density, first-class diagrams.
- **Trust/provenance layer** — generated/updated date, source paths, related docs, owners, assumptions, open questions, and validation state.

### Example-first requirement

Every PRD or design report must include these concrete review aids before abstract detail:

- one main scenario showing the happy path;
- one edge/error/empty/loading/permission scenario, or an explicit “not applicable” note;
- a before/after panel describing what changes for the user or system;
- a “what reviewers should decide” review path;
- an evidence/source-anchor block tying claims to code, research, tests, screenshots, logs, or source docs.

### Navigation rail

Use one navigation rail only: the collapsible left index. Do not add a right sidebar. Put review guidance, readiness checks, open-question counts, and related artifacts in the main content flow where they can be reviewed and commented on directly.

## PRD report pattern

For `docs/features/{feature}/prd.html`, present the PRD as a concise What / Why / How product story:

```text
summary                  # one product-story paragraph, status metadata, 2-3 takeaways
what                     # users/jobs, 2-3 capabilities, scope/non-goals
why                      # need, pain, opportunity/success signals as short bullets
how                      # 2-4 stories, observable rules, one main workflow, one edge workflow
acceptance               # 3-6 verifiable criteria tied to workflows
open-questions           # only unresolved blockers with owner/blocker state
ready-for-design         # readiness checklist and next action
```

Keep PRDs terse. Do not paste research notes, implementation ideas, exhaustive edge cases, or repeated context. Default to zero tables; use at most one traceability matrix only when a checklist would be ambiguous. PRD HTML must avoid architecture leakage. It can link to `design.html`, but product acceptance stays in `prd.html`. Keep motion as progressive enhancement: subtle reveal/hover effects are welcome, but they must work without external assets and respect `prefers-reduced-motion`.

## Design report pattern

For `docs/features/{feature}/design.html`, default to this concise pattern:

```text
summary                  # feature, PRD link, status, review action
review-path              # what reviewers should decide
examples                 # one happy path and one edge/failure path
prd-story-inventory      # only the PRD stories/BDD/AC that shape architecture, as cards
pattern-research         # only decision-shaping insights, as evidence cards
design-thesis            # chosen solution shape and why it fits
proposed-architecture    # package/layer/runtime/data ownership as cards
technology-stack         # only choices that affect implementation or risk
architecture-overview    # high-level diagram with foreground edge labels
architecture-delta       # compact list/cards of added/changed components
slice-plan               # PRD-derived vertical slices as cards
data-contracts           # conceptual contracts as a single-column schema-code list when needed
design-decisions         # decisions, alternatives, tradeoffs
story-coverage           # the one allowed matrix when traceability matters
tasks-and-feedback       # per-slice outside-in designs, diagrams, task boundaries, feedback hooks
open-questions           # blockers and owner
```

Keep designs terse: every section should start with one sentence and then use bullets/cards. Do not paste the whole PRD, research notes, file inventory, or every domain field into `design.html`; link or defer raw detail. Use tables only for true matrices such as story coverage or dense tradeoff comparisons. Design reports must be built in this order: extract only architecture-shaping PRD facts, state the thesis, propose the monorepo/layer/runtime/data architecture, draw the high-level architecture, list the architecture delta, derive vertical slices, then give each slice a small outside-in design and detailed SVG diagram. Use `data-contracts` for conceptual code-like shapes and render them with the single-column `contract-list` pattern, never a `card-grid`: each contract item has an entity-name row followed by a full-width colored `schema-code` block, with one property per line. Use the `system-diagram` quality rules for diagrams inside the design report: focused question, semantic nodes/edges, foreground `diagram-edge-label` groups, `diagram-label-bg` pills, legend/caption, and review anchors. For diagrams with 4+ nodes or any routed arrows, generate the SVG with `node scripts/render-elk-diagram.mjs <spec.json> <output.svg>` and then inline the SVG into the report. Use this skill for the report shell, layout, visual hierarchy, and review UX.

## Visual modes

Default mode: **Vercel docs packet**.

Use this for PRDs, feature designs, decision packets, and most durable docs. It should feel closer to Vercel Docs than a slide/report export:

- breadcrumbs,
- collapsible sticky left sidebar with active heading state,
- no right-side rail,
- Vercel-like content area: black/gray neutral palette, Geist/system typography, tight page header, spacious prose, clean section dividers, and almost no shadows,
- restrained monochrome accent by default; use blue only for links/focus or status when useful,
- subtle CSS/IntersectionObserver motion for section reveal and hover affordances, always disabled under `prefers-reduced-motion`,
- fewer heavy cards and lighter borders,
- examples, steps, callouts, tabs, and matrices as first-class components only when they clarify the content,
- prev/next links, related artifacts, feedback, and provenance.

Secondary mode: **editorial technical atlas**.

Use only when the user asks for an intentionally visual narrative or when diagrams are the primary artifact. It may use warmer paper, larger headings, and richer figure treatment, but it must keep accessible docs navigation and review anchors.

Avoid:

- generic purple/blue gradient SaaS look,
- automatic dark-mode pages unless the user explicitly asks,
- oversized hero sections that push useful content below the fold,
- card-heavy report dashboards when prose would read better,
- too many bordered cards per section,
- tiny SVG text,
- giant walls of text,
- low-contrast pastel labels,
- decorative visuals that do not explain anything,
- top navigation menus with unclear purpose,
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
<section data-review-id="how.story-001" aria-labelledby="story-001-title">
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

- Use one final `.html` file with inline compiled CSS.
- Use inline SVG for diagrams.
- For architecture/slice diagrams, prefer build-time ELK layout: create a JSON spec, run `node scripts/render-elk-diagram.mjs spec.json output.svg`, inspect the output, then inline the SVG into the HTML report. Keep the JSON spec near the feature/task when it should be regenerated.
- Use Tailwind at build time only: edit `skills/html-report-designer/resources/{prd,report,design}.tailwind.css`, run `npm run build:report-css`, and commit the regenerated inline CSS in the HTML templates. `@tailwindcss/typography` is available for polished prose via compiled classes such as `prose prose-neutral max-w-none`.
- Do not use Tailwind CDN/runtime, remote fonts, or external CSS in finished reports.
- If adding JavaScript, it must be optional enhancement only.
- Prefer native HTML components over custom widgets.
- Keep source CSS organized with variables, components, motion, and print styles.
- Include provenance: generated/updated date and source paths.
- Validate finished reports with `npm run check:report-css` and `scripts/validate-html-report.mjs` when available.
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
