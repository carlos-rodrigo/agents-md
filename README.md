# agents-md

Personal collection of agent skills for AI coding assistants (Pi, Claude Code, Codex, etc.)

## Skills

### Planning

| Skill | Description |
|-------|-------------|
| **prd** | Create a PRD through interview and codebase exploration |
| **design-solution** | Turn a PRD into phased implementation plan using vertical slices |
| **grill-me** | Get interviewed relentlessly about a plan until all decisions are resolved |
| **design-an-interface** | Generate multiple radically different interface designs ★ |

### Development

| Skill | Description |
|-------|-------------|
| **tdd** | Test-driven development with red-green-refactor loop |
| **implement-task** | Implement a single task from a design |
| **loop** | Autonomous task execution loop |
| **simple-tasks** | File-based task management |
| **review-pr** | Code review a pull request |

### Architecture

| Skill | Description |
|-------|-------------|
| **improve-architecture** | Find refactoring opportunities, focus on deep modules ★ |

### Utilities

| Skill | Description |
|-------|-------------|
| **doc-briefing** | Summarize any document into 5 key bullets |
| **tmux** | Manage background processes with tmux |

### Frontend

| Skill | Description |
|-------|-------------|
| **vercel-react-best-practices** | React/Next.js patterns from Vercel |
| **web-design-guidelines** | Web interface design guidelines |

## Installation

Copy skills to your agent's skills directory:

```bash
# Pi
cp -r skills/* ~/.pi/agent/skills/

# Claude Code  
cp -r skills/* ~/.claude/skills/

# Or symlink
ln -s ~/agents/skills ~/.pi/agent/skills
```

## Credits

Skills marked with ★ are adapted from [mattpocock/skills](https://github.com/mattpocock/skills):
- `design-an-interface` — based on "Design It Twice" concept
- `improve-architecture` — deep modules focus
- `grill-me` — interview methodology
- `tdd` — red-green-refactor approach
- `prd` and `design-solution` — vertical slices/tracer bullets approach

## Philosophy

- **Concise over comprehensive** — skills should be short and focused
- **Interview before writing** — understand the problem first
- **Vertical slices** — each phase delivers end-to-end value
- **Deep modules** — small interfaces hiding big implementations
- **No file paths in docs** — they get outdated; describe by responsibility

## License

MIT
