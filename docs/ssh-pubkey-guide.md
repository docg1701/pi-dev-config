# SSH pubkey access for AI agents and humans

> How to set up, maintain, and never break SSH access to any VPS — local or cloud.

## The golden rule

**SSH with public-key authentication works out of the box.** Three commands, zero config files:

```bash
ssh-keygen -t ed25519                     # 1. Generate key pair (once per machine)
ssh-copy-id user@<vps-ip>                 # 2. Copy public key to the remote host
ssh user@<vps-ip>                         # 3. Connect — no password, no config
```

`~/.ssh/config` is an **optional** customization file. It is never required for basic SSH access.
Do not create it unless you need per-host aliases, proxy jumps, or non-standard ports.

No tool in the OpenSSH suite (`ssh-keygen`, `ssh-copy-id`, `ssh`, `scp`, `sftp`) ever creates
`~/.ssh/config` automatically. If it exists, a human or an AI agent wrote it.

---

## Setup (any VPS, any OS)

### On your local machine

```bash
# Generate an ed25519 key pair (if you don't have one)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy the public key to the remote host
ssh-copy-id user@<vps-ip>

# Test
ssh user@<vps-ip> "echo 'connected'"
```

If `ssh-copy-id` asks for a password, enter it once. After this, you will never need it again.

### Multiple VPSes

Repeat `ssh-copy-id` for each host. The same key works everywhere:

```bash
ssh-copy-id user@<vps-1-ip>
ssh-copy-id user@<vps-2-ip>
ssh-copy-id user@<vps-3-ip>
```

---

## What AI agents get wrong (and why)

Agents frequently break SSH access by trying to be "helpful." Here are the four classic mistakes:

### Mistake #1: Creating a `~/.ssh/config` that forces password auth

```ssh-config
# NEVER DO THIS — it is the opposite of helpful
Host <vps-ip>
  PreferredAuthentications password
  PubkeyAuthentication no
```

Why it breaks: without an interactive terminal, `ssh` opens a GUI password popup that the
agent cannot interact with. The connection hangs or fails.

