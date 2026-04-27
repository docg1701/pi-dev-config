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
pi install npm:@eko24ive/pi-ask

# Install skills
npx skills add upstash/context7
npx skills add 199-biotechnologies/claude-deep-research-skill

# Symlink AGENTS.md for global context
ln -s ~/.pi/agent/config/AGENTS.md ~/.pi/agent/AGENTS.md

# Copy models.json for custom model providers (copied, not symlinked)
cp ~/.pi/agent/config/models.json ~/.pi/agent/models.json

# Copy ONE of the settings variants to ~/.pi/agent/settings.json (see "Settings Variants" below)
# Variant A — all subagents use Kimi K2.6:
cp ~/.pi/agent/config/settings.json ~/.pi/agent/settings.json

# Variant B — DeepSeek V4 Pro everywhere, except scout (flash) and reviewer (Kimi):
# cp ~/.pi/agent/config/settings-deepseek.json ~/.pi/agent/settings.json
```

## Skills

### Skills.sh Registry

| Name | Description | Install |
|------|-------------|---------|
| `find-docs` | Library docs via Context7 CLI. Prefer over web search. | `npx skills add upstash/context7` |
| `deep-research` | 8-phase citation-backed research. Quick/standard/deep/ultradeep. | `npx skills add 199-biotechnologies/claude-deep-research-skill` |
| `find-skills` | Discover and install skills from the open skills ecosystem. | `npx skills add find-skills` |
| `ask-user` | Reinforces when to use `ask_user` for structured clarification instead of guessing. | Bundled with `@eko24ive/pi-ask` |

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
| `pi-extension-manager` | `/extensions` command for local and community package management. Includes auto-update checker (off by default — enable with `/extensions auto-update daily`). | `pi install npm:pi-extension-manager` |
| `pi-mcp-adapter` | Token-efficient MCP proxy. Lazy servers, cached metadata. | `pi install npm:pi-mcp-adapter` |
| `pi-mermaid` | Mermaid diagrams as ASCII art in TUI. | `pi install npm:pi-mermaid` |
| `pi-smart-fetch` | Smarter `web_fetch` with TLS fingerprinting and Defuddle extraction. | `pi install npm:pi-smart-fetch` |
| `pi-powerline-footer` | Powerline-style status bar with git, context, tokens, vibes, and bash mode. | `pi install npm:pi-powerline-footer` |
| `@eko24ive/pi-ask` | Ask tool that cares about your answers. Structured questions, single/multi/preview mode, option notes, elaboration flow, and native `@` file references. | `pi install npm:@eko24ive/pi-ask` |

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

## Settings Variants

This repository provides **two** `settings.json` variants. They are identical except for the subagent model assignments.

Pi looks for a single file at `~/.pi/agent/settings.json`. Copy the variant you want and **rename it to `settings.json`** in that directory.

### Variant A: `settings.json` — Kimi K2.6 everywhere

All eight built-in subagents use `opencode-go/kimi-k2.6`.

| Subagent | Model |
|----------|-------|
| scout | `kimi-k2.6` |
| planner | `kimi-k2.6` |
| worker | `kimi-k2.6` |
| reviewer | `kimi-k2.6` |
| oracle | `kimi-k2.6` |
| oracle-executor | `kimi-k2.6` |
| context-builder | `kimi-k2.6` |
| researcher | `kimi-k2.6` |

```bash
cp ~/.pi/agent/config/settings.json ~/.pi/agent/settings.json
```

### Variant B: `settings-deepseek.json` — DeepSeek V4 Pro (with exceptions)

Most subagents use `opencode-go/deepseek-v4-pro`. Two exceptions:
- **scout** uses `deepseek-v4-flash` (faster/cheaper for exploration).
- **reviewer** uses `kimi-k2.6` (fresh perspective from a different model for code review).

| Subagent | Model |
|----------|-------|
| scout | `deepseek-v4-flash` ⚡ |
| planner | `deepseek-v4-pro` |
| worker | `deepseek-v4-pro` |
| reviewer | `kimi-k2.6` 🔍 |
| oracle | `deepseek-v4-pro` |
| oracle-executor | `deepseek-v4-pro` |
| context-builder | `deepseek-v4-pro` |
| researcher | `deepseek-v4-pro` |

```bash
cp ~/.pi/agent/config/settings-deepseek.json ~/.pi/agent/settings.json
```

> **Important:** The destination file must always be named `settings.json`. Pi does not read `settings-deepseek.json` directly.

## Custom Models

Custom providers and models are configured via `models.json`. This repository includes:

- **OpenCode Go** — Low-cost subscription with reliable access to open coding models.
  - `deepseek-v4-pro` — High-quality reasoning model
  - `deepseek-v4-flash` — Fast reasoning model

Set your API key as an environment variable:

```bash
export OPENCODE_GO_API_KEY="your-opencode-go-api-key"
```

Or use any supported value resolution format (shell command, env var, literal) as documented in the [Pi models configuration docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/models.md).

Models appear in `/model` or `--list-models` after symlinking `models.json`.

## Context & Rules

`AGENTS.md` defines the project-level context loaded by Pi at startup. Place it in:

- `~/.pi/agent/AGENTS.md` (global)
- Any project root (local)

## Structure

```
pi-dev-config/
├── AGENTS.md          # Global agent rules and conventions
├── models.json        # Custom model providers (OpenCode Go, Ollama, etc.)
├── settings.json              # Variant A: subagents all use Kimi K2.6
├── settings-deepseek.json     # Variant B: subagents use DeepSeek V4 Pro (scout=flash, reviewer=Kimi)
├── README.md                  # This file
```

## Notes

### "auto-update off" na powerline

É o status do `pi-extension-manager`. Significa que a verificação automática de atualizações de pacotes está desligada. Para ativar:

```
/extensions auto-update daily
```

Outros intervalos: `weekly`, `1h`, `6h`, `3d`, `2w`, `1mo`, ou `/extensions auto-update` para o wizard interativo.

## License

MIT
