# CI + Auto-Release from Tags

Practical guide for implementing CI (automated tests) and automatic GitHub Releases
generation from semver tags, with categorized changelog.

## Requirements

- Python 3.11+ with `uv` as package manager
- Tests with `pytest`
- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`, etc.)
- Lightweight semver tags (`git tag vX.Y.Z <commit-sha>`) — the tagged commit's subject becomes the release subtitle (see "How to use")

## Architecture

A single workflow file (`ci.yml`) with two triggers and two jobs:

```
push/PR to main ──► job: test (matrix 3.11 + 3.13)
                          │
push tag v*.*.* ──► job: test (same matrix)
                          │
                          └── if pass ──► job: release
                                                │
                                                ├── git fetch --tags
                                                ├── read tagged commit subject → title
                                                ├── categorized git log → body
                                                └── gh release create
```

The release is **never** created if tests fail (gate via `needs: test`).

## Complete workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
    tags: ['v*.*.*']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.11', '3.13']
    steps:
      - uses: actions/checkout@v5

      - uses: astral-sh/setup-uv@v8.1.0
        with:
          python-version: ${{ matrix.python-version }}
          enable-cache: true
          cache-dependency-glob: |
            **/pyproject.toml
            **/uv.lock

      - run: uv lock --check
      - run: uv run --frozen pytest -v

  release:
    needs: test
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Build release notes
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -uo pipefail

          git fetch --tags --force 2>/dev/null || true

          PREV_TAG=$(git tag --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | grep -v "${{ github.ref_name }}" | head -1 || true)

          # Tagged commit subject (lightweight) or tag message (annotated) → title subtitle
          SUBTITLE=$(git tag -l --format='%(contents)' "${{ github.ref_name }}" 2>/dev/null | head -1 || true)
          if [ -z "$SUBTITLE" ]; then
            TITLE="${{ github.ref_name }}"
          else
            TITLE="${{ github.ref_name }}: $SUBTITLE"
          fi

          strip() { sed -E 's/^- [a-z]+(\([^)]*\))?: /- /'; }

          NOTES=/tmp/release-notes.md
          :> "$NOTES"

          if [ -n "$PREV_TAG" ]; then
            RANGE="${PREV_TAG}..${{ github.ref_name }}"
          else
            RANGE="${{ github.ref_name }}"
          fi

          ADDED=$(git log --pretty=format:"- %s" $RANGE --grep="^feat" -E 2>/dev/null | strip || true)
          if [ -n "$ADDED" ]; then
            { echo "### Added"; echo "$ADDED"; echo ""; } >> "$NOTES"
          fi

          FIXED=$(git log --pretty=format:"- %s" $RANGE --grep="^fix" -E 2>/dev/null | strip || true)
          if [ -n "$FIXED" ]; then
            { echo "### Fixed"; echo "$FIXED"; echo ""; } >> "$NOTES"
          fi

          CHANGED=$(git log --pretty=format:"- %s" $RANGE | grep -E '^- (chore|docs|ci|refactor|style|test|perf|revert|build)(\(.+\))?:' | strip || true)
          if [ -n "$CHANGED" ]; then
            { echo "### Changed"; echo "$CHANGED"; echo ""; } >> "$NOTES"
          fi

          if [ -n "$PREV_TAG" ]; then
            echo "**Full Changelog**: https://github.com/${{ github.repository }}/compare/${PREV_TAG}...${{ github.ref_name }}" >> "$NOTES"
          fi

          gh release create ${{ github.ref_name }} \
            --title "$TITLE" \
            --notes-file "$NOTES"
```

## How to use

### 1. Create the tag (lightweight — recommended)

Create a **lightweight** tag on the version-bump commit. Its subject becomes the
release subtitle — no tag message to author, no duplication risk:

```bash
git tag v2.4.2 <version-bump-commit-sha>
git push origin v2.4.2
```

For a version-bump commit `fix: version bump 2.4.1 -> 2.4.2 (context)`, the result:

- Title: `v2.4.2: fix: version bump 2.4.1 -> 2.4.2 (context)`
- Body: categorized changelog auto-generated from commits

The release job reads `git tag -l --format='%(contents)'`; for a lightweight tag this
returns the tagged commit's message (first line = subject), so the title is
`<tag>: <commit subject>` with zero manual authoring.

> **Why lightweight, not annotated**: an annotated tag (`git tag -a -m "..."`) makes
> the CI use the tag message as the subtitle. If that message starts with the version
> (a natural mistake), the CI prepends the tag name again → `v2.4.2: v2.4.2: ...`
> (see Pitfall 10). A lightweight tag has no message, so the commit subject is used
> as-is — and you also avoid the `git stripspace` / `#`-comment pitfalls.

