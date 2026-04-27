# pi-dev-config

Reproducible [Pi](https://pi.dev) configuration. Clone, install, and run anywhere with the same extensions, skills, and rules.

![pi-dev-config screenshot](screenshot-pi-dev.png)

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

## Working Vibes

This repo includes **four** pre-generated vibe themes:

| Theme | File | Phrases | Sabor |
|-------|------|---------|-------|
| `startrek` | `vibes/startrek.txt` | 99 | Engaging warp drive, scanning for lifeforms… |
| `klingon` | `vibes/klingon.txt` | 26 | Qapla'! bortaS bIr jablu'DI'… (com tradução) |
| `standup` | `vibes/standup.txt` | 32 | Testing the mic… tough crowd today… |
| `tiozao` | `vibes/tiozao.txt` | 43 | Aperta o play Juvenal… é pavê ou pacumê… |
| `bbs` | `vibes/bbs.txt` | 52 | NO CARRIER… l33t skillz… RTFM… |

To switch themes:
```
/vibe klingon
/vibe standup
/vibe tiozao
```

When active, the "Working…" loading message is replaced with themed phrases like *"Engaging warp drive…"*, *"Scanning for lifeforms…"*, or *"Reversing polarity…"*.

### Setup

Both `settings.json` and `settings-deepseek.json` are already configured:

```json
{
  "workingVibe": "startrek",
  "workingVibeMode": "file",
  "workingVibeModel": "opencode-go/deepseek-v4-flash"
}
```

After copying a settings file, reload pi (`/reload`). To verify:

```
/vibe
```

Should show: `Vibe: startrek | Mode: file | Model: opencode-go/deepseek-v4-flash | File: 99 vibes`

### File mode vs generate mode

| Mode | How it works | Latency | Cost |
|------|-------------|---------|------|
| `file` | Reads from `vibes/startrek.txt` (99 pre-generated phrases) | Instant | Zero |
| `generate` | Calls the LLM on-demand for each message | ~1-3s | Per API call |

This repo uses **file mode** — vibes are loaded once at startup and cycled through with seeded shuffle, avoiding repetition.

### Multi-word theme bug

The `/vibe generate "star trek"` command (with spaces) fails due to whitespace-split argument parsing in the extension. Single-word themes like `startrek` avoid this. Workarounds:

- **Use single-word slugs:** Rename the theme to a single word (e.g. `startrek` instead of `star trek`), then `/vibe generate startrek 200` works normally.
- **Manual file:** Write vibe phrases to `~/.pi/agent/vibes/<theme-slug>.txt` (one per line, ending in `...`), then switch to file mode.
- **Generate from templates:** Use `/vibe generate <theme> [count]` (without `"` characters in the theme) to produce the file, then rename it to match your multi-word theme slug.

This repo includes a pre-generated `vibes/startrek.txt` so you don't need to work around the bug.

### Switching themes

```
/vibe klingon      # Qapla'! — Klingon with translations
/vibe standup      # Tough crowd today…
/vibe tiozao       # Aperta o play, Juvenal…
/vibe bbs          # NO CARRIER…
/vibe startrek     # Back to Starfleet
/vibe off          # Disable vibes
```

All four themes use file mode — instant, zero cost, no API calls.

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
├── AGENTS.md                  # Global agent rules and conventions
├── models.json                # Custom model providers (OpenCode Go)
├── settings.json              # Variant A: subagents all use Kimi K2.6
├── settings-deepseek.json     # Variant B: subagents use DeepSeek V4 Pro (scout=flash, reviewer=Kimi)
├── vibes/
│   ├── startrek.txt           # Startrek: 99 phrases
│   ├── klingon.txt            # Klingon + translations: 26 phrases
│   ├── standup.txt            # Standup comedy: 32 phrases
│   ├── tiozao.txt             # Tiozão jokes: 43 phrases
│   └── bbs.txt                # BBS taglines 90s: 52 phrases
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
