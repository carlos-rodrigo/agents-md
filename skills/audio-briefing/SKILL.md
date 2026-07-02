---
name: audio-briefing
description: "Generate an audio summary of any document. Triggers on: audio briefing, read this to me, narrate this, listen to doc."
---

# Audio Briefing

Transform a document into a spoken briefing you can listen to while doing other things.

## Process

### 1. Read the Document

Load the file path provided or accept pasted content.

### 2. Generate Script

Create a spoken briefing (NOT bullet points — natural speech):

```
Hey, here's the quick rundown on [document title].

[What it's about - 1-2 sentences]

The main points are:
First, [point 1 in conversational tone].
Second, [point 2].
Third, [point 3].

The key decisions made were [decisions in natural speech].

What's explicitly out of scope: [out of scope items].

If you need to do something after this, it's [action required].

That's the gist. [Optional: mention open questions if critical]
```

**Script guidelines:**
- ~200-300 words (1-2 minutes spoken)
- Conversational, not robotic
- No bullet points or markdown
- Flow naturally when read aloud
- Skip section headers — just speak the content

### 3. Generate Audio

Ask before calling any external TTS/network/API service or spending credits. If no approved TTS tool is available, output the script only.

Before TTS:

- check the requested/available TTS tool,
- write the script to a local temp file to avoid shell-quoting problems,
- never print or echo API keys/secrets,
- save audio to a local file path.

Example shape after approval:

```bash
# Example only; adapt to the approved local tool.
printf '%s' "$SCRIPT" > /tmp/audio-briefing-script.txt
sag -f /tmp/audio-briefing-script.txt -o briefing.mp3
```

### 4. Deliver

- Ask before playing audio aloud.
- Otherwise save to file and provide the path.
- If audio generation was not approved or unavailable, provide the spoken script.

## Voice Guidelines

- **Pace**: Natural, not rushed
- **Tone**: Informative but casual — like explaining to a colleague
- **Voice**: Prefer deeper voices (onyx, echo) for longer content

## Example Output

For a PRD about "Task Priority System":

> Hey, quick rundown on the Task Priority feature.
> 
> This is about letting users mark tasks as high, medium, or low priority so they can focus on what matters most.
> 
> Main points: First, we're adding a priority field to the database — defaults to medium. Second, each task card will show a colored badge — red for high, yellow for medium, gray for low. Third, users can filter the task list by priority.
>
> Key decisions: Priority won't affect notifications or reminders — that's explicitly out of scope. Also no automatic priority based on due dates.
>
> Next step is creating the technical design. That's it!
