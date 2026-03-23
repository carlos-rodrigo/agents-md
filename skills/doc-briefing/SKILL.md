---
name: doc-briefing
description: "Summarize any document into a concise briefing. Triggers on: brief me, summarize this, tldr, executive summary, what does this say."
---

# Doc Briefing

Transform long documents (PRDs, designs, RFCs, articles) into concise, actionable briefings.

## Process

### 1. Read the Document

Load the file or accept pasted content.

### 2. Generate Briefing

Output exactly this format:

```markdown
# Briefing: {Document Title}

## TL;DR
One sentence. What is this document about?

## Key Points
- Point 1 (most important)
- Point 2
- Point 3
- Point 4
- Point 5

## Decisions Made
- Decision 1: [what was decided]
- Decision 2: [what was decided]

## Out of Scope
What this explicitly does NOT cover.

## Action Required
What the reader needs to do next (if anything).

## Open Questions
Unresolved items that need input.
```

## Guidelines

- **5 bullets max** for key points — force prioritization
- **No jargon** — explain or skip
- **Decisions > descriptions** — what was decided, not what was discussed
- **Action-oriented** — what does the reader need to do?
- **Fit in one screen** — if it doesn't fit, it's too long

## Variants

**Audio briefing** (if TTS available):
> Say **"read it to me"** to generate an audio version.

**Comparison briefing** (multiple docs):
> Say **"compare these"** to highlight differences between documents.
