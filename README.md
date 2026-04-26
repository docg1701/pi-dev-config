# pi-dev-config

Reproducible [Pi](https://pi.dev) configuration. Clone, install, and run anywhere with the same extensions, skills, and rules.

## Quick Start

```bash
# Clone into ~/.pi/agent/ or any project
git clone git@github.com:docg1701/pi-dev-config.git ~/.pi/agent/config

# Install extensions
pi install npm:pi-review-loop
pi install npm:pi-annotate
pi install npm:pi-interview
pi install npm:pi-prompt-template-model
pi install npm:pi-subagents
pi install npm:pi-agent-browser-native
pi install npm:pi-extension-manager
pi install npm:pi-mcp-adapter
pi install npm:pi-mermaid
pi install npm:pi-smart-fetch
pi install npm:pi-powerline-footer

# Install skills
npx skills add upstash/context7
npx skills add 199-biotechnologies/claude-deep-research-skill

# Symlink AGENTS.md for global context
ln -s ~/.pi/agent/config/AGENTS.md ~/.pi/agent/AGENTS.md
```

## Skills

### Skills.sh Registry

| Name | Description | Install |
|------|-------------|---------|
| `find-docs` | Library docs via Context7 CLI. Prefer over web search. | `npx skills add upstash/context7` |
| `deep-research` | 8-phase citation-backed research. Quick/standard/deep/ultradeep. | `npx skills add 199-biotechnologies/claude-deep-research-skill` |
| `find-skills` | Discover and install skills from the open skills ecosystem. | `npx skills add find-skills` |

### nicobailon Extensions

| Name | Description | Install |
|------|-------------|---------|
| `pi-review-loop` | Automated code review loop. Repeatedly prompts the agent to review until no issues remain. | `pi install npm:pi-review-loop` |
| `pi-annotate` | Visual annotation for AI. Click elements, add comments, capture screenshots and selectors. | `pi install npm:pi-annotate` |
| `pi-interview` | Interactive form tool to gather structured user responses with keyboard nav, themes, and image support. | `pi install npm:pi-interview` |
| `pi-prompt-template-model` | Add model/skill/thinking frontmatter to prompt templates for automatic model switching via slash commands. | `pi install npm:pi-prompt-template-model` |
| `pi-subagents` | Delegate tasks to subagents with chains, parallel execution, TUI clarification, and async support. | `pi install npm:pi-subagents` |

### Official Repositories

- [Anthropic Skills](https://github.com/anthropics/skills) — Document processing, web dev.
- [Pi Skills](https://github.com/badlogic/pi-skills) — Web search, browser automation, Google APIs, transcription.

## Extensions

| Name | Description | Install |
|------|-------------|---------|
| `pi-review-loop` | Automated code review loop with smart exit detection and fresh context mode. | `pi install npm:pi-review-loop` |
| `pi-annotate` | Visual annotation for AI with element picker, inline note cards, and screenshots. | `pi install npm:pi-annotate` |
| `pi-interview` | Interactive form tool for structured user responses with themes and image support. | `pi install npm:pi-interview` |
| `pi-subagents` | Delegate tasks to subagents with chains, parallel execution, and async support. | `pi install npm:pi-subagents` |
| `pi-prompt-template-model` | Prompt templates with model/skill frontmatter and slash commands. | `pi install npm:pi-prompt-template-model` |
| `pi-agent-browser-native` | `agent-browser` as a native tool. Snapshots, screenshots, sessions. | `pi install npm:pi-agent-browser-native` |
| `pi-extension-manager` | `/extensions` command for local and community package management. | `pi install npm:pi-extension-manager` |
| `pi-mcp-adapter` | Token-efficient MCP proxy. Lazy servers, cached metadata. | `pi install npm:pi-mcp-adapter` |
| `pi-mermaid` | Mermaid diagrams as ASCII art in TUI. | `pi install npm:pi-mermaid` |
| `pi-smart-fetch` | Smarter `web_fetch` with TLS fingerprinting and Defuddle extraction. | `pi install npm:pi-smart-fetch` |
| `pi-powerline-footer` | Powerline-style status bar with git, context, tokens, vibes, and bash mode. | `pi install npm:pi-powerline-footer` |

## Themes

| Name | Description | Install |
|------|-------------|---------|
| `@victor-software-house/pi-curated-themes` | 65 curated dark terminal themes adapted from iTerm2-Color-Schemes to pi's 51-token model. Semantic variants with guaranteed hue separation. | `pi install npm:@victor-software-house/pi-curated-themes` |

Select a theme in `/settings`, or set it in `~/.pi/agent/settings.json`:

```json
{
  "theme": "catppuccin-mocha"
}
```

Available themes include: `catppuccin-mocha`, `dracula`, `gruvbox-dark`, `kanagawa-wave`, `everforest-dark-hard`, `lovelace`, `mellow`, `vesper`, and 57 others. See the [full curated list](https://github.com/victor-software-house/pi-curated-themes).

## Context & Rules

`AGENTS.md` defines the project-level context loaded by Pi at startup. Place it in:

- `~/.pi/agent/AGENTS.md` (global)
- Any project root (local)

## Structure

```
pi-dev-config/
├── AGENTS.md          # Global agent rules and conventions
├── README.md          # This file
```

## License

MIT
