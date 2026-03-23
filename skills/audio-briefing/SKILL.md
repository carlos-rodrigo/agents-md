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

Use TTS to convert script to audio:

```bash
# If using OpenClaw with TTS
# The agent will use the tts tool directly

# If using ElevenLabs CLI (sag)
sag -t "script content" -o briefing.mp3

# If using OpenAI TTS
curl -X POST "https://api.openai.com/v1/audio/speech" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"tts-1","input":"script","voice":"onyx"}' \
  --output briefing.mp3
```

### 4. Deliver

- Play the audio directly if possible
- Or save to file and provide path

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
