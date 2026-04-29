# pi-dev-config

See `README.md` for overview, setup, and file purposes.

## Operational rules

- `settings.json` is the active variant. Keep `settings-deepseek.json` structurally in sync when adding subagents or tools.
- After config changes, tell the user to `/reload` in pi.
- Extension/skill installs or removals must be reflected in `README.md` tables.
- `PI_DEV_CHEATSHEET.md` and `PI_DEV_CHEATSHEET_EN.md` are agent workflow guides — reference them when the user asks about subagent flows, review loops, or oracle patterns.
