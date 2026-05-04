import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const HOME = os.homedir();
const AGENT_DIR = path.join(HOME, ".pi", "agent");
const SETTINGS_LINK = path.join(AGENT_DIR, "settings.json");
const PROVIDERS = ["ollama-cloud", "opencode-go"] as const;
const CONFIG_FILENAMES = PROVIDERS.map((p) => `settings-${p}.json`);

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
    return {
      ok: false,
      error: `Settings file not found: ${target}\nRun /provider install <config-repo-path> first.`,
    };
  }

  try {
    if (fs.existsSync(SETTINGS_LINK)) {
      fs.unlinkSync(SETTINGS_LINK);
    }
    fs.symlinkSync(target, SETTINGS_LINK);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

interface InstallResult {
  ok: boolean;
  copied: string[];
  missing: string[];
  error?: string;
}

function installFrom(sourceDir: string): InstallResult {
  const copied: string[] = [];
  const missing: string[] = [];

  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    return { ok: false, copied: [], missing: CONFIG_FILENAMES, error: `Source directory not found: ${sourceDir}` };
  }

  for (const filename of CONFIG_FILENAMES) {
    const src = path.join(sourceDir, filename);
    const dst = path.join(AGENT_DIR, filename);

    if (!fs.existsSync(src)) {
      missing.push(filename);
      continue;
    }

    try {
      fs.copyFileSync(src, dst);
      copied.push(filename);
    } catch (err: any) {
      return { ok: false, copied, missing, error: `Failed to copy ${filename}: ${err.message}` };
    }
  }

  if (copied.length === 0) {
    return { ok: false, copied: [], missing: CONFIG_FILENAMES, error: "No settings files found to copy" };
  }

  return { ok: true, copied, missing };
}

function findConfigRepo(cwd: string): string | null {
  const candidates = [
    path.join(HOME, "dev", "pi-dev-config"),
    path.join(HOME, ".pi", "agent", "config"),
    cwd,
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      const hasAny = CONFIG_FILENAMES.some((f) => fs.existsSync(path.join(dir, f)));
      if (hasAny) return dir;
    }
  }

  return null;
}

function areFilesInstalled(): boolean {
  return CONFIG_FILENAMES.every((f) => fs.existsSync(path.join(AGENT_DIR, f)));
}

function createInitialSymlink(provider: Provider): void {
  if (fs.existsSync(SETTINGS_LINK)) return;
  const target = getTargetFile(provider);
  if (fs.existsSync(target)) {
    fs.symlinkSync(target, SETTINGS_LINK);
  }
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("provider", {
    description: "Switch between ollama-cloud and opencode-go providers, or install settings files",
    getArgumentCompletions: (prefix: string) => {
      const lower = prefix.toLowerCase();
      const items: { value: string; label: string }[] = [];

      // "install" as a subcommand
      if ("install".startsWith(lower)) {
        items.push({ value: "install", label: "install — copy settings files to ~/.pi/agent/" });
      }

      // Provider names
      for (const p of PROVIDERS) {
        if (p.startsWith(lower)) {
          const current = resolveSymlink();
          items.push({ value: p, label: current === p ? `${p} (active)` : p });
        }
      }

      return items.length > 0 ? items : null;
    },
    handler: async (args, ctx: ExtensionCommandContext) => {
      const raw = args?.trim() ?? "";

      // --- /provider install [path] ---
      if (raw.toLowerCase().startsWith("install")) {
        const rest = raw.slice("install".length).trim();
        const sourceDir = rest || findConfigRepo(ctx.cwd) || "";

        if (!sourceDir) {
          ctx.ui.notify(
            "No config repo found. Usage: /provider install <path-to-pi-dev-config>",
            "warning",
          );
          return;
        }

        const result = installFrom(sourceDir);

        if (!result.ok) {
          ctx.ui.notify(`Install failed: ${result.error}`, "error");
          return;
        }

        // Create initial symlink if missing
        createInitialSymlink("ollama-cloud");

        const parts: string[] = [];
        if (result.copied.length > 0) parts.push(`Copied: ${result.copied.join(", ")}`);
        if (result.missing.length > 0) parts.push(`Not found: ${result.missing.join(", ")}`);

        ctx.ui.notify(`Installed from ${sourceDir}. ${parts.join(". ")}`, "success");
        return;
      }

      // --- /provider <provider-name> ---
      const provider = raw.toLowerCase() as Provider;

      if (!provider || !PROVIDERS.includes(provider)) {
        const current = resolveSymlink();
        ctx.ui.notify(
          `Usage: /provider <${PROVIDERS.join("|")}> | /provider install [path]. Current: ${current ?? "unknown"}`,
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

      await ctx.reload();
    },
  });
}
