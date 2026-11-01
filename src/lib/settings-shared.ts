import { z } from "zod";

export const MAX_IMAGES = 12;
export const MAX_DECORATIONS = 20;
export const MAX_SECTIONS = 30;
export const MAX_BLOCKS = 60;
export const EFFECTS = ["none", "float", "wiggle", "pulse", "spin", "bounce", "swing", "shake", "tada"] as const;
export const SHAPES = ["original", "rounded", "circle", "square", "heart", "star", "hexagon"] as const;
export const KINDS = ["text", "graffiti", "emoji", "art", "image"] as const;
export const BLOCK_TYPES = ["badge", "heading", "text", "script", "button", "image", "gallery", "emoji", "card", "step", "countdown", "rsvp", "divider", "spacer", "map"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];
export const SECTION_EFFECTS = ["none", "balloons", "graffiti", "confetti", "hearts", "stars", "snow", "rain", "bubbles", "fireflies"] as const;
export const EVENT_TYPES = ["general", "birthday", "anniversary", "wedding", "christmas", "new-year", "baby-shower", "graduation", "housewarming", "corporate"] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export const BGS = ["white", "cream", "brand", "ink", "plain"] as const;

export const DEFAULT_PATH = { on: false, x: 80, y: 20, curve: 0, duration: 6, delay: 0 };
const pathSchema = z.object({
  on: z.boolean(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  curve: z.number().min(-100).max(100),
  duration: z.number().min(1).max(30),
  delay: z.number().min(0).max(20),
});

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
/** font pairings (body + headings) for the whole site; the CSS for each lives in globals.css */
export const FONT_STYLES = ["playful", "modern", "elegant", "bold"] as const;
export type FontStyle = (typeof FONT_STYLES)[number];
const DEFAULT_THEME = { mode: "light" as const, accent: "#18181b", design: "bento" as const, font: "playful" as FontStyle };
const text = (max = 200) => z.string().trim().max(max);
const sizes = z.enum(["sm", "md", "lg", "xl"]);
const upload = z.string().regex(/^\/api\/img\/[\w.-]+$/);

/** Every piece of text on the RSVP form that the editor can change: key, editor label, default text, and which form piece it belongs to ("done" = the thank-you message). */
export const RSVP_FIELDS = [
  { key: "nameLabel", label: "Name label", def: "Full name", group: "name" },
  { key: "namePlaceholder", label: "Name hint", def: "e.g. Uncle Alex & Family", group: "name" },
  { key: "emailLabel", label: "Email label", def: "Email", group: "email" },
  { key: "emailPlaceholder", label: "Email hint", def: "For your confirmation", group: "email" },
  { key: "attendLabel", label: "Question", def: "Will you attend?", group: "attend" },
  { key: "yesTitle", label: "Yes answer", def: "Count me in", group: "attend" },
  { key: "yesHint", label: "Yes answer — small text", def: "I'll be there", group: "attend" },
  { key: "noTitle", label: "No answer", def: "Regretfully no", group: "attend" },
  { key: "noHint", label: "No answer — small text", def: "I can't make it", group: "attend" },
  { key: "whoLabel", label: "Guests heading", def: "Who's coming?", group: "guests" },
  { key: "guestOne", label: "Word for 1 guest", def: "guest", group: "guests" },
  { key: "guestMany", label: "Word for several guests", def: "guests", group: "guests" },
  { key: "adultsLabel", label: "Adults label", def: "Adults", group: "guests" },
  { key: "adultsHint", label: "Adults small text", def: "Including you", group: "guests" },
  { key: "kidsLabel", label: "Kids label", def: "Kids", group: "guests" },
  { key: "kidsHint", label: "Kids small text", def: "Under 12", group: "guests" },
  { key: "notesLabel", label: "Note label", def: "Notes / dietary needs", group: "notes" },
  { key: "notesPlaceholder", label: "Note hint", def: "Leave a note for the hosts…", group: "notes" },
  { key: "submitYes", label: "Button (attending)", def: "Send my RSVP", group: "submit" },
  { key: "submitNo", label: "Button (not attending)", def: "Send my reply", group: "submit" },
  { key: "sending", label: "Button while sending", def: "Sending…", group: "submit" },
  { key: "privacy", label: "Privacy line", def: "We only use your email to send your confirmation.", group: "privacy" },
  { key: "doneYesTitle", label: "Title (attending)", def: "You're on the list!", group: "done" },
  { key: "doneYesText", label: "Text (attending)", def: "We're so glad you can make it. Your confirmation is on its way — check spam if you don't see it.", group: "done", long: true },
  { key: "doneNoTitle", label: "Title (not attending)", def: "Thanks for letting us know", group: "done" },
  { key: "doneNoText", label: "Text (not attending)", def: "We'll miss you. Thank you for replying.", group: "done", long: true },
] as const;
export const RSVP_DEFAULTS: Record<string, string> = Object.fromEntries(RSVP_FIELDS.map((f) => [f.key, f.def]));

/** The pieces of the RSVP form, in their default order. `required` pieces can't be hidden: the form needs them to work. */
export const RSVP_PART_KEYS = ["name", "email", "attend", "guests", "notes", "submit", "privacy"] as const;
export type RsvpPartKey = (typeof RSVP_PART_KEYS)[number];
export const RSVP_PART_META: Record<RsvpPartKey, { label: string; required: boolean; width: "half" | "full" }> = {
  name: { label: "Full name", required: true, width: "half" },
  email: { label: "Email", required: true, width: "half" },
  attend: { label: "Will you attend?", required: false, width: "full" },
  guests: { label: "Guests (adults & kids)", required: false, width: "full" },
  notes: { label: "Note box", required: false, width: "full" },
  submit: { label: "Send button", required: true, width: "full" },
  privacy: { label: "Privacy line", required: false, width: "full" },
};
const rsvpPart = z.object({
  key: z.enum(RSVP_PART_KEYS),
  hidden: z.boolean().default(false),
  size: sizes.default("md"),
  align: z.enum(["left", "center", "right"]).default("left"),
  width: z.enum(["half", "full", "fit"]).default("full"),
});
export type RsvpPart = z.infer<typeof rsvpPart>;
/** The stored pieces in their stored order, with any missing piece added back at the end with its defaults. */
export function resolveRsvpParts(stored?: RsvpPart[]): RsvpPart[] {
  const seen = new Set<RsvpPartKey>();
  const out: RsvpPart[] = [];
  for (const p of stored ?? []) {
    if (seen.has(p.key)) continue;
    seen.add(p.key);
    out.push({ ...p, hidden: RSVP_PART_META[p.key].required ? false : p.hidden });
  }
  for (const key of RSVP_PART_KEYS) if (!seen.has(key)) out.push({ key, hidden: false, size: "md", align: key === "privacy" ? "center" : "left", width: RSVP_PART_META[key].width });
  return out;
}

const block = z
  .object({
    id: text(40),
    type: z.enum(BLOCK_TYPES),
    text: text(400).default(""),
    text2: text(400).default(""),
    text3: text(400).default(""),
    url: z.string().trim().max(500).default(""),
    icon: text(16).default(""),
    size: sizes.default("md"),
    tone: z.enum(["ink", "brand", "soft", "white"]).default("ink"),
    caps: z.boolean().default(false),
    images: z.array(z.object({ url: upload, alt: text() })).max(MAX_IMAGES).default([]),
    /** RSVP form: text overrides by key (see RSVP_FIELDS); a missing or empty key uses the default */
    labels: z.record(z.string(), text(300)).default({}),
    /** RSVP form: order, visibility, size, alignment and width of each piece (empty = the standard layout) */
    parts: z.array(rsvpPart).max(10).default([]),
  })
  .superRefine((b, ctx) => {
    const link = b.url === "" || b.url.startsWith("#") || /^https?:\/\//i.test(b.url);
    const img = b.url === "" || upload.safeParse(b.url).success || /^https?:\/\//i.test(b.url);
    if ((b.type === "button" || b.type === "card") && !link) ctx.addIssue({ code: "custom", path: ["url"], message: "Link must be #section or http(s)://" });
    if (b.type === "map" && b.text3 !== "") {
      const m = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(b.text3);
      if (!m || Math.abs(+m[1]) > 90 || Math.abs(+m[2]) > 180) ctx.addIssue({ code: "custom", path: ["text3"], message: "Location must be latitude,longitude" });
    }
    if ((b.type === "image" || b.type === "map") && !img) ctx.addIssue({ code: "custom", path: ["url"], message: "Bad image address" });
  });

const section = z.object({
  id: text(40),
  name: text(60),
  bg: z.enum(BGS),
  /** optional custom background colour (overrides `bg`); "" = use the preset */
  bgColor: z.union([hex, z.literal("")]).default(""),
  hidden: z.boolean(),
  effect: z.enum(SECTION_EFFECTS).default("none"),
  card: z.boolean(),
  wide: z.boolean(),
  pad: z.enum(["sm", "md", "lg"]),
  blocks: z.array(block).max(MAX_BLOCKS),
});

export const settingsSchema = z.object({
  name: text(60),
  /** one-time page upgrades already applied (so a section you delete is not added back) */
  upgrades: z.array(text(40)).max(20).default([]),
  eventType: z.enum(EVENT_TYPES).default("general"),
  theme: z.object({ mode: z.enum(["light", "dark"]), accent: text(40).regex(/^([a-z]+|#[0-9a-fA-F]{6})$/), design: z.enum(["bento", "clay"]), font: z.enum(FONT_STYLES).default("playful") }),
  sections: z.array(section).max(MAX_SECTIONS),
  decorations: z
    .array(
      z.object({
        id: text(40),
        section: text(40),
        kind: z.enum(KINDS),
        content: text(120),
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
        size: z.number().min(4).max(5000),
        rotate: z.number().min(-180).max(180),
        color: hex,
        effect: z.enum(EFFECTS),
        flip: z.boolean().default(false),
        /** stretch on each axis (1 = natural) */
        sx: z.number().min(0.02).max(200).default(1),
        sy: z.number().min(0.02).max(200).default(1),
        /** picture stickers: how the image is cropped */
        shape: z.enum(SHAPES).default("original"),
        /** 5–100 % */
        opacity: z.number().min(5).max(100).default(100),
        path: pathSchema.default(DEFAULT_PATH),
      })
        .refine((d) => d.kind !== "image" || upload.safeParse(d.content).success, { path: ["content"], message: "An image sticker needs an uploaded picture" }),
    )
    .max(MAX_DECORATIONS),
});

export type Settings = z.infer<typeof settingsSchema>;
export type Section = Settings["sections"][number];
export type Block = Section["blocks"][number];
export type Decoration = Settings["decorations"][number];

/** Five points along the sticker's path (a quadratic curve from its position to the end point), in % of the section. */
export function decorPath(d: { x: number; y: number; path: { x: number; y: number; curve: number } }): [number, number][] {
  const { x, y, path } = d;
  const dx = path.x - x;
  const dy = path.y - y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (x + path.x) / 2 + (-dy / len) * path.curve;
  const cy = (y + path.y) / 2 + (dx / len) * path.curve;
  return [0, 0.25, 0.5, 0.75, 1].map((t) => [
    (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * path.x,
    (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * path.y,
  ]);
}

/** Replace {name} in every text with the event name. */
export function applyName(s: Settings): Settings {
  const name = s.name || "[Event name]";
  const walk = (v: unknown): unknown =>
    typeof v === "string"
      ? v.replace(/\{name\}/gi, name)
      : Array.isArray(v)
        ? v.map(walk)
        : v && typeof v === "object"
          ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]))
          : v;
  const out = walk(s) as Settings;
  return { ...out, name: s.name };
}

export function newBlock(type: BlockType, id: string): Block {
  const base: Block = { id, type, text: "", text2: "", text3: "", url: "", icon: "", size: "md", tone: "ink", caps: false, images: [], labels: {}, parts: [] };
  switch (type) {
    case "badge": return { ...base, text: "New badge" };
    case "heading": return { ...base, text: "New heading", size: "lg" };
    case "text": return { ...base, text: "Write something here…", tone: "soft" };
    case "script": return { ...base, text: "★ Handwritten ★" };
    case "button": return { ...base, text: "Click me", url: "#rsvp", text2: "glow" };
    case "image": return base;
    case "gallery": return base;
    case "emoji": return { ...base, text: "🎈", size: "xl" };
    case "card": return { ...base, icon: "star", text: "Title", text2: "Detail", text3: "More detail" };
    case "step": return { ...base, text: "5:00 PM", text2: "New step", text3: "Description" };
    case "countdown": return { ...base, text: "Countdown", text2: "2026-12-31T12:00", tone: "white" };
    case "rsvp": return { ...base, text: "RSVP Attendance", text2: "Please confirm your attendance!" };
    // map: text = title, text2 = address searched, text3 = "lat,lng", icon = zoom, size = height, url = optional avatar for the pin
    case "map": return { ...base, text: "Find us", icon: "14" };
    case "divider": return base;
    case "spacer": return base;
  }
}

export function imageUrls(s: Settings): string[] {
  return [
    ...s.sections.flatMap((sec) =>
      sec.blocks.flatMap((b) => [...b.images.map((i) => i.url), ...((b.type === "image" || b.type === "map") && b.url.startsWith("/api/img/") ? [b.url] : [])]),
    ),
    ...s.decorations.filter((d) => d.kind === "image").map((d) => d.content),
  ];
}

/* ------------------------------------------------------------------ */
/* Defaults, plus conversion of the earlier fixed-layout settings      */
/* ------------------------------------------------------------------ */

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Earlier versions stored brand/ink/cream/line colours; the main colour becomes the accent. */
export function normalizeTheme(t: any): Settings["theme"] {
  return {
    mode: t?.mode === "dark" ? "dark" : "light",
    accent: typeof t?.accent === "string" ? t.accent : typeof t?.brand === "string" ? t.brand : DEFAULT_THEME.accent,
    design: t?.design === "clay" ? "clay" : "bento",
    font: FONT_STYLES.includes(t?.font) ? t.font : "playful",
  };
}

export function legacyDefaults(): any {
  const [date, time] = (process.env.EVENT_DATE ?? "Saturday, 31 December 2026 · 6:00 PM - 9:00 PM").split(" · ");
  return {
    theme: DEFAULT_THEME,
    hero: {
      name: process.env.EVENT_NAME ?? "",
      badge: "You're invited",
      line1: "Join us for",
      line2: "{name}",
      tagline: "★ Save the date ★",
      subtitle: "We'd love to celebrate with you. Please let us know if you can make it.",
      button: "RSVP Now",
    },
    countdown: { enabled: true, label: "Countdown to the event", target: process.env.EVENT_ISO ?? "2026-12-31T18:00" },
    event: {
      title: "Event Details",
      subtitle: "Everything you need to know before you arrive.",
      date,
      time: time ?? "",
      place: process.env.EVENT_PLACE ?? "Venue name",
      address: process.env.EVENT_ADDRESS ?? "123 Example Street, City",
      mapsUrl: process.env.EVENT_MAPS_URL ?? "",
      dress: process.env.EVENT_DRESS ?? "Smart casual",
      dressNote: process.env.EVENT_DRESS_NOTE ?? "Dress comfortably",
    },
    agenda: {
      enabled: true,
      badge: "Schedule",
      title: "Event Schedule",
      items: [
        { time: "6:00 PM", title: "Arrival & welcome", text: "Drinks and a warm welcome as guests arrive." },
        { time: "7:00 PM", title: "Main event", text: "The highlight of the evening." },
        { time: "8:00 PM", title: "Dinner & celebration", text: "Food, music and time to mingle." },
      ],
    },
    gallery: { enabled: false, title: "Highlights", subtitle: "A few moments to look forward to.", images: [] },
    rsvp: { title: "RSVP", subtitle: "Please let us know if you can join us." },
    footer: { title: "{name}", text: "We can't wait to see you there!" },
    decorations: [
      { id: "celebrate", section: "hero", kind: "text", content: "Celebrate!", x: 10, y: 9, size: 40, rotate: -12, color: "#a1a1aa", effect: "float" },
      { id: "joinus", section: "hero", kind: "text", content: "Join us!", x: 90, y: 11, size: 40, rotate: 12, color: "#fcd34d", effect: "float" },
    ],
  };
}

/** The "Find us" section. The location is a starting point (Cebu City, Philippines) until the host searches for the real address. */
function mapSection(b: (type: BlockType, p?: Partial<Block>) => Block, sec: (id: string, name: string, p: Partial<Section>, blocks: Block[]) => Section, place: string, address: string): Section {
  return sec("map", "Map", { bg: "cream" }, [
    b("heading", { text: "Find us" }),
    b("text", { text: "Directions and parking tips for getting here.", size: "lg", tone: "soft" }),
    b("map", { text: place, text2: address, text3: "10.315700,123.885400" }),
  ]);
}

/** One-time upgrade for pages saved before the map existed: add a visible map section after the event details. */
export function withMapSection(s: Settings): Settings {
  if (s.upgrades.includes("map-section")) return s;
  const upgraded = { ...s, upgrades: [...s.upgrades, "map-section"] };
  if (s.sections.some((x) => x.blocks.some((b) => b.type === "map"))) return upgraded; // they already have one
  const usedBlocks = s.sections.flatMap((x) => x.blocks.map((b) => b.id));
  const next = (prefix: string, used: string[]) => {
    let n = used.length + 1;
    while (used.includes(`${prefix}${n}`)) n++;
    used.push(`${prefix}${n}`);
    return `${prefix}${n}`;
  };
  const b = (type: BlockType, p: Partial<Block> = {}): Block => ({ ...newBlock(type, next("b", usedBlocks)), ...p });
  const usedSections = s.sections.map((x) => x.id);
  const sec = (id: string, name: string, p: Partial<Section>, blocks: Block[]): Section => ({
    id: usedSections.includes(id) ? next("s", usedSections) : id,
    name, bg: "white", bgColor: "", hidden: false, effect: "none", card: false, wide: false, pad: "lg", ...p, blocks,
  });
  const event = s.sections.find((x) => x.id === "event");
  const card = event?.blocks.filter((c) => c.type === "card")[1]; // the "Where" card
  const section = mapSection(b, sec, card?.text2 || "Venue", card?.text3 || "");
  const at = event ? s.sections.indexOf(event) + 1 : s.sections.length;
  const sections = [...s.sections];
  sections.splice(at, 0, section);
  return { ...upgraded, sections };
}

export function fromLegacy(l: any): Settings {
  let n = 0;
  const b = (type: BlockType, p: Partial<Block> = {}): Block => ({ ...newBlock(type, `b${++n}`), ...p });
  const sec = (id: string, name: string, p: Partial<Section>, blocks: Block[]): Section => ({
    id, name, bg: "white", bgColor: "", hidden: false, effect: "none", card: false, wide: false, pad: "lg", ...p, blocks,
  });
  const e = l.event;
  const maps = e.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.place} ${e.address}`)}`;
  return {
    name: l.hero.name ?? "",
    eventType: "general",
    upgrades: ["map-section"],
    theme: normalizeTheme(l.theme),
    decorations: (l.decorations ?? []).map((d: any) => ({ ...d, section: d.section ?? "hero" })),
    sections: [
      sec("hero", "Hero", { card: true }, [
        b("badge", { text: l.hero.badge }),
        b("heading", { text: l.hero.line1, size: "xl", caps: true }),
        b("heading", { text: l.hero.line2, size: "xl", caps: true, tone: "brand" }),
        b("script", { text: l.hero.tagline }),
        b("text", { text: l.hero.subtitle, size: "lg", tone: "soft" }),
        b("button", { text: l.hero.button, url: "#rsvp", text2: "glow" }),
      ]),
      sec("countdown", "Countdown", { bg: "brand", pad: "md", hidden: !l.countdown.enabled }, [
        b("countdown", { text: l.countdown.label, text2: l.countdown.target, tone: "white" }),
      ]),
      sec("event", "Event details", {}, [
        b("heading", { text: e.title }),
        b("text", { text: e.subtitle, size: "lg", tone: "soft" }),
        b("card", { icon: "calendar-days", text: "When", text2: e.date, text3: e.time }),
        b("card", { icon: "map-pin", text: "Where", text2: e.place, text3: e.address, url: maps }),
        b("card", { icon: "shirt", text: "Dress Code", text2: e.dress, text3: e.dressNote }),
      ]),
      mapSection(b, sec, e.place, e.address),
      sec("agenda", "Agenda", { bg: "cream", hidden: !l.agenda.enabled }, [
        b("badge", { text: l.agenda.badge }),
        b("heading", { text: l.agenda.title }),
        ...l.agenda.items.map((i: any) => b("step", { text: i.time, text2: i.title, text3: i.text })),
      ]),
      sec("gallery", "Gallery", { wide: true, hidden: !l.gallery.enabled }, [
        b("heading", { text: l.gallery.title }),
        b("text", { text: l.gallery.subtitle, size: "lg", tone: "soft" }),
        b("gallery", { images: l.gallery.images }),
      ]),
      sec("rsvp", "RSVP", { bg: "cream" }, [b("rsvp", { text: l.rsvp.title, text2: l.rsvp.subtitle })]),
      sec("footer", "Footer", { bg: "ink", card: true, pad: "md" }, [
        b("heading", { text: l.footer.title, size: "sm", caps: true, tone: "white" }),
        b("text", { text: l.footer.text, tone: "white" }),
      ]),
    ],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function defaultSettings(): Settings {
  return fromLegacy(legacyDefaults());
}
