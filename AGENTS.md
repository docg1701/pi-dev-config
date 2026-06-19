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
3. **Create a lightweight tag** on the version-bump commit: `git tag vX.Y.Z` (no `-a`, no `-m`). The commit subject becomes the release subtitle, so the title is `vX.Y.Z: chore: bump version to X.Y.Z` — no message to author, no duplicated version number.
4. **Push both branch and tag**: `git push origin master vX.Y.Z`.

Important:

- Both lightweight and annotated tags trigger the `release` job (`on: push: tags` fires for either). Prefer lightweight — an annotated tag whose message starts with `vX.Y.Z` produces a duplicated title (`vX.Y.Z: vX.Y.Z: ...`).
- Do NOT use `git tag -a` / `-m` for releases (see `docs/ci-auto-release-guide.md`, Pitfall 10).
- Pushing only `VERSION` without the tag creates a commit but no release.
- The CI job builds release notes from commits between the previous `v*.*.*` tag and the new one, grouping by `feat`, `fix`, and remaining conventional-commits.
- If the release is a hotfix/bugfix, still bump `VERSION` accordingly; the tag drives the release, not the commit type.
