# README.md Best Practices — Research 2026-06-04

> Research done to correct the `README.md` of the **theotherme** project. Focus
> on professional README patterns in serious open-source projects on GitHub.
> Sources: standard-readme spec, codec8, dev.to guides, Best-README-Template.

## 1. General principles (synthesis)

- README is the "cover" of the project — 30 seconds decide whether the visitor stays.
- **Sections must appear in order** — sections out of order break the mental pattern.
- `>` blockquote should NOT be used for description (Hugo does; GitHub doesn't).
- Badges aligned on one line after the title, separated by newline.
- Centered logo + title = "cover" (maximosovsky).
- **Short description < 120 chars**, without `> `, without its own title.
- Each section has ONE clear function, no repeating content.
- Don't be verbose. **Long description** goes in `Background` (not a chapter).
- Everything "for the dev who will contribute" goes in `AGENTS.md` or `CONTRIBUTING.md`,
  not in the README.

## 2. Canonical structure (standard-readme + adaptations)

Required order:

1. **Title** — `# Project Name` (one line)
2. **Banner** — `<p align="center"><img src="assets/logo.webp" alt="..."></p>`
   (no own title, centered logo, max 200-400px width)
3. **Short Description** — one line, < 120 chars, no `> `
4. **Badges** — `![](https://img.shields.io/...)` on one line, newline-separated
5. **Long Description / What is it** — 1-2 paragraphs, max 3
6. **Table of Contents** — if README > 100 lines
7. **Background** — motivation, abstract dependencies (optional, can skip)
8. **Install** — installation code block
9. **Usage** — common use code block + CLI subsection if any
10. **API** — describes exported functions (optional; here we have `app/`, can skip)
11. **Maintainers** — who maintains (optional)
12. **Contributing** — where to ask, if PRs are accepted
13. **License** — ALWAYS the last section

## 3. Anti-patterns in the current README (theotherme)

| Anti-pattern | Location | Why it's bad |
|--------------|----------|--------------|
| `> blockquote` as caption | lines 5-7 | Looks like Hugo, not GitHub. Short desc goes bare |
| 3 lines of tagline in blockquote | lines 5-7 | Too verbose for a cover |
| "What it is" section + 3 philosophical paragraphs | lines 11-17 | That's what AGENTS.md does. README only needs 1-2 sentences |
| "Channels" table with 6 lines | lines 21-30 | Telegram works, the other 5 don't. README shouldn't promise what isn't in production |
| "Capabilities" table with 8 marketing bullets | lines 32-42 | For an infra project, this becomes self-promotion |
| "Stack" table | lines 44-52 | Everything is in `pyproject.toml`. Duplication |
| Huge "Manual prerequisites" with 7 items | lines 56-130 | This is devops doc, goes in `docs/deploy.md` or `CONTRIBUTING.md` |
| Old "Quick start" contradicts Deploy | was a problem, but already fixed |
| "Repo layout" duplicating the filesystem `tree` | removable |
| Inline "Configuration" | lines 130+ | Goes in `config.example.yaml` (already documented there) |
| "CI and releases" with CI details | lines 140+ | Goes in `.github/workflows/` or `CONTRIBUTING.md` |
| "Security" section | lines 150+ | OK to keep but short |

## 4. Final pattern proposed for theotherme

```markdown
# theotherme

<p align="center">
  <img src="assets/logo.webp" alt="theotherme" width="200">
</p>

Self-hosted AI digital twin: Telegram bot + web widget, multi-channel, with
long-term memory and RAG over a configurable persona.

[badges: version, CI, tests, license]

## What it is

A small, stable core (persona + memory + LLM client) and a set of injected
channels. Telegram works in production; Discord/Web/Meta are code-complete
and need manual platform setup.

## Install

```bash
git clone git@github.com:docg1701/theotherme.git
cd theotherme
uv sync
cp config.example.yaml config.yaml
# edit config.yaml
```

## Usage

```bash
uv run pytest -v                   # 313 tests
uv run python -m app.main --dry-run  # verify config
uv run python -m app.main          # start the bot
```

## Deploy

Production deploy is 100% Ansible. See `ansible/` directory and
[Manual prerequisites](#manual-prerequisites) below.

```bash
ansible-playbook -i ansible/inventory.yml ansible/playbooks/deploy.yml \
  --vault-password-file ~/.ansible_vault_theotherme
```

## Manual prerequisites

Brief list of what the operator must do before deploy. Link to detailed
docs for each platform.

## Architecture

Brief: Protocols in `app/channels/base.py`, `app/llm/base.py`, etc. The core
never imports concrete classes. DI wiring in `app/main.py`.

## Contributing

See `AGENTS.md` for AI agent rules and project conventions.

## License

MIT (or whatever the project uses)
```

## 5. Specific decisions for theotherme

- **Logo**: `assets/logo.webp`, centered, 200-400px (visual decision)
- **Description**: < 120 chars, no `> `, no italic
- **Badges**: shields.io for `version`, `ci`, `tests passing`, `license`
  (optional — only add if it doesn't clutter)
- **Channels table**: SIMPLIFY to 2 columns (Channel, Status) without long "Notes".
  Or remove and mention in running text.
- **Capabilities**: MOVE to `docs/capabilities.md` or eliminate
- **Stack table**: REMOVE (already in `pyproject.toml`)
- **Manual prerequisites**: KEEP but SHORTEN (1 line each, link to docs)
- **Repo layout**: REMOVE (filesystem `tree` is visible on GitHub)
- **Configuration**: REMOVE (already in `config.example.yaml`)
- **CI and releases**: REMOVE (`.github/workflows/` is self-documenting)
- **Security**: KEEP 1-2 lines

## 6. Sources

- [standard-readme spec](https://github.com/RichardLitt/standard-readme/blob/main/spec.md) — canonical section order
- [Best-README-Template](https://github.com/othneildrew/Best-README-Template) — visual badges + table of contents
- [How to Write a Good README 2026 — codec8](https://codec8.com/blog/how-to-write-good-readme) — "30 seconds decide"
- [GitHub README Template 2026 — dev.to](https://dev.to/iris1031/github-readme-template-the-complete-2026-guide-to-get-more-stars-3ck2) — shields.io badges, SEO
- [15 Essential Sections Every README Needs — dev.to](https://dev.to/georgekobaidze/15-essential-sections-every-readme-needs-give-your-project-what-it-deserves-fie) — section checklist
- [How to Write a Great README.md 2026 — UDT](https://ultimatedesigntools.com/blog/how-to-create-readme/) — minimum elements
- [maximosovsky/readme-guidelines](https://github.com/maximosovsky/readme-guidelines) — "cover" pattern
