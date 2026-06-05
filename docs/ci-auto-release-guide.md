# CI + Auto-Release from Tags

Practical guide for implementing CI (automated tests) and automatic GitHub Releases
generation from semver tags, with categorized changelog.

## Requirements

- Python 3.11+ with `uv` as package manager
- Tests with `pytest`
- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`, etc.)
- Annotated semver tags (`git tag -a vX.Y.Z -F file.txt`)

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
                                                ├── read tag annotation → title
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

          # Tag annotation first line → title subtitle (fall back to bare version)
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

### 1. Create the tag

The tag annotation (file passed with `-F`) defines the release subtitle.
**Important**: do not start lines with `#` — Git treats them as comments
and strips them via `git stripspace`.

```bash
cat > /tmp/release-notes.txt << 'EOF'
New feature X with fixes Y and Z
EOF

git tag -a v2.4.2 -F /tmp/release-notes.txt
git push origin v2.4.2
```

Result:

- Title: `v2.4.2: New feature X with fixes Y and Z`
- Body: categorized changelog auto-generated from commits

### 2. What happens

1. The tag push triggers the workflow
2. `job: test` runs pytest on Python 3.11 and 3.13
3. If both pass, `job: release` runs:
   - `git fetch --tags --force` to ensure the annotated tag is locally available
   - Reads the tag annotation → first line becomes the title subtitle
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

### Tag without annotation (lightweight)

If the tag is created without `-a` (lightweight), `git tag -l --format='%(contents)'`
returns empty. The fallback uses the bare version number as title:

```
v2.5.0
```

Instead of:

```
v2.5.0: My description here
```

### 10. Duplicated version number in release title

**Problem**: when the tag annotation starts with a version number (e.g., `v1.3.0: fix bug`),
the CI prepends it again, producing `v1.3.0: v1.3.0: fix bug` — duplicated prefix.

**Solution A — CI guard (prevention)**: add a validation step before `gh release create`
that rejects tag annotations starting with a version pattern:

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

**Solution B — discipline (documentation)**: document the rule in AGENTS.md or
CONTRIBUTING.md so developers know the convention. The CI guard is the enforcement;
the documentation prevents the mistake from being attempted.

**Correct usage**:

```bash
git tag -a v1.3.1 -m "CI passing, markdownlint clean, 341 tests, tests OK"
```

Result: `v1.3.1: CI passing, 341 tests, markdownlint clean` — no duplication.
