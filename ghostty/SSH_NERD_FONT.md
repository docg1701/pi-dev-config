# SSH Nerd Font Setup (Ghostty → VPS)

For the pi-powerline-footer icons to render correctly over SSH with Ghostty.

## Prerequisites

The local terminal (Ghostty) must have a Nerd Font configured as `font-family`.

## 1. Local machine (Ghostty)

Add `ssh-env` to `shell-integration-features` in your Ghostty config:

**File:** `~/.config/ghostty/config` (or `config.ghostty`)

```ini
shell-integration-features = cursor, path, title, ssh-env, ssh-terminfo, sudo
```

Restart Ghostty completely (close all windows).

## 2. VPS (SSH server)

Add `TERM_PROGRAM TERM_PROGRAM_VERSION` to the sshd `AcceptEnv`:

```bash
sudo sed -i 's/^AcceptEnv LANG LC_\* COLORTERM NO_COLOR$/AcceptEnv LANG LC_* COLORTERM NO_COLOR TERM_PROGRAM TERM_PROGRAM_VERSION/' /etc/ssh/sshd_config && sudo systemctl restart ssh
```

(The service name may be `ssh` or `sshd` — check with `systemctl list-units | grep -i ssh`.)

## 3. Verify

Reconnect via SSH and confirm:

```bash
echo "TERM_PROGRAM=$TERM_PROGRAM"   # Should show "ghostty"
echo "COLORTERM=$COLORTERM"         # Should show "truecolor"
```

## How it works

- Local Ghostty wraps the `ssh` command with `SendEnv TERM_PROGRAM TERM_PROGRAM_VERSION`.
- The SSH server accepts those variables via `AcceptEnv`.
- pi-powerline-footer detects `TERM_PROGRAM=ghostty` → enables Nerd Fonts.
