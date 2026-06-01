#!/usr/bin/env python3
"""Validate project config files: JSON, TOML, and doc references.

Usage: python3 validate.py
Exits 0 on success, 1 on any validation failure.
"""

import json
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def fail(msg: str) -> None:
    print(f"FAIL: {msg}", file=sys.stderr)


def validate_json(path: Path) -> bool:
    """Validate a single JSON file is parseable and has expected top-level keys."""
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError as e:
        fail(f"{path}: invalid JSON — {e}")
        return False

    if path.name == "settings.json":
        for key in ("packages", "defaultProvider", "defaultModel", "enabledModels"):
            if key not in data:
                fail(f"{path}: missing required key '{key}'")
                return False
        if not isinstance(data.get("packages"), list):
            fail(f"{path}: 'packages' must be an array")
            return False

    print(f"  OK  {path}")
    return True


def validate_toml(path: Path) -> bool:
    """Validate a single TOML file is parseable."""
    try:
        tomllib.loads(path.read_text())
    except Exception as e:
        fail(f"{path}: invalid TOML — {e}")
        return False
    print(f"  OK  {path}")
    return True


def validate_markdown(path: Path) -> bool:
    """Basic markdown sanity: file exists and is non-empty."""
    try:
        content = path.read_text().strip()
    except OSError as e:
        fail(f"{path}: cannot read — {e}")
        return False
    if not content:
        fail(f"{path}: empty file")
        return False
    print(f"  OK  {path}")
    return True


def main() -> int:
    errors = 0

    # JSON files
    print(":: JSON ::")
    for p in sorted(ROOT.glob("*.json")):
        if not validate_json(p):
            errors += 1

    # TOML files
    print(":: TOML ::")
    for p in sorted(ROOT.rglob("*.toml")):
        if not validate_toml(p):
            errors += 1

    # Markdown files (top-level and docs/)
    print(":: Markdown ::")
    md_files = sorted(ROOT.glob("*.md")) + sorted((ROOT / "docs").glob("*.md"))
    for p in md_files:
        if not validate_markdown(p):
            errors += 1

    if errors:
        print(f"\n{errors} validation error(s)", file=sys.stderr)
        return 1
    print("\nAll validations passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
