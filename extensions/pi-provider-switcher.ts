import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const HOME = os.homedir();
const AGENT_DIR = path.join(HOME, ".pi", "agent");
const SETTINGS_LINK = path.join(AGENT_DIR, "settings.json");
const PROVIDERS = ["ollama-cloud", "opencode-go"] as const;

type Provider = (typeof PROVIDERS)[number];

function getTargetFile(provider: Provider): string {
  return path.join(AGENT_DIR, `settings-${provider}.json`);
}

function resolveSymlink(): Provider | null {
  try {
    const target = fs.readlinkSync(SETTINGS_LINK);
    for (const p of PROVIDERS) {
      if (target.endsWith(`settings-${p}.json`)) return p;
    }
    return null;
  } catch {
    return null;
  }
}

function getProviderModels(provider: Provider): string[] {
  // Read from the actual settings file to get enabledModels
  try {
    const raw = fs.readFileSync(getTargetFile(provider), "utf-8");
    const config = JSON.parse(raw);
    return config.enabledModels ?? [];
  } catch {
    return [];
  }
}

function switchSymlink(provider: Provider): { ok: boolean; error?: string } {
  const target = getTargetFile(provider);

  if (!fs.existsSync(target)) {
    return { ok: false, error: `Settings file not found: ${target}` };
  }

  try {
    // Remove existing link or file
    if (fs.existsSync(SETTINGS_LINK)) {
      fs.unlinkSync(SETTINGS_LINK);
    }
    fs.symlinkSync(target, SETTINGS_LINK);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("provider", {
    description: "Switch between ollama-cloud and opencode-go providers",
    getArgumentCompletions: (prefix: string) => {
      const items = PROVIDERS.map((p) => {
        const current = resolveSymlink();
        return { value: p, label: current === p ? `${p} (active)` : p };
      });
      if (!prefix) return items;
      return items.filter((i) => i.value.startsWith(prefix));
    },
    handler: async (args, ctx: ExtensionCommandContext) => {
      const provider = args?.trim().toLowerCase() as Provider;

      if (!provider || !PROVIDERS.includes(provider)) {
        const current = resolveSymlink();
        ctx.ui.notify(
          `Usage: /provider <${PROVIDERS.join("|")}>. Current: ${current ?? "unknown"}`,
          "warning",
        );
        return;
      }

      const current = resolveSymlink();
      if (current === provider) {
        ctx.ui.notify(`Already using ${provider}`, "info");
        return;
      }

      const result = switchSymlink(provider);
      if (!result.ok) {
        ctx.ui.notify(`Failed to switch: ${result.error}`, "error");
        return;
      }

      const models = getProviderModels(provider);
      const modelsPreview = models.length > 0 ? ` (models: ${models.join(", ")})` : "";

      ctx.ui.notify(
        `Switched to ${provider}${modelsPreview}. Reloading…`,
        "success",
      );

      // Reload to pick up new settings
      await ctx.reload();
    },
  });
}
