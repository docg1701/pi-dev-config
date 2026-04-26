# pi-dev-config

Reproducible [Pi](https://pi.dev) configuration. Clone, install, and run anywhere with the same extensions, skills, and rules.

## Quick Start

```bash
# Clone into ~/.pi/agent/ or any project
git clone git@github.com:docg1701/pi-dev-config.git ~/.pi/agent/config

# Install extensions
pi install npm:@leing2021/super-pi
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

### Compound Engineering (via `@leing2021/super-pi`)

| Skill | Description |
|-------|-------------|
| `01-brainstorm` | Deep requirements mining: CE Brainstorm, Startup Diagnostic, Builder Mode. |
| `02-plan` | RED→GREEN→REFACTOR units with TDD gates. Incremental updates via `plan_diff`. Optional CEO Review. |
| `03-work` | Parallel execution (`task_splitter` + `parallel_subagent`). Checkpoint resume. Strict TDD. |
| `04-review` | Persona-routed review (`review_router`). Optional browser QA and regression tests. |
| `05-learn` | Pattern extraction into YAML-tagged knowledge cards. Searchable compounding. |
| `06-next` | Recommend the next CE skill from workflow state. |
| `07-worktree` | Git worktree lifecycle: create, detect, merge, cleanup. |
| `08-status` | Scan `docs/` and `.context/` for progress and next steps. |
| `09-help` | CE skill system usage guide. |
| `10-rules` | Progressive on-demand rule loading. Custom rules in `./rules/`. |

### Official Repositories

- [Anthropic Skills](https://github.com/anthropics/skills) — Document processing, web dev.
- [Pi Skills](https://github.com/badlogic/pi-skills) — Web search, browser automation, Google APIs, transcription.

## Extensions

| Name | Description | Install |
|------|-------------|---------|
| `@leing2021/super-pi` (`ce-core`) | CE core: 15 tools, auto-compression, stage model routing. | `pi install npm:@leing2021/super-pi` |
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
