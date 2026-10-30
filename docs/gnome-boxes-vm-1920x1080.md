# Guest resolution → 1920x1080 (GNOME Boxes / SPICE / virtio-gpu)

> One-click fix for a Debian VM running LXQt on X11 inside GNOME Boxes, where
> `lxqt-config-monitor` offers 2560x1440, 3840x2160, 5120x2160 etc. and the guest
> jumps to whatever size the Boxes window has.

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