### 2. What happens

1. The tag push triggers the workflow
2. `job: test` runs pytest on Python 3.11 and 3.13
3. If both pass, `job: release` runs:
   - `git fetch --tags --force` to ensure the annotated tag is locally available
   - Reads the tagged commit subject (via `git tag -l --format='%(contents)'`) → first line becomes the title subtitle
   - `git log` between previous and current tag, grouped by commit type
   - `sed` removes the prefix (`fix:` → empty, `feat(scope):` → empty)
   - Creates the release via `gh release create`

### 3. Conventional commit → category mapping

| Prefix | Category |
|---|---|
| `feat:` | `### Added` |
| `fix:` | `### Fixed` |
| `chore:`, `docs:`, `ci:`, `refactor:`, `style:`, `test:`, `perf:`, `revert:`, `build:` | `### Changed` |

Categories with no commits are omitted (no empty `### Added` section).

## Required permissions

The workflow needs `contents: write` **only in the `release` job**.
The default token `${{ github.token }}` is enough — no PAT or additional secrets
required.

```yaml
permissions:
  contents: write
```

## Security

| Mechanism | What it protects |
|---|---|
| `needs: test` | Release only exists if tests pass |
| `if: startsWith(github.ref, 'refs/tags/v')` | Only fires on tag, never on branch |
| `github.ref_name` | Tag name comes from the push event, not from input |
| `permissions: contents: write` | Minimal scope, only writes release |
| `secrets.GITHUB_TOKEN` | Ephemeral, expires with the job |

## Dependencies

| Tool | Version | Use |
|---|---|---|
| `actions/checkout` | v5 | Repository clone |
| `astral-sh/setup-uv` | v8.1.0 | Installs uv + Python |
| `gh` CLI | pre-installed on runner | Release creation |

> **Note**: `astral-sh/setup-uv` uses immutable tags (`v8.1.0`), not floating tags
> (`v8`). Always pin the exact version.

## Pitfalls found and how to avoid them

### 1. `generate-notes` from GitHub API does not categorize without PRs

**Problem**: `gh api .../releases/generate-notes` only produces `### Added`/`### Fixed`/`### Changed`
when there are merged Pull Requests. With direct commits to `main`, it returns only a comparison
link.

**Solution**: generate the changelog ourselves with `git log --grep` categorized by
conventional commit type.

### 2. Race condition: tag not available in API immediately

**Problem**: after the push, the `git/ref/tags/...` API can return 404 for a few seconds.

**Solution**: use `git fetch --tags --force` (local, no API) to access the tag
annotation. Zero latency, zero race condition.

### 3. `git tag -l` does not find annotated tags on the runner

**Problem**: `actions/checkout` with `fetch-depth: 0` does not always pull annotated tag
objects (only the commits).

**Solution**: `git fetch --tags --force` executed explicitly before `git tag -l`.

### 4. `body_path` replaces the body, does not append

**Problem**: in `softprops/action-gh-release`, `body_path` **replaces** the entire body.
`body` with a heredoc **prepends** to `generate_release_notes`.

**Solution**: generate the full notes file ourselves and use `gh release create --notes-file`,
which accepts the final content with no ambiguity.

### 5. `fix:` prefix is not removed with badly escaped sed

**Problem**: `eval` + nested sed variables in YAML block scalars cause incorrect
backslash escaping.

**Solution**: define a `strip()` function in bash with inline sed, no `eval`, no
intermediate variables. The correct ERE pattern is:

```bash
strip() { sed -E 's/^- [a-z]+(\([^)]*\))?: /- /'; }
```

- `\(` and `\)` in ERE: escape literal parentheses (optional scope)
- `?`: makes the scope group optional
- No doubled `\\` (which YAML would interpret differently)

### 6. `git stripspace` removes lines starting with `#`

**Problem**: `git tag -a` applies `git stripspace`, which treats `#` as a comment and
removes lines starting with it. `## What's new` gets removed.

**Solution**: do not start annotation lines with `#`. Use `What's new` or
`Release notes` without a hash.

### 7. `body_path` + `generate_release_notes` do not combine

**Problem**: the `softprops/action-gh-release` docs say `body` prepends to
`generate_release_notes`, but `body_path` does not have the same behavior.

**Solution**: use `gh release create --notes-file` with the already complete file
(annotation + categorized changelog), removing the ambiguity.

### 8. `uv.lock` desyncs after a version bump

**Problem**: when changing `version` in `pyproject.toml`, `uv.lock` keeps the previous
version internally. `uv run --frozen` does not detect this inconsistency — it only
prevents the lockfile from being modified, it does not validate that it is in sync
with `pyproject.toml`.

