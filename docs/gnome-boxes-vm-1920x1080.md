# Guest resolution → 1920x1080 (GNOME Boxes / SPICE / virtio-gpu)

> One-click fix for a Debian VM running LXQt on X11 inside GNOME Boxes, where
> `lxqt-config-monitor` offers 2560x1440, 3840x2160, 5120x2160 etc. and the guest
> jumps to whatever size the Boxes window has.

## Reference system

Captured on the VM this was built in (2025-10-30) — replicate these details and
the fix behaves the same way.

| Item | Value |
| --- | --- |
| Host client | GNOME Boxes (SPICE) |
| Machine / firmware | `Standard PC (Q35 + ICH9, 2009)` (`/sys/class/dmi/id/product_name`), PCIe root ports `1b36:000c` |
| Guest OS | Debian GNU/Linux **13.7** (trixie) |
| Kernel | `6.12.113+deb13-amd64` |
| Desktop | **LXQt 2.1** — `lxqt-core 33.2`, `lxqt-session 2.1.1`, `lxqt-panel 2.1.4`, `lxqt-config 2.1.1`, `pcmanfm-qt 2.1.0` |
| Session | X11 — `XDG_SESSION_TYPE=x11`, `XDG_CURRENT_DESKTOP=LXQt` |
| X server | `xserver-xorg-core 2:21.1.16-1.3+deb13u4`, driver `modesetting` on KMS |
| GPU | `Virtio 1.0 GPU [1af4:1050]`, driver `virtio_gpu`, connector `Virtual-1`, EDID vendor string `QEMU Monitor` |
| Other virtio devices | net `1af4:1041`, block `1af4:1042`, console `1af4:1043`, balloon `1af4:1045`, xHCI `1b36:000d` |
| Guest agents | `spice-vdagent 0.22.1-4.1`, `spice-webdavd 3.0-9+b2`, `qemu-guest-agent 1:10.0.13+ds-0+deb13u1` |
| `xrandr` | `x11-xserver-utils 7.7+11` |
| Icons | `papirus-icon-theme 20250501-1` (theme `Papirus`) |
| Resources | 1 display / 4 vCPU / ~3.8 GiB RAM (sizes are arbitrary, not a requirement) |

How to confirm the same shape on a new VM:

```bash
systemd-detect-virt            # kvm
cat /etc/debian_version        # 13.x
lspci -nn | grep -i vga        # Red Hat, Inc. Virtio 1.0 GPU [1af4:1050]
ls /sys/class/drm/             # card0, card0-Virtual-1
echo $XDG_SESSION_TYPE $XDG_CURRENT_DESKTOP   # x11 LXQt
```

Recreating the VM: any Debian 13 install works as long as the desktop is LXQt
and the session is X11. GNOME Boxes already picks the Q35 machine and the
virtio-gpu / virtio-net / virtio-blk devices above — no tuning needed on the
host side. Only the guest packages from [Install](#install) are missing after a
plain Debian install.

## The problem

The display device is QEMU/KVM `virtio-gpu` (`1af4:1050`), connector `Virtual-1`,
driven by the Xorg `modesetting` driver on top of KMS.

- QEMU generates the EDID for that connector **on the fly** and re-generates it
  every time the SPICE client window changes size. The current window size
  becomes the EDID's detailed timing (= the guest's preferred mode), and the
  EDID also advertises a fixed set of large modes (up to 5120x2160).
- Because the mode list comes from KMS, `xrandr` and every monitor-settings GUI
  on top of it (`lxqt-config-monitor`, `arandr`) list those large modes too.
- `spice-vdagent` (the X11 session agent, autostarted from
  `/etc/xdg/autostart/spice-vdagent.desktop`) reacts to the client's monitors
  config by calling `XRRSetScreenSize` + `XRRSetCrtcConfig`, so the guest
  resolution follows the window — including sizes above 1920x1080.

So "maximum resolution" is dictated by the host window, not by the guest.

## The fix

Force the mode back to 1920x1080 with `xrandr`, triggered by a desktop icon.
The Boxes window is left alone: if the guest is smaller than the window, the
client just shows the smaller framebuffer.

This does **not** shorten the mode list (see the EDID appendix), and a Boxes
window resize will re-apply the window size — click the icon again.

## Install

### 1. Guest integration packages

Debian's installer does not pull the SPICE/QEMU guest agents in by default.
Without `spice-vdagent` there is no clipboard, no file transfer and no dynamic
resize at all; `x11-xserver-utils` is what provides `xrandr`.

