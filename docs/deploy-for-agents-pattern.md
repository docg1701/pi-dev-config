# deploy-for-agents.md — pattern for LLM-agent-friendly deployment

> How to write a deployment guide that an LLM agent can follow reliably, for any
> project using Ansible, VPS, Docker, secrets, and interactive human+LLM workflows.

## Why this file exists

LLM agents are not humans. When an agent reads a typical human-oriented README or
deploy guide, three things go wrong:

1. **Implicit knowledge gaps** — humans know that passwords change per deployment,
   that `localhost` means different things in different contexts, and that
   "configure the server" means "run these 12 commands in this exact order." Agents
   don't. They need every step explicit.

2. **Hardcoded defaults** — agents copy-paste what they see. If a deploy guide
   says `davi2019` as a password, the agent will use `davi2019` in production
   without asking. If it says `10.10.10.210`, the agent will hardcode that IP
   into config files. Agents follow instructions literally; ambiguity becomes
   disaster.

3. **No validation checkpoints** — humans notice when a command fails or produces
   unexpected output. Agents often don't, unless you tell them exactly what to
   check and what "success" looks like at each step.

`deploy-for-agents.md` solves all three. It is a self-contained, step-by-step
document that an agent can execute deterministically, with explicit validation
at every step and interactive questions where human input is required.

---

## Core principles

### 1. Every step must be a single, executable command block

```markdown
## Step 3 — Create Vault Password File

```bash
VAULT_FILE="ansible/.vault_pass"
if [ -f "$VAULT_FILE" ]; then
  echo "vault already exists"
else
  printf '<password-from-user>' > "$VAULT_FILE"
  chmod 0600 "$VAULT_FILE"
fi
ls -la "$VAULT_FILE"
```

**Validation:** File exists with mode `-rw-------` (0600) and size > 0.
```

The agent reads the command block, runs it, then checks the `**Validation:**`
line. If the validation fails, it knows something is wrong and can report it
instead of silently continuing with broken state.

### 2. Never hardcode values that change per deployment

This is the #1 mistake agents make. Instead of:

```
❌ ansible-vault encrypt_string 'sk-or-v1-my-real-key' --name vault_api_key
```

Write:

```
✅ The agent MUST ask the user for the API key, then encrypt the provided value:
   ansible-vault encrypt_string '<user-provided-key>' --name vault_api_key
```

Use `<placeholders>` that make it obvious a value must be substituted. Never put
real passwords, tokens, IPs, usernames, or file paths that differ between
machines in the document itself.

### 3. Interactive setup must be a dedicated step with explicit questions

The "setup wizard" pattern: one step of the deploy guide is a structured
questionnaire. Each question has:

- The exact text the agent should show the user
- What to do with the answer (encrypt, hash, write to file)
- A default value where one makes sense
- A warning if the user skips it (e.g., empty Telegram allowlist → anyone can
  message the bot)

```markdown
### 3.4 — Telegram allowed user IDs

The agent asks the user:

```
Q: "Enter allowed Telegram user IDs (comma-separated numeric IDs):"
```

Parse the input into a YAML list, then encrypt:

```bash
ansible-vault encrypt_string '[123456789, 987654321]' --name vault_telegram_allowed_user_ids
```

**If empty:** use `[]` and warn the user that anyone who finds the bot can
message it.
```

### 4. Secrets never touch plain-text git-tracked files

All secrets go into one of two places:

| Location | Purpose | Git |
|----------|---------|-----|
| `ansible/.vault_pass` | Ansible vault password | Gitignored (`ansible/.vault_pass` in `.gitignore`) |
| `ansible/group_vars/all.yml` | Vault-encrypted tokens, keys, hashes | Tracked (encrypted) |
| `config.yaml` | Runtime config (rendered from vault on VPS) | Gitignored |

Never commit a `.env` file, a `secrets.yaml`, or a `config.yaml` with real
values. The agent must run `ansible-vault encrypt_string` for every secret and
write only the encrypted output to files tracked by git.

### 5. Every deploy must have a health check step

The last step of any deploy guide must verify the deployment actually works:

```markdown
## Step 7 — Verify Health

```bash
ansible-playbook ansible/playbooks/health.yml
```

**Validation:** All `TASK` lines end with `ok=`. No `failed=` > 0.
```

