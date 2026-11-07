/** The free illustration sets people can import. Only sets with a permissive licence (no attribution or share-alike needed) are listed. They are served by the open Iconify API and copied into our own storage on import. */
export const ILLUSTRATION_SETS = [
  { prefix: "noto", label: "Noto", name: "Noto Emoji", license: "Apache 2.0" },
  { prefix: "fluent-emoji-flat", label: "Fluent flat", name: "Fluent Emoji Flat", license: "MIT" },
  { prefix: "noto-v1", label: "Noto classic", name: "Noto Emoji (v1)", license: "Apache 2.0" },
  { prefix: "flat-color-icons", label: "Flat icons", name: "Flat Color Icons", license: "MIT" },
  { prefix: "iconito", label: "Food", name: "Iconito Food", license: "MIT" },
  { prefix: "meteocons", label: "Weather", name: "Meteocons", license: "MIT" },
] as const;

export const ILLUSTRATION_PREFIXES: string[] = ILLUSTRATION_SETS.map((s) => s.prefix);
export const ICONIFY = "https://api.iconify.design";

/** "noto:racing-car" → its parts, or null when it is not an allowed illustration */
export function parseIllustrationId(id: unknown): { prefix: string; name: string } | null {
  if (typeof id !== "string") return null;
  const m = /^([a-z0-9-]+):([a-z0-9-]{1,80})$/.exec(id);
  return m && ILLUSTRATION_PREFIXES.includes(m[1]) ? { prefix: m[1], name: m[2] } : null;
}

/** Ideas to start from, shown before anyone types */
export const ILLUSTRATION_IDEAS = ["car", "rex", "sauropod", "rocket", "cake", "balloon", "heart", "crown", "flower", "gift", "baby", "tree", "star", "party", "unicorn", "castle", "fish", "bear", "lion", "princess", "santa", "trophy", "rainbow", "confetti"];