**Solution**: add `uv lock --check` before tests in CI. This command compares the
lockfile with `pyproject.toml` and fails if they are out of sync.

```yaml
- run: uv lock --check
```

To fix locally, run `uv lock` and commit the updated `uv.lock` together with the
version bump.

### 9. Hardcoded `__version__` in `__init__.py` and tests breaks every bump

**Problem**: many projects keep `__version__ = "X.Y.Z"` hardcoded in
`__init__.py`, in addition to `version` in `pyproject.toml`. Tests that import
`from package import __version__` and do `assert __version__ == "1.2.3"` break
on every version bump. The CI that runs after the bump detects the inconsistency and fails.

**Solution**: eliminate the double source of truth. Use `importlib.metadata.version()`
in `__init__.py`, and in tests verify only that `__version__` is a non-empty string
(or compare with `importlib.metadata.version("package-name")`).

```python
# src/package/__init__.py
from importlib.metadata import version

__version__ = version("package-name")
```

```python
# tests/test_scaffold.py
def test_version() -> None:
    assert isinstance(__version__, str)
    assert len(__version__) > 0
```

If the CLI uses `click.version_option(package_name="...")`, the flag test must
use `__version__` instead of a hardcoded string:

```python
def test_version_flag(self) -> None:
    runner = click.testing.CliRunner()
    result = runner.invoke(cli, ["--version"])
    assert result.exit_code == 0
    assert __version__ in result.output  # never "1.2.3"
```

## Variants

### Project without `uv.lock`

If the project has no lockfile, replace:

```yaml
- run: uv run --frozen pytest -v
```

With:

```yaml
- run: uv sync --group dev
- run: uv run pytest -v
```

### Project without `uv`

Use `actions/setup-python`:

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: ${{ matrix.python-version }}
- run: pip install -e ".[dev]"
- run: pytest -v
```

### Lightweight tag (recommended — see "How to use" above)

A lightweight tag (`git tag vX.Y.Z <sha>`, no `-a`) does **not** return empty:
`git tag -l --format='%(contents)'` returns the tagged **commit message**, whose first
line (the commit subject) becomes the subtitle. The title is `<tag>: <commit subject>`,
e.g. `v2.5.0: feat: version bump 2.4.4 → 2.5.0 (scheduled upload notifications)`.

No tag message to author, and no risk of duplicating the version number. Use an
annotated tag (`-a -m`) only if you need a subtitle different from the commit subject
— and then never start the message with the version (Pitfall 10).

### 10. Duplicated version number in release title

**Problem**: with an **annotated** tag whose message starts with a version number
(e.g. `v1.3.0: fix bug`), the CI prepends the tag name again → `v1.3.0: v1.3.0: fix bug`.

**Solution A — use a lightweight tag (recommended; eliminates the whole class of bug)**:
`git tag vX.Y.Z <commit-sha>` (no `-a`, no `-m`). With no tag message, the CI uses the
tagged commit's subject as the subtitle — nothing can be duplicated. This is the default
shown in "How to use" above.

**Solution B — CI guard (only if you keep annotated tags)**: add a validation step before
`gh release create` that rejects tag annotations starting with a version pattern:

```bash
SUBTITLE=$(git tag -l --format='%(contents)' "${{ github.ref_name }}" | head -1)

# Guard: subtitle MUST NOT start with version number
if echo "$SUBTITLE" | grep -qE '^v[0-9]+\.[0-9]+\.[0-9]+'; then
  echo "ERROR: Tag annotation starts with a version number." >&2
  echo "  The CI prepends the version automatically. Drop the prefix." >&2
  echo "  Good: git tag -a ${{ github.ref_name }} -m 'sec fix and docs update'" >&2
  bad="git tag -a \${{ github.ref_name }} -m '\${{ github.ref_name }}: bad example'"
  echo "  Bad:  $bad" >&2
  exit 1
