import { promises as fs } from "fs";
import path from "path";
import { cacheTag } from "next/cache";
import { defaultSettings, fromLegacy, legacyDefaults, normalizeTheme, settingsSchema, withMapSection, type Settings } from "./settings-shared";

// DATA_DIR can point the app at another folder (handy for trying things without touching real settings)
export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const FILE = path.join(DATA_DIR, "settings.json");

export { settingsSchema, type Settings };

/** Uncached read (admin panel, save). Also upgrades files saved by the earlier fixed-layout editor. */
export async function readSettings(): Promise<Settings> {
  const d = defaultSettings();
  try {
    const stored = JSON.parse(await fs.readFile(FILE, "utf8"));
    let candidate: unknown;
    if (Array.isArray(stored.sections)) {
      // `upgrades` must come from the saved file only — the defaults already include every upgrade
      candidate = { ...d, ...stored, upgrades: stored.upgrades ?? [], theme: normalizeTheme(stored.theme) };
    } else {
      const ld = legacyDefaults();
      const merged = Object.fromEntries(
        Object.keys(ld).map((k) => [k, Array.isArray(ld[k]) ? (stored[k] ?? ld[k]) : { ...ld[k], ...(stored[k] ?? {}) }]),
      );
      candidate = fromLegacy({ ...merged, theme: stored.theme });
    }
    const parsed = settingsSchema.safeParse(candidate);
    return parsed.success ? withMapSection(parsed.data) : d;
  } catch {
    return d;
  }
}

export async function writeSettings(s: Settings) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(s, null, 2));
  await fs.rename(tmp, FILE);
}

/** Cached read for the public page; invalidated by the "settings" tag on save. */
export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag("settings");
  return readSettings();
}
