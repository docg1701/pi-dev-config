# pi-dev-config

Reproducible [Pi](https://pi.dev) configuration. Clone, install, and run anywhere with the same extensions, skills, and rules.

![pi-dev-config screenshot](docs/screenshot-pi-dev.png)

## Quick Start

```bash
# Clone into ~/.pi/agent/ or any project
git clone git@github.com:docg1701/pi-dev-config.git ~/dev/pi-dev-config

# Install extensions
pi install npm:pi-subagents
pi install npm:pi-annotate
pi install npm:pi-interview
pi install npm:pi-prompt-template-model
pi install npm:pi-subagents
pi install npm:pi-agent-browser-native
pi install npm:pi-extension-manager
pi install npm:pi-mcp-adapter
pi install npm:pi-mermaid
pi install npm:pi-smart-fetch
pi install npm:pi-glance
pi install npm:@eko24ive/pi-ask
pi install npm:@leonardorick/pi-web-search
pi install npm:pi-ollama-cloud
pi install npm:pi-alert
pi install npm:pi-rtk-optimizer

# Install skills
npx skills add https://github.com/upstash/context7 --skill find-docs
npx skills add https://github.com/199-biotechnologies/claude-deep-research-skill --skill deep-research
npx skills add https://github.com/vercel-labs/skills --skill find-skills
npx skills add https://github.com/streamlit/agent-skills --skill developing-with-streamlit
npx skills add https://github.com/aj-geddes/useful-ai-prompts --skill ansible-automation
npx skills add https://github.com/coreyhaines31/marketingskills --skill product-marketing

# Copy APPEND_SYSTEM.md to extend the agent's system prompt
cp ~/dev/pi-dev-config/APPEND_SYSTEM.md ~/.pi/agent/APPEND_SYSTEM.md

# Copy settings
cp ~/dev/pi-dev-config/settings.json ~/.pi/agent/settings.json
```

## Skills

### Skills.sh Registry

| Name | Description | Install |
|------|-------------|---------|
| `find-docs` | Library docs via Context7 CLI. Prefer over web search. | `npx skills add https://github.com/upstash/context7 --skill find-docs` |
| `deep-research` | 8-phase citation-backed research. Quick/standard/deep/ultradeep. | `npx skills add https://github.com/199-biotechnologies/claude-deep-research-skill --skill deep-research` |
| `find-skills` | Discover and install skills from the open skills ecosystem. | `npx skills add https://github.com/vercel-labs/skills --skill find-skills` |
| `developing-with-streamlit` | Routing skill oficial do Streamlit: criação, edição, debug, estilização, performance, temas, deploy e componentes customizados. | `npx skills add https://github.com/streamlit/agent-skills --skill developing-with-streamlit` |
| `ansible-automation` | Infrastructure automation with Ansible playbooks, roles, and inventory. Deploy apps, patch/configure servers. | `npx skills add https://github.com/aj-geddes/useful-ai-prompts --skill ansible-automation` |
| `product-marketing` | Create/update product marketing context document (`.agents/product-marketing.md`). Foundation for all other marketing skills. | `npx skills add https://github.com/coreyhaines31/marketingskills --skill product-marketing` |
| `ask-user` | Reinforces when to use `ask_user` for structured clarification instead of guessing. | Bundled with `@eko24ive/pi-ask` |

### Marketing Skills

All from [`coreyhaines31/marketingskills`](https://github.com/coreyhaines31/marketingskills). Install the full suite with `npx skills add https://github.com/coreyhaines31/marketingskills --skill product-marketing`.

| Name | Description |
|------|-------------|
| `product-marketing` | Create `.agents/product-marketing.md` for foundational positioning and messaging context. Use first before other marketing skills. |
| `marketing-ideas` | 139 proven marketing ideas for SaaS. Inspiration and growth tactics. |
| `content-strategy` | Plan content strategy, topic clusters, editorial calendar, and content pillars. |
| `copywriting` | Write or improve marketing copy for homepages, landing pages, pricing, and product pages. |
| `copy-editing` | Edit, review, and tighten existing marketing copy. |
| `seo-audit` | Technical and on-page SEO audits. diagnose ranking issues. |
| `programmatic-seo` | Create SEO-driven pages at scale using templates and data. |
| `ai-seo` | Optimize content for AI search engines and LLM citations. |
| `schema` | Add, fix, or optimize schema markup and structured data. |
| `site-architecture` | Plan and restructure page hierarchy, navigation, URL structure, and internal linking. |
| `analytics` | Set up, improve, or audit analytics tracking and measurement (GA4, GTM, Mixpanel, Segment). |
| `ab-testing` | Plan, design, and implement A/B tests and growth experimentation programs. |
| `cro` | Conversion rate optimization for landing pages, forms, and marketing pages. |
| `signup` | Optimize signup, registration, and trial activation flows. |
| `onboarding` | Optimize post-signup onboarding, user activation, and time-to-value. |
| `paywalls` | Create and optimize in-app paywalls, upgrade screens, and upsell modals. |
| `churn-prevention` | Build cancellation flows, save offers, dunning, and retention strategies. |
| `pricing` | Pricing decisions, packaging, and monetization strategy. |
| `ads` | Paid advertising campaigns (Google Ads, Meta, LinkedIn, Twitter/X). |
| `ad-creative` | Generate and iterate ad copy, headlines, and creative variations at scale. |
| `social` | Social media content creation, scheduling, and optimization (LinkedIn, Twitter/X, Instagram, TikTok). |
| `video` | Create and produce video content with AI tools and programmatic frameworks. |
| `image` | Create, generate, edit, or optimize marketing images and brand assets. |
| `emails` | Email sequences, drip campaigns, lifecycle email programs, and nurture flows. |
| `cold-email` | B2B cold emails and follow-up sequences that get replies. |
| `sms` | SMS/MMS marketing flows, abandoned cart texts, and promotional sends. |
| `popups` | Popups, modals, overlays, slide-ins, and banners for conversion. |
| `lead-magnets` | Create and optimize lead magnets for email capture and lead generation. |
| `free-tools` | Plan and build free tools for lead generation, SEO value, and brand awareness. |
| `launch` | Product launch, feature announcement, and go-to-market strategy. |
| `directory-submissions` | Submit product to startup/SaaS/AI directories for backlinks and discovery. |
| `referrals` | Create and optimize referral, affiliate, and word-of-mouth programs. |
| `co-marketing` | Find co-marketing partners and plan joint campaigns. |
| `community-marketing` | Build and leverage online communities for product growth and brand loyalty. |
| `competitor-profiling` | Research, profile, and analyze competitors from their URLs. |
| `competitors` | Create competitor comparison and alternative pages for SEO and sales enablement. |
| `prospecting` | Find, qualify, and build lists of B2B prospects. |
| `sales-enablement` | Create sales collateral, pitch decks, one-pagers, objection handling, and demo scripts. |
| `revops` | Revenue operations, lead lifecycle management, and marketing-to-sales handoff. |
| `customer-research` | Conduct, analyze, and synthesize customer research, interviews, and surveys. |
| `aso` | Audit and optimize App Store and Google Play listings. |
| `marketing-psychology` | Apply psychological principles and behavioral science to marketing. |
| `launch` | Product launch, feature announcement, and release strategy. |

### nicobailon Extensions

| Name | Description | Install |
|------|-------------|---------|
| `pi-subagents` | Delegate tasks to subagents with chains, parallel execution, TUI clarification, and async support. | `pi install npm:pi-subagents` |

### Official Repositories

- [Anthropic Skills](https://github.com/anthropics/skills) — Document processing, web dev.
- [Pi Skills](https://github.com/badlogic/pi-skills) — Web search, browser automation, Google APIs, transcription.

## Extensions

> **Prerequisite for pi-rtk-optimizer:** Install the [rtk CLI](https://github.com/rtk-ai/rtk) first:
> ```bash
> cargo install --git https://github.com/rtk-ai/rtk --locked
> ```

| Name | Description | Install |
|------|-------------|---------|
| `pi-subagents` | Delegate tasks to subagents with chains, parallel execution, and async support. | `pi install npm:pi-subagents` |
| `pi-prompt-template-model` | Prompt templates with model/skill frontmatter and slash commands. | `pi install npm:pi-prompt-template-model` |
| `pi-agent-browser-native` | `agent-browser` as a native tool. Snapshots, screenshots, sessions. | `pi install npm:pi-agent-browser-native` |
| `pi-extension-manager` | `/extensions` command for local and community package management. Includes auto-update checker (off by default — enable with `/extensions auto-update daily`). | `pi install npm:pi-extension-manager` |
| `pi-mcp-adapter` | Token-efficient MCP proxy. Lazy servers, cached metadata. | `pi install npm:pi-mcp-adapter` |
| `pi-mermaid` | Mermaid diagrams as ASCII art in TUI. | `pi install npm:pi-mermaid` |
| `pi-smart-fetch` | Smarter `web_fetch` with TLS fingerprinting and Defuddle extraction. | `pi install npm:pi-smart-fetch` |
| `pi-glance` | Calm input surface with rounded multiline editor and inline status (model · context · tokens · cost · git). 10 built-in themes. | `pi install npm:pi-glance` |
| `@eko24ive/pi-ask` | Ask tool that cares about your answers. Structured questions, single/multi/preview mode, option notes, elaboration flow, and native `@` file references. | `pi install npm:@eko24ive/pi-ask` |
| `@leonardorick/pi-web-search` | Real DuckDuckGo web search as a native `web_search` tool. Essential companion to `pi-smart-fetch` for retrieving current information beyond the model's knowledge cutoff. | `pi install npm:@leonardorick/pi-web-search` |
| `pi-ollama-cloud` | Ollama Cloud provider with dynamic model discovery, persistent cache, and built-in `ollama_web_search`/`ollama_web_fetch` tools. No local Ollama server required. | `pi install npm:pi-ollama-cloud` |
| `pi-alert` | System notification when the agent finishes its turn. Terminal-native (Ghostty, iTerm2, WezTerm, Kitty, rxvt-unicode) with OS fallback (`osascript`, `notify-send`, PowerShell balloon, terminal bell). Shows activity summary with elapsed time. | `pi install npm:pi-alert` |
| `pi-rtk-optimizer` | Token-optimized command rewriting and output compaction. Rewrites bash commands to `rtk` equivalents, compacts noisy tool output (ANSI stripping, test/build aggregation, git/grep grouping, smart truncation). Requires the [rtk CLI](https://github.com/rtk-ai/rtk). | `pi install npm:pi-rtk-optimizer` |

## RTK Optimizer

[pi-rtk-optimizer](https://github.com/MasuRii/pi-rtk-optimizer) automatically rewrites bash commands through the [rtk CLI](https://github.com/rtk-ai/rtk) proxy and compacts tool output to save context tokens.

### Setup

```bash
# 1. Install the rtk CLI (Rust)
cargo install --git https://github.com/rtk-ai/rtk --locked

# 2. Install the pi extension
pi install npm:pi-rtk-optimizer

# 3. Copy the RTK exclusion config (prevents known bugs with ls, grep, rg rewrites)
mkdir -p ~/.config/rtk
cp ~/dev/pi-dev-config/rtk/config.toml ~/.config/rtk/config.toml

# 4. Reload pi
# /reload
```

### Commands

| Command | Description |
|---------|-------------|
| `/rtk` | Open interactive settings modal |
| `/rtk show` | Display current configuration and runtime status |
| `/rtk verify` | Check if `rtk` binary is available to pi |
| `/rtk stats` | Show output compaction metrics for current session |
| `/rtk reset` | Reset all settings to defaults |

### Configuration

Settings are stored at `~/.pi/agent/extensions/pi-rtk-optimizer/config.json`. Defaults:

```json
{
  "enabled": true,
  "mode": "rewrite",
  "guardWhenRtkMissing": true,
  "showRewriteNotifications": true,
  "outputCompaction": {
    "enabled": true,
    "truncate": { "enabled": true, "maxChars": 12000 },
    "aggregateTestOutput": true,
    "filterBuildOutput": true,
    "compactGitOutput": true,
    "aggregateLinterOutput": true,
    "groupSearchOutput": true
  }
}
```

Use `/rtk` in the pi TUI to change settings interactively.

### Troubleshooting

#### `rtk ls` retorna `(empty)` e confunde o modelo

**Problema:** Bug conhecido do `rtk` (issue [#1418](https://github.com/rtk-ai/rtk/issues/1418)) — `rtk ls` sempre retorna `(empty)` independente do conteúdo do diretório. Quando o `pi-rtk-optimizer` reescreve `ls` → `rtk ls`, o modelo recebe saída vazia e conclui que o diretório está vazio.

**Solução:** Excluir `ls` da reescrita automática via configuração do `rtk`:

```toml
# ~/.config/rtk/config.toml
[hooks]
exclude_commands = ["ls"]
```

Isso faz `rtk rewrite "ls ..."` retornar exit code 1, e o `pi-rtk-optimizer` mantém o comando original sem reescrever. O `git status` e demais comandos continuam otimizados normalmente.

**Alternativas:**
- Mudar para modo `suggest` (`/rtk` → `mode: suggest`) — só notifica, não reescreve
- Usar `rtk proxy ls` em vez de `rtk ls` para bypass da compactação
- Prefixar com `RTK_DISABLED=1` para bypass pontual

#### `rtk grep` retorna `linha:coluna:` sem o conteúdo matched

**Problema:** Bug do `rtk` v0.38.0 — `rtk grep` mostra o número da linha e coluna mas **omite o texto da linha** após os `:`. Exemplo:

```
# grep nativo:
4:class TestSomething:

# rtk grep (quebrado):
4:0:
```

Sem o conteúdo da linha, o modelo perde contexto essencial (nomes de classes, funções, valores).

**Solução:** Excluir `grep` e `rg` junto com `ls` no `exclude_commands` do RTK:

```toml
# ~/.config/rtk/config.toml
[hooks]
exclude_commands = ["ls", "grep", "rg"]
```

O arquivo `rtk/config.toml` neste repositório já contém essa configuração pronta para copiar.

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

The `settings.json` is pre-configured with vibes:

```json
{
  "workingVibe": "startrek",
  "workingVibeMode": "file",
  "workingVibeModel": "deepseek-v4-flash"
}
```

After copying `settings.json` to `~/.pi/agent/`, reload pi (`/reload`). To verify:

```
/vibe
```

Should show: `Vibe: startrek | Mode: file | Model: ollama-cloud/deepseek-v4-flash | File: 99 vibes`

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

## Settings

Pi looks for a single file at `~/.pi/agent/settings.json`. This repository provides a pre-configured `settings.json` using the **Ollama Cloud** provider.

### Setup

```bash
cp ~/dev/pi-dev-config/settings.json ~/.pi/agent/settings.json
```

After copying, reload pi (`/reload`).

> **Important:** The destination file must always be named `settings.json`. Pi does not read any other filename directly.

### Subagent models

| Subagent | Model | Thinking |
|----------|-------|----------|
| scout | `deepseek-v4-flash` ⚡ | `xhigh` |
| planner | `deepseek-v4-pro` | `xhigh` |
| worker | `deepseek-v4-pro` | `xhigh` |
| reviewer | `kimi-k2.6` | `high` |
| oracle | `deepseek-v4-pro` | `xhigh` |
| delegate | `deepseek-v4-pro` | `xhigh` |
| context-builder | `deepseek-v4-pro` | `xhigh` |
| researcher | `deepseek-v4-pro` | `xhigh` |

> **Thinking rule:** `deepseek` models → `xhigh`; `kimi` models → `high`.

## Provider Setup

### Ollama Cloud

[pi-ollama-cloud](https://github.com/fgrehm/pi-ollama-cloud) registers Ollama Cloud as a model provider with dynamically fetched models and built-in web search/fetch tools.

**Setup:**

```bash
# 1. Get an API key at ollama.com and set it
export OLLAMA_API_KEY="your-ollama-cloud-api-key"
# Or add it to ~/.pi/agent/auth.json:
# { "ollama-cloud": { "type": "api_key", "key": "your-key" } }

# 2. Fetch the full model list (run after install and whenever models change)
/ollama-cloud-refresh
```

On first launch (before `/ollama-cloud-refresh`), a small set of fallback models is used. After refresh, all tool-capable Ollama Cloud models become available under the `ollama-cloud` provider — switch with `/model` or `Ctrl+L`.

Models are cached at `~/.pi/agent/cache/ollama-cloud-models.json` (never expires; refresh manually).

**Tools added:**

| Tool | Description |
|------|-------------|
| `ollama_web_search` | Web search via Ollama Cloud's search API |
| `ollama_web_fetch` | Web page fetch and extraction via Ollama Cloud |

Both use the same API key configured for the provider — no local Ollama server needed. These coexist with `web_search` (DuckDuckGo via `pi-web-search`) and `web_fetch` (via `pi-smart-fetch`).

> **Recomendação:** Dê `/ollama-webtools off` para desligar o `ollama_web_search` e o `ollama_web_fetch`. Eles são inferiores ao `web_search` do DuckDuckGo (`@leonardorick/pi-web-search`) e ao `web_fetch` com TLS fingerprinting (`pi-smart-fetch`) — o Ollama tende a preferir as próprias tools quando estão disponíveis, mesmo que os resultados sejam piores. Com `/ollama-webtools off`, o modelo usa automaticamente as tools superiores.

## Notifications

[pi-alert](https://github.com/maxpetretta/pi-alert) sends a system notification when the agent finishes its turn. Notifications fire automatically after every prompt — no configuration needed.

**Notification body** shows an activity summary with elapsed time, prioritizing the most useful signal from the completed run:
1. Updated files
2. Other tool calls
3. Read files
4. Generic completion fallback

**Title** uses the project root directory name (e.g. `pi — pi-dev-config`).

### Delivery

Terminal-native notifications when running in a supported terminal:

| Terminal | Protocol |
|----------|----------|
| Ghostty | OSC 777 |
| iTerm2 | OSC 9 |
| WezTerm | OSC 777 |
| Kitty | OSC 99 |
| rxvt-unicode | OSC 777 |
| tmux | Passthrough to outer terminal |

When no terminal-native transport is available, pi-alert falls back to the OS:

| OS | Fallback |
|----|----------|
| macOS | `osascript` with native notification + `Glass` sound |
| Linux | `notify-send` (install `libnotify-bin` if missing) |
| Windows | PowerShell `NotifyIcon` balloon notification |
| Final resort | Terminal bell (`BEL`) |

## Ghostty

Configuração do terminal Ghostty para desenvolvimento com pi.

### Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `ghostty/config.ghostty` | Tema GitHub Dark, JetBrains Mono 12px, cursor barra piscante, padding 8x4, shell integration |
| `ghostty/SSH_NERD_FONT.md` | Guia para ícones Nerd Font funcionarem via SSH (Ghostty → VPS) |

### SSH Nerd Font

Para o status line mostrar ícones corretamente ao conectar em VPS via SSH:

1. **Local** — a config já inclui `ssh-env` no `shell-integration-features`
2. **VPS** — adicionar `TERM_PROGRAM TERM_PROGRAM_VERSION` no `AcceptEnv` do sshd (ver `ghostty/SSH_NERD_FONT.md`)

### Copiar para o sistema

```bash
cp ~/dev/pi-dev-config/ghostty/config.ghostty ~/.config/ghostty/config.ghostty
```

Reinicie o Ghostty completamente após copiar.

## Context & Rules

Pi loads two kinds of instruction files at startup:

| File | Scope | Purpose |
|------|-------|---------|
| `APPEND_SYSTEM.md` | Global (`~/.pi/agent/`) | Extends the **system prompt** — behavioral rules and conventions that apply to every agent session (code style, testing discipline, logging, etc.). Appended without replacing the native prompt. |
| `AGENTS.md` | Per-project | Project-level **context** — stack, conventions, build commands, and local rules. Pi concatenates all `AGENTS.md` found from `cwd` up through parent directories plus `~/.pi/agent/`. |

This repo ships a reusable `APPEND_SYSTEM.md` with language-agnostic coding rules. Copy it once to your global config. For project-specific instructions, create `AGENTS.md` at the project root — no example is included here because it should be customized per project (tech stack, build commands, team conventions, etc.).

### AGENTS.md Best Practices

See `docs/research/AGENTS.md-analysis-20260529.md` for a comprehensive research report (14 sources, 6 core areas). Key takeaways:

- **6 core areas** every AGENTS.md should cover: Commands, Testing, Project Structure, Code Style, Git Workflow, Boundaries
- **Commands at the top** with exact flags, copy-pasteable — highest-ROI section
- **Boundaries with 3 levels** (✅ Always / ⚠️ Ask first / 🚫 Never) — single most effective constraint pattern
- **Code examples over descriptions** — one real snippet beats three paragraphs
- **≤150-180 linhas** é o sweet spot — cada linha extra consome tokens do context window
- **Sem changelog ou documentação humana** — AGENTS.md é runtime instruction set, README.md é pra humanos

## Structure

```
pi-dev-config/
├── APPEND_SYSTEM.md               # Global system-prompt rules and conventions
├── settings.json                  # Pre-configured pi settings (Ollama Cloud provider)
├── assets/                        # Static assets (images, etc.)
├── docs/
│   ├── DESIGN.md                        # Cal.com design system analysis (Dembrandt)
│   ├── PI_DEV_CHEATSHEET.md             # Practical workflow guide (PT)
│   ├── PI_DEV_CHEATSHEET_EN.md          # Practical workflow guide (EN)
│   ├── screenshot-pi-dev.png            # Screenshot for README
│   ├── streamlit_pro_tips.md            # 25+ Streamlit PRO tips from official video
│   ├── streamlit_extras_guide.md        # streamlit-extras complete reference guide
│   └── research/
│       └── AGENTS.md-analysis-20260529.md  # AGENTS.md industry standard research (14 sources)
├── rtk/
│   └── config.toml               # RTK exclude list: ls, grep, rg (bypass known bugs)
├── ghostty/
│   ├── config.ghostty             # Tema GitHub Dark, JetBrains Mono, shell integration
│   └── SSH_NERD_FONT.md           # Guia de Nerd Fonts via SSH
├── vibes/
│   ├── startrek.txt               # Startrek: 99 phrases
│   ├── klingon.txt                # Klingon + translations: 26 phrases
│   ├── standup.txt                # Standup comedy: 32 phrases
│   ├── tiozao.txt                 # Tiozão jokes: 43 phrases
│   └── bbs.txt                    # BBS taglines 90s: 52 phrases
├── README.md                      # This file
```

## Notes

### "auto-update off" na barra de status

É o status do `pi-extension-manager`. Significa que a verificação automática de atualizações de pacotes está desligada. Para ativar:

```
/extensions auto-update daily
```

Outros intervalos: `weekly`, `1h`, `6h`, `3d`, `2w`, `1mo`, ou `/extensions auto-update` para o wizard interativo.

## License

MIT