```bash
sudo apt update
sudo apt install -y spice-vdagent spice-webdavd qemu-guest-agent x11-xserver-utils papirus-icon-theme
```

`spice-vdagent` autostarts from `/etc/xdg/autostart/spice-vdagent.desktop`;
`spice-vdagentd` runs as a system service (`systemctl is-active spice-vdagentd`).
No configuration is needed.

### 2. The one-click fix

Two files, both per-user, no root required. Copy-paste block:

```bash
mkdir -p ~/.local/bin

cat > ~/.local/bin/res-1920x1080.sh <<'EOF'
#!/bin/sh
# Forca o display do guest para 1920x1080 (virtio-gpu + SPICE / GNOME Boxes).
# Nao depende de nome fixo do conector: usa o primeiro output conectado.
set -eu

output=$(xrandr | awk '/ connected/ { print $1; exit }')
if [ -z "$output" ]; then
    echo "nenhum output conectado encontrado no xrandr" >&2
    exit 1
fi

exec xrandr --output "$output" --mode 1920x1080
EOF

chmod +x ~/.local/bin/res-1920x1080.sh

# desktop dir varies with locale: check with `xdg-user-dir DESKTOP`
desktop="$(xdg-user-dir DESKTOP)"
cat > "$desktop/res-1920x1080.desktop" <<EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=Resolução 1920x1080
Comment=Força o display do guest para 1920x1080
Exec=$HOME/.local/bin/res-1920x1080.sh
Icon=video-display
Terminal=false
Categories=System;
EOF

chmod +x "$desktop/res-1920x1080.desktop"
```

Result:

| Path | Purpose |
| --- | --- |
| `~/.local/bin/res-1920x1080.sh` | detects the connected output, runs `xrandr --output <out> --mode 1920x1080` |
| `~/Desktop/res-1920x1080.desktop` | desktop icon, `Terminal=false`, Papirus `video-display` icon |

## Verify

On this VM, after the first click: `xrandr --listactivemonitors` shows
`+*Virtual-1 1920/600x1080/340+0+0` and the framebuffer shrank with it, while the
Boxes window stayed fullscreen.

```bash
xrandr | head -2                # current 1920 x 1080
xrandr --verbose | head -1      # same, with the mode timings
```

Multiple refresh rates may exist for 1920x1080 (75 / 60 / 50 Hz here);
`--mode 1920x1080` picks the first one in the list. Pin one explicitly with
`--rate 60` inside the script if the default is wrong.

## Notes for the next VM

- Needs an X11 session (`XDG_SESSION_TYPE=x11`) — under Wayland use
  `wlr-randr` / the compositor's own tooling instead.
- The connector name is not hardcoded; `Virtual-1` is just what virtio-gpu
  exposes here (check with `xrandr`).
- Runs without root and survives logout (plain files in `$HOME`).

## Appendix — capping the mode list itself (optional)

To stop `lxqt-config-monitor` from listing modes above 1920x1080, the kernel has
to expose a different EDID:

```bash
# 1. build/place a 128-byte EDID 1.3 base block with 1920x1080@60 as the
#    preferred DTD, no extension blocks (validate with edid-decode)
sudo install -d -m 755 /lib/firmware/edid
sudo install -m 644 ~/1920x1080.bin /lib/firmware/edid/vm-1920x1080.bin

# 2. override the connector's EDID at boot
sudo tee /etc/default/grub.d/10-vm-max-resolution.cfg >/dev/null <<'EOF'
GRUB_CMDLINE_LINUX_DEFAULT="$GRUB_CMDLINE_LINUX_DEFAULT drm.edid_firmware=Virtual-1:edid/vm-1920x1080.bin"
EOF
sudo update-grub
```

Reboot to apply. Revert: delete `/etc/default/grub.d/10-vm-max-resolution.cfg`
and `/lib/firmware/edid/vm-1920x1080.bin`, then `sudo update-grub`.

Caveat: this caps the advertised mode list, but `spice-vdagent` can still create
an ad-hoc mode with `XRRCreateMode` when the Boxes window grows — the guest is
then above 1080p again until something resets it. Disabling the user agent
(hide `/etc/xdg/autostart/spice-vdagent.desktop` with `Hidden=true` in
`~/.config/autostart/`) makes the cap hard, at the cost of shared clipboard and
file transfer with the host.
