# pi-dev-config

Reproducible pi.dev configuration. Cloned to `~/.pi/agent/config`.

## Files

| File | Deployed to | Purpose |
|------|------------|---------|
| `settings.json` | `~/.pi/agent/settings.json` | Subagents use Kimi K2.6 |
| `settings-deepseek.json` | `~/.pi/agent/settings.json` | Subagents use DeepSeek V4 Pro (scout=flash, reviewer=Kimi) |
| `APPEND_SYSTEM.md` | `~/.pi/agent/APPEND_SYSTEM.md` | Global agent behavior rules (code style, testing, logging) |
| `vibes/*.txt` | Read by pi-powerline-footer | Pre-generated vibe phrase files |

## Rules

- Never commit API keys or secrets.
- `settings.json` is the active variant; keep `settings-deepseek.json` in sync structurally.
- README.md is the human-facing docs; PI_DEV_CHEATSHEET.md is the agent workflow guide.
- After file changes, instruct the user to `/reload` in pi.
- Package install/uninstall changes must be mirrored in README.md tables.
