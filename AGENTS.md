# pi-dev-config

See `README.md` for overview, setup, and file purposes.

## Operational rules

- The single source of truth for settings is `settings.json` (Ollama Cloud provider).
- After config changes, tell the user to `/reload` in pi.
- Extension/skill installs or removals must be reflected in `README.md` tables.
- `docs/PI_DEV_CHEATSHEET_EN.md` is an agent workflow guide — reference it when the user asks about subagent flows, reviewer agent usage, or oracle patterns.
- When using the `subagent` tool, read `docs/pi-subagents-pitfalls.md` first. It documents real schema bugs and validated patterns that prevent the errors the skill teaches.

## Version bump and release

This repository uses GitHub tags to trigger releases via `.github/workflows/ci.yml`.

To publish a new version, execute exactly in this order:

1. **Update `VERSION`** with the new semver string (`X.Y.Z`, no `v` prefix).
2. **Commit the bump**: `git add VERSION && git commit -m "chore: bump version to X.Y.Z"`.
3. **Create an annotated tag**: `git tag -a vX.Y.Z -m "vX.Y.Z: <one-line summary>"`.
4. **Push both branch and tag**: `git push origin master vX.Y.Z`.

Important:

- Only annotated tags trigger the `release` job in CI.
- Pushing only `VERSION` without the tag creates a commit but no release.
- The CI job builds release notes from commits between the previous `v*.*.*` tag and the new one, grouping by `feat`, `fix`, and remaining conventional-commits.
- If the release is a hotfix/bugfix, still bump `VERSION` accordingly; the tag drives the release, not the commit type.
