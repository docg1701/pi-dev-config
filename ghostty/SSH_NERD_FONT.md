# SSH Nerd Font Setup (Ghostty → VPS)

Para os ícones do pi-powerline-footer funcionarem via SSH com Ghostty.

## Pré-requisito

O terminal local (Ghostty) precisa ter uma Nerd Font configurada como `font-family`.

## 1. Máquina local (Ghostty)

Adiciona `ssh-env` no `shell-integration-features` do config do Ghostty:

**Arquivo:** `~/.config/ghostty/config` (ou `config.ghostty`)

```ini
shell-integration-features = cursor, path, title, ssh-env, ssh-terminfo, sudo
```

Reinicia o Ghostty completamente (fecha todas as janelas).

## 2. VPS (servidor SSH)

Adiciona `TERM_PROGRAM TERM_PROGRAM_VERSION` no `AcceptEnv` do sshd:

```bash
sudo sed -i 's/^AcceptEnv LANG LC_\* COLORTERM NO_COLOR$/AcceptEnv LANG LC_* COLORTERM NO_COLOR TERM_PROGRAM TERM_PROGRAM_VERSION/' /etc/ssh/sshd_config && sudo systemctl restart ssh
```

(O nome do serviço pode ser `ssh` ou `sshd` — confere com `systemctl list-units | grep -i ssh`)

## 3. Verificar

Reconecta o SSH e confirma:

```bash
echo "TERM_PROGRAM=$TERM_PROGRAM"   # Deve mostrar "ghostty"
echo "COLORTERM=$COLORTERM"         # Deve mostrar "truecolor"
```

## Como funciona

- Ghostty local wrappa o comando `ssh` com `SendEnv TERM_PROGRAM TERM_PROGRAM_VERSION`
- Servidor SSH aceita essas variáveis via `AcceptEnv`
- pi-powerline-footer detecta `TERM_PROGRAM=ghostty` → ativa Nerd Fonts
