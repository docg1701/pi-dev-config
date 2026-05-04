# pi-dev-config

See `README.md` for overview, setup, and file purposes.

## Operational rules

- `settings-ollama-cloud.json` and `settings-opencode-go.json` are the two symmetric variants. Keep both structurally in sync.
- After config changes, tell the user to `/reload` in pi.
- Extension/skill installs or removals must be reflected in `README.md` tables.
- `docs/PI_DEV_CHEATSHEET.md` and `docs/PI_DEV_CHEATSHEET_EN.md` are agent workflow guides — reference them when the user asks about subagent flows, reviewer agent usage, or oracle patterns.