Why agents do it: they see pubkey fail (because the key wasn't copied to the remote host),
assume pubkey doesn't work, and try to "fix" it by switching to password. The real fix is
`ssh-copy-id`, not a config file.

### Mistake #2: Hardcoding credentials in AGENTS.md or code

```
# NEVER DO THIS
ssh galvani@10.10.10.210   # WRONG — hardcoded IP and username
```

Why it breaks: IPs change, usernames differ between machines, and committed credentials
are a security liability.

### Mistake #3: Using `sshpass` as a permanent workaround

```bash
sshpass -p "hunter2" ssh user@host   # fragile, insecure
```

Why it breaks: the password must be stored in plain text (command history, scripts,
agent logs). Pubkey is both simpler and safer.

### Mistake #4: Treating the symptom, not the cause

When SSH fails, agents often stack workarounds (`-F /dev/null`, `sshpass`, config hacks)
instead of running one diagnostic command: `ssh -o PreferredAuthentications=publickey
user@host`. If pubkey fails, the key isn't on the server — that's the root cause.

---

## What to put in AGENTS.md

For any project that involves SSH access to remote hosts, add this to `AGENTS.md`:

```markdown
## Remote hosts

- List the hosts by role (e.g., app-server, db-server, cache-server).
- On first SSH access in any session, ask the user for:
  - SSH username
  - IP or hostname of each host
- Pubkey auth with `~/.ssh/id_ed25519`. No password auth.
- No `~/.ssh/config` is needed — pubkey works out of the box.
  If `~/.ssh/config` exists and mentions these hosts, it was likely created
  by a confused agent. Delete it.

```bash
ssh <user>@<host-ip>   # the only command needed
```

Do not hardcode IPs, usernames, or passwords anywhere in this file.
```

Key principle: **ask, don't assume.** The agent should discover the environment, not encode
assumptions into the project.

---

## VPS access boundaries

When a project interacts with multiple VPSes, define clear access boundaries to prevent
agents from corrupting infrastructure maintained by other teams or projects.

### The rule

- **This project's VPS:** full read/write. Modify code, config, and structure freely.
- **Every other VPS:** read-only + CLI usage only. Never modify code, config, or
  structure — they belong to other people and other agents.
- On non-project VPSes, explore documentation (`/opt/*/README*`, `--help`, man pages)
  to discover CLI tools and adapt them for terminal/agent use. All services should
  expose functional CLI commands; use those instead of touching internals.

### Why this matters

Without this rule, an agent working on project A might "helpfully" reconfigure a database
or restart a service on a VPS owned by project B, breaking someone else's work. The
result is chaos: conflicting changes, untraceable outages, and lost trust in automation.

### Reusable AGENTS.md snippet

```markdown
## Infrastructure

- **VPSes:** list by role (e.g., app-server, db-server, tts-service). On first SSH
  access in any session, ask the user for: SSH username and the IP of each VPS.
  Pubkey auth with `~/.ssh/id_ed25519`.
  ```bash
  ssh <user>@<ip>   # the only command needed
  ```
  No `~/.ssh/config` needed — pubkey works out of the box. No password auth.

### 🔒 VPS access boundaries

- **This project's VPS (<vps-name>):** full read/write access. Modify code, config,
  structure freely.
- **Other VPSes (<other-names>):** read-only + CLI usage only. Never modify code,
  config, or structure — they belong to other people and other agents.
- On non-project VPSes, explore documentation (`/opt/*/README*`, `--help`, man pages)
  to discover CLI tools and adapt them for terminal/agent use.
```

---

## Diagnosis (for humans and agents)

Run these commands to verify SSH health before attempting any connection:

```bash
# 1. Does a key pair exist?
ls -la ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.pub

# 2. Is the key loaded in the SSH agent?
ssh-add -l

# 3. Is there a config file interfering?
cat ~/.ssh/config 2>/dev/null || echo "No config — good."

# 4. Does pubkey work?
ssh -o PreferredAuthentications=publickey -o ConnectTimeout=5 user@<vps-ip> "echo ok"
```

| Command output | What it means | What to do |
|---|---|---|
| `ls`: file not found | No key pair exists | `ssh-keygen -t ed25519` |
| `ssh-add -l`: agent has no identities | Key not loaded | `ssh-add ~/.ssh/id_ed25519` |
| `cat`: config file exists with `PubkeyAuthentication no` | A broken config is blocking pubkey | Delete `~/.ssh/config` |
| `ssh`: Permission denied (publickey) | Key not on remote host | `ssh-copy-id user@<vps-ip>` |
| `ssh`: "conectado" or similar | Everything works | Nothing to fix |

---

## Troubleshooting

### SSH opens a password popup

Your `~/.ssh/config` likely contains `PreferredAuthentications password` for this host.

1. Check: `cat ~/.ssh/config`
2. If the host block has `PubkeyAuthentication no` or `PreferredAuthentications password`:
   delete the file: `rm ~/.ssh/config`
3. Test pubkey: `ssh -o PreferredAuthentications=publickey user@<vps-ip>`
4. If pubkey still fails, the key isn't on the server: `ssh-copy-id user@<vps-ip>`

### Permission denied (publickey)

The remote host doesn't have your public key.

```bash
ssh-copy-id user@<vps-ip>   # enter password once, never again
```

### Connection refused or timeout

The VPS is unreachable. Check:

1. Is the VPS running? Ping it: `ping <vps-ip>`
2. Is SSH running on the VPS? `systemctl status sshd` (on the remote host)
3. Is a firewall blocking port 22?
4. Are you on the right network/VPN?

### SSH agent loses keys after reboot

Add this to `~/.bashrc` or `~/.zshrc`:

```bash
# Auto-load SSH key on login
if ! ssh-add -l &>/dev/null; then
    ssh-add ~/.ssh/id_ed25519
fi
```

---

## Summary

| Do | Don't |
|---|---|
| `ssh-keygen` + `ssh-copy-id` once per host | Create `~/.ssh/config` unless you really need it |
| Test pubkey: `ssh -o PreferredAuthentications=publickey` | Force password auth in config |
| Ask the user for IPs/usernames in AGENTS.md | Hardcode credentials anywhere |
| Delete `~/.ssh/config` if it blocks pubkey | Stack workarounds (`sshpass`, `-F /dev/null`) |
| Use ed25519 keys | Use RSA keys (slower, larger) |

The simplest setup is the correct one. If you need a config file, passwords, or custom flags,
something is broken — fix the root cause, don't paper over it.