fi
```

**Solution C — discipline**: document the rule in AGENTS.md / CONTRIBUTING.md. The CI
guard enforces; the docs prevent the attempt.

## Myth: "only annotated tags trigger the release job"

False. `on: push: tags: ['v*.*.*']` fires for **any** tag push — lightweight or
annotated. The release job's `if: startsWith(github.ref, 'refs/tags/v')` does not
inspect tag type. A lightweight `git tag vX.Y.Z <sha>` + `git push origin vX.Y.Z`
triggers the release job exactly like an annotated tag (verified empirically). Do not
write "only annotated tags trigger the release" in your AGENTS.md — it is wrong and
pushes people toward the duplication-prone annotated-tag flow.

## Keeping README version/tests badges in sync (private repos)

shields.io dynamic badges (`github/v/release`, `github/actions/workflow/status`) only
work for **public** repos — for a private repo they return "repo not found". To keep
the README version (and tests) badge on the current release without manual edits, add a
CI job that syncs the static badge numbers from the single source of truth.

`sync-badges` runs on every push to the default branch, reads the version from
`pyproject.toml` (or your `VERSION` file) and the test count from pytest, rewrites the
two badge URLs in README, and commits `[skip ci]` **only when a value changed**:

```yaml
  sync-badges:
    needs: test            # or needs: validate — whatever your gate job is called
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v5
      - uses: astral-sh/setup-uv@v8.1.0
        with:
          python-version: '3.13'
          enable-cache: true
          cache-dependency-glob: |
            **/pyproject.toml
            **/uv.lock
      - name: Sync README badges (version from pyproject, tests from pytest)
        continue-on-error: true   # cosmetic — never fail CI over a badge
        run: |
          set -uo pipefail
          VERSION=$(grep -E '^version\s*=' pyproject.toml | head -1 | sed -E 's/.*"([^"]+)".*/\1/')
          COUNT=$(uv run --frozen pytest --co -q 2>&1 | grep -E '[0-9]+ tests collected' | grep -oE '[0-9]+' | head -1)
          echo "version=$VERSION count=$COUNT"
          if [ -z "$VERSION" ] || [ -z "$COUNT" ]; then echo "skip"; exit 0; fi
          sed -i -E "s#(badge/version-)[0-9]+\.[0-9]+\.[0-9]+(-blue)#\1${VERSION}\2#" README.md
          sed -i -E "s#(badge/tests-)[0-9]+(%20passed-brightgreen)#\1${COUNT}\2#" README.md
          if git diff --quiet README.md; then
            echo "badges already up to date"
          else
            git config user.name "github-actions[bot]"
            git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
            git add README.md
            git commit -m "chore(sync-badges): v${VERSION} / ${COUNT} tests [skip ci]"
            git push
          fi
```

Notes:

- `[skip ci]` plus the fact that `GITHUB_TOKEN` commits do not trigger downstream
  workflow runs means no infinite loop.
- `continue-on-error: true` keeps CI green even if badge sync hiccups.
- Adjust the version source (`pyproject.toml` vs a `VERSION` file) and the badge URL
  patterns to match your README.
- For a public repo, prefer the dynamic shields.io badges — no CI job needed.

## Documenting the release in AGENTS.md

The CI only enforces *what* happens on a tag push. It does not tell an agent *how* to
cut a release, so agents improvise (annotated tags, manual `gh release create`, stale
badges). Add a "Release & version bump" section to the project's AGENTS.md so the next
agent follows the exact procedure. The pattern is: **version in ONE place, everything
else derived/automated, and the release driven by a lightweight tag + CI auto-release.**

Template (adapt the source-of-truth file and branch name to the project):

```markdown
## Release & version bump

The version lives in ONE place: `pyproject.toml`'s `version` (or the `VERSION` file).
Everything else is derived — do NOT edit version numbers elsewhere.

- `uv.lock` — syncs automatically: run `uv lock` after bumping `pyproject.toml`.
- README `version` + `tests` badges — kept in sync by the CI `sync-badges` job. NEVER
  edit them manually (private repo: shields.io dynamic badges don't work).
- Git tag `vX.Y.Z` + GitHub release — created at release time (below).

### Release procedure (follow EXACTLY — CI auto-creates the release)

1. Bump `version` in `pyproject.toml` (the ONLY numeric edit).
2. `uv lock` to sync `uv.lock`. Commit `pyproject.toml` + `uv.lock` in ONE version-bump
   commit: `fix: version bump X.Y.Z -> A.B.C (context)`.
3. Push to the default branch via PR (never push directly to main/master without PR).
4. Create a **lightweight** tag on the version-bump commit: `git tag vX.Y.Z <sha>`
   — NOT `git tag -a`, NOT `-m`.
5. `git push origin vX.Y.Z`. CI's `release` job auto-creates the GitHub release named
   `vX.Y.Z: <subject of the tagged commit>`. Do NOT create or edit the release manually.

### 🚫 NEVER (release)
- `git tag -a` / `git tag -m` — annotated tags make CI name the release from the tag
  message, producing duplicated titles (e.g. `v2.5.1: v2.5.1 — ...`).
- `gh release create` / `gh release edit` — the CI `release` job owns the release.
- Editing the README `version` or `tests` badges — CI `sync-badges` owns them.
- Force-pushing a tag after CI created the release — makes `release` fail (release
  already exists) and leaves a red CI run.
- Bumping the version anywhere except the single source of truth.
```

This implements the pattern "when the agent errs a pattern repeatedly, add a specific
rule to AGENTS.md" — the cheapest way to stop recurring wrong version bumps.