Without this, the agent considers "deploy complete" when the playbook finishes,
even if the container crashed on startup.

---

## File structure template

```markdown
# Deploy Guide for LLM Agents — <project-name>

> One-line description of what this deploys.

## Goal

Deploy <project> to <target> using <tools>.

## Pre-flight Checks

- List of things that must exist before starting (SSH access, tokens, tools).

## Step 1 — Verify Local Environment

Check that required tools are installed.

## Step 2 — Clone Repository

Get the code.

## Step 3 — Interactive Setup Wizard ⭐

The agent asks the user for ALL personalized settings. This is the most
important step. Sub-steps:

3.1 — Vault password → ansible/.vault_pass
3.2 — API key → vault
3.3 — Bot token → vault
3.4 — Allowed user IDs → vault
3.5 — Web secret → vault
3.6 — Admin credentials → vault (password HASHED, not stored in plain text)
3.7 — Deploy key → vault
3.8 — Verify vault decrypt works

## Step 4 — Bootstrap (first time only)

Install Docker, create deploy user, configure firewall.

## Step 5 — Deploy

Run the main deploy playbook.

## Step 6 — Verify Health

Run health checks.

## Step 7 — Confirm Endpoints

curl the health endpoint.

## Admin Interface Capabilities (if applicable)

Table of what the admin panel does and doesn't do.

## Troubleshooting Decision Tree

Table of common failures and their fixes.

## State File Inventory

Table of every file the deploy creates/modifies, whether it's a secret, and
whether it's tracked by git.
```

---

## Integration with AGENTS.md

`deploy-for-agents.md` should be referenced from `AGENTS.md` so the agent
discovers it without being told:

```markdown
## First Deploy Setup

On first deploy to a new VPS, the agent MUST run the interactive setup wizard
before running any Ansible playbook. See `docs/deploy-for-agents.md` step 3
for the full questionnaire.

All user-provided values are stored locally in gitignored or vault-encrypted
files. Nothing is committed in plain text.
```

The AGENTS.md reference serves as a trigger: when the agent reads AGENTS.md
and sees "first deploy," it knows to open `deploy-for-agents.md` and follow
the wizard.

---

## What NOT to put in deploy-for-agents.md

- **Tutorials or explanations.** The agent needs commands and validation, not
  "Ansible is a configuration management tool that..."
- **Multiple ways to do the same thing.** Pick one path and document it.
  Options create ambiguity.
- **"Optional" steps without clear conditions.** If a step is optional, state
  exactly when it should be skipped: "Skip if the VPS already has Docker."
- **Human-only instructions.** Don't say "ask your sysadmin" — the agent is
  the sysadmin. Say "ask the user for the database password."
- **Passwords, tokens, IPs, or usernames in plain text.** Ever.

---

## Common anti-patterns (and their fixes)

| Anti-pattern | Why it breaks | Fix |
|---|---|---|
| `ssh -i ~/.ssh/id_ed25519 -F /dev/null ...` hardcoded in AGENTS.md | SSH config might not exist; key path differs between machines | "On first SSH access, ask the user for username and host IP. Pubkey auth." |
| `--vault-password-file ~/.ansible_vault_pass` in every command | Path hardcoded to home dir; agent can't change it | Put `vault_password_file = ansible/.vault_pass` in `ansible.cfg` at repo root |
| `printf 'hunter2' > vault_pass` in setup script | Password committed to docs, same for every deployment | Agent asks user for vault password, writes to gitignored file |
| "Configure the server" as a step | Too vague; agent will guess or skip | Break into explicit commands with validation at each sub-step |
| No health check after deploy | Agent thinks it succeeded but container crashed | Always end with `curl /healthz` or `ansible-playbook health.yml` |

---

## Checklist for creating deploy-for-agents.md

- [ ] Every step is a single command block with validation
- [ ] No hardcoded passwords, tokens, IPs, or usernames
- [ ] Interactive setup wizard asks for ALL personalized settings
- [ ] Secrets are vault-encrypted or gitignored, never in plain text
- [ ] Health check step verifies deployment succeeded
- [ ] Troubleshooting table maps common failures to fixes
- [ ] State file inventory lists every file, its purpose, and git status
- [ ] AGENTS.md references this file under "First Deploy Setup"
- [ ] Agent can execute the entire document without guessing
