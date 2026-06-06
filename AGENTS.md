# pi-dev-config

See `README.md` for overview, setup, and file purposes.

## Operational rules

- The single source of truth for settings is `settings.json` (Ollama Cloud provider).
- After config changes, tell the user to `/reload` in pi.
- Extension/skill installs or removals must be reflected in `README.md` tables.
- `docs/PI_DEV_CHEATSHEET_EN.md` is an agent workflow guide — reference it when the user asks about subagent flows, reviewer agent usage, or oracle patterns.
- When using the `subagent` tool, read `docs/pi-subagents-pitfalls.md` first. It documents real schema bugs and validated patterns that prevent the errors the skill teaches.
