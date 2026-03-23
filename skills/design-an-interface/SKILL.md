---
name: design-an-interface
description: "Generate multiple radically different interface designs using parallel sub-agents. Triggers on: design interface, design api, compare approaches, design it twice."
---

# Design an Interface

Based on "Design It Twice" (Ousterhout): your first idea is unlikely to be the best. Generate multiple radically different designs, then compare.

## Process

### 1. Gather Requirements

- What problem does this module solve?
- Who are the callers?
- What are the key operations?
- Constraints? (performance, compatibility, patterns)
- What should be hidden vs exposed?

### 2. Generate Designs (Parallel)

Spawn 3+ sub-agents with different constraints:

- Agent 1: "Minimize methods — 1-3 max"
- Agent 2: "Maximize flexibility"
- Agent 3: "Optimize for common case"
- Agent 4: "Borrow from [paradigm/library]"

Each outputs:
1. Interface signature
2. Usage example
3. What it hides internally
4. Trade-offs

### 3. Present & Compare

Show each design, then compare on:

- **Simplicity**: fewer methods, simpler params
- **Depth**: small interface hiding big complexity (good) vs big interface with thin impl (bad)
- **Flexibility** vs **focus**
- **Ease of correct use** vs **ease of misuse**

Discuss in prose, not tables. Highlight where designs diverge.

### 4. Synthesize

Often best design combines insights. Ask:
- "Which fits your primary use case?"
- "Elements from others worth incorporating?"

## Anti-Patterns

- Don't let agents produce similar designs — enforce radical difference
- Don't skip comparison — value is in contrast
- Don't implement — this is about interface shape only
