"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Check, ArrowDown, ArrowUp, EyeOff, Frame, Loader2, Search, FlipHorizontal2, GripVertical, ImagePlus, MoreHorizontal, PartyPopper, Plus, Type, RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { Badge, Button, DropdownMenu, DropdownMenuItem, Popover, Tooltip } from "@/components/ui";
import { BORDER_OPTIONS, BorderThumb } from "@/components/BorderArt";
import ArtSvg, { ART_GROUPS } from "@/components/ArtSvg";
import { elementMeta, GROUPS, TEXT_PRESETS, type ElementType } from "@/components/palette";
import type { Block, BlockType, Decoration, Section } from "@/lib/settings-shared";
import { ICONIFY, ILLUSTRATION_IDEAS, ILLUSTRATION_SETS } from "@/lib/illustrations";
import { ILLUSTRATION_PACKS, PACK_FILES, packLabel } from "@/lib/illustration-packs";

export type StickerOp = "flip" | "rotL" | "rotR" | "smaller" | "bigger";
export type StickerState = { flip: boolean; rotate: number; size: number };

export type EditActions = {
  adjustSticker: (op: StickerOp) => void;
  /** free-position a block (x in % of the section width, y in px) */
  placeBlock: (id: string, x: number, y: number) => void;
  /** put several elements of one section together in a row or a column ("none" takes them out of their group) */
  groupBlocks: (ids: string[], dir: "row" | "col" | "none") => void;
  moveBlock: (id: string, toSection: string, index: number) => void;
  addBlock: (type: BlockType, toSection: string, index: number) => void;
  removeBlock: (id: string) => void;
  moveSection: (id: string, index: number) => void;
  removeSection: (id: string) => void;
  addSection: (index: number) => void;
  addSticker: (sectionId: string, x: number, y: number, preset?: Partial<Decoration>) => void;
  selectSection: (id: string) => void;
  editSection: (id: string) => void;
  moveSectionBy: (id: string, delta: -1 | 1) => void;
  toggleHidden: (id: string) => void;
  setBorder: (id: string, patch: Partial<Section["border"]>) => void;
  duplicateSection: (id: string) => void;
  /** upload a picture of your own and drop it into a section as a sticker */
  uploadSticker: (sectionId: string, files: FileList | null) => Promise<void>;
  /** copy a free illustration (e.g. "noto:racing-car") into storage and drop it into a section as a sticker */
  importSticker: (sectionId: string, id: string) => Promise<void>;
};

type Payload = { kind: "block"; id: string } | { kind: "new"; type: BlockType } | { kind: "section"; id: string } | { kind: "sticker"; preset?: Partial<Decoration> };

/** What is currently being dragged (dataTransfer can't be read during dragover). */
// blocks that hug their content so the hover highlight is tight; the rest span the full width
const HUG = new Set(["badge", "heading", "text", "script", "button", "emoji", "illustration"]);

export const drag: { current: Payload | null } = { current: null };

/** Popover content: illustrated borders. Pick a side (or All), then a design; the size applies to every side. */
export function BorderPicker({ border, onChange }: { border: Section["border"]; onChange: (patch: Partial<Section["border"]>) => void }) {
  const sides = ["all", "top", "bottom", "left", "right"] as const;
  const [side, setSide] = useState<(typeof sides)[number]>("all");
  const current = side === "all" ? (border.top === border.bottom && border.top === border.left && border.top === border.right ? border.top : null) : border[side];
  const pick = (id: Section["border"]["top"]) => onChange(side === "all" ? { top: id, bottom: id, left: id, right: id } : { [side]: id });
  return (
    <div className="grid w-72 gap-3">
      <div className="flex flex-wrap gap-1">
        {sides.map((x) => (
          <button key={x} type="button" onClick={() => setSide(x)} className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${side === x ? "bg-fg text-surface" : "bg-surface-muted text-soft hover:text-fg"}`}>
            {x}
          </button>
        ))}
      </div>
      <div className="grid max-h-60 grid-cols-3 gap-2 overflow-y-auto p-0.5">
        {BORDER_OPTIONS.map(([id, label]) => (
          <button key={id} type="button" title={label} aria-label={label} aria-pressed={current === id} onClick={() => pick(id)} className={`grid gap-1 rounded-xl border p-1.5 text-center transition-colors hover:border-fg ${current === id ? "border-fg bg-surface-muted" : "border-border"}`}>
            <span className="flex h-8 items-center justify-center overflow-hidden rounded-md bg-surface-muted">
              <BorderThumb id={id} />
            </span>
            <span className="truncate text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {(["sm", "md", "lg", "xl"] as const).map((z) => (
            <button key={z} type="button" onClick={() => onChange({ size: z })} className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${border.size === z ? "bg-fg text-surface" : "bg-surface-muted text-soft hover:text-fg"}`}>{z}</button>
          ))}
        </div>
        <Button variant="outline" size="xs" onClick={() => onChange({ top: "none", bottom: "none", left: "none", right: "none" })}>Remove all</Button>
      </div>
      <label className="grid gap-1 text-xs font-semibold">
        <span className="flex items-center justify-between">Bend the border<span className="font-normal text-soft">{border.curve === 0 ? "Flat" : border.curve > 0 ? `Sag ${border.curve}%` : `Arch ${-border.curve}%`}</span></span>
        <span className="text-[11px] font-normal leading-snug text-soft">Arch rises in the middle, sag hangs down.</span>
        <input type="range" min={-100} max={100} step={5} value={border.curve} onChange={(e) => onChange({ curve: +e.target.value })} className="w-full accent-[var(--color-accent-600)]" />
        <span className="flex justify-between text-[10px] font-normal text-soft"><span>Arch ⌒</span><span>Flat</span><span>Sag ⌣</span></span>
      </label>
      <label className="grid gap-1 text-xs font-semibold">
        <span className="flex items-center justify-between">Ripples<span className="font-normal text-soft">{(border.wave ?? 0) === 0 ? "None" : `${border.wave}%`}</span></span>
        <span className="text-[11px] font-normal leading-snug text-soft">Slide right for more ripples.</span>
        <input type="range" min={0} max={100} step={5} value={border.wave ?? 0} onChange={(e) => onChange({ wave: +e.target.value })} className="w-full accent-[var(--color-accent-600)]" />
        <span className="flex justify-between text-[10px] font-normal text-soft"><span>None</span><span>Few</span><span>Many</span></span>
      </label>
    </div>
  );
}

/** Popover content: animated illustrations to drop into a section (click to add, or drag onto the page). */
/** Search the free illustration libraries; picking one copies it into the page (no leaving the app). */
function IllustrationLibrary({ onImport }: { onImport: (id: string) => Promise<void> }) {
  const [source, setSource] = useState<"packs" | "emoji">("packs");
  const [pack, setPack] = useState<string>(ILLUSTRATION_PACKS[0].id);
  const [q, setQ] = useState("");
  const [set, setSet] = useState("all");
  const [ids, setIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const term = q.trim();
    if (!term) return; // the ideas show instead
    const ctl = new AbortController();
    const timer = setTimeout(async () => {
      setBusy(true);
      setError("");
      try {
        const res = await fetch(`/api/illustrations?q=${encodeURIComponent(term)}&set=${set}`, { signal: ctl.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Search failed.");
        setIds(data.icons ?? []);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message);
      } finally {
        if (!ctl.signal.aborted) setBusy(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
  }, [q, set]);

  async function pick(id: string) {
    setAdding(id);
    try {
      await onImport(id);
    } finally {
      setAdding(null);
    }
  }

  const sources = (
    <div className="flex gap-1">
      {([["packs", "Characters"], ["emoji", "Icons & emoji"]] as const).map(([id, label]) => (
        <button key={id} type="button" onClick={() => setSource(id)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${source === id ? "bg-accent-600 text-white" : "bg-surface-muted text-soft hover:text-fg"}`}>{label}</button>
      ))}
    </div>
  );

  if (source === "packs") {
    const files = PACK_FILES.filter(([p]) => p === pack);
    const info = ILLUSTRATION_PACKS.find((p) => p.id === pack)!;
    return (
      <div className="grid gap-2">
        {sources}
        <div className="flex gap-1">
          {ILLUSTRATION_PACKS.map((p) => (
            <button key={p.id} type="button" onClick={() => setPack(p.id)} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${pack === p.id ? "border-fg text-fg" : "border-border text-soft hover:text-fg"}`}>{p.label}</button>
          ))}
        </div>
        <div className="grid max-h-60 grid-cols-3 gap-1.5 overflow-auto pr-1">
          {files.map(([p, file]) => {
            const id = `${p}:${file}`;
            return (
              <button key={id} type="button" title={packLabel(file)} aria-label={`Add ${packLabel(file)}`} disabled={!!adding} onClick={() => pick(id)} className="relative flex aspect-square items-center justify-center rounded-xl border border-border bg-white p-1.5 transition-colors hover:border-fg disabled:opacity-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/illustrations/${p}/${file}.svg`} alt="" loading="lazy" className="h-full w-full object-contain" />
                {adding === id && <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70"><Loader2 size={16} className="animate-spin" /></span>}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] leading-snug text-soft">{info.label} by {info.by}, free for any use ({info.license}). Added pictures are copied into your page.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {sources}
      <label className="relative block">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-soft" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: car, dinosaur, cake…" aria-label="Search free illustrations" className="h-9 w-full rounded-lg border border-border-strong bg-surface pl-8 pr-2 text-sm text-fg placeholder:text-soft outline-none focus:border-fg-subtle" />
      </label>
      <div className="flex flex-wrap gap-1">
        {[{ prefix: "all", label: "All" }, ...ILLUSTRATION_SETS].map((x) => (
          <button key={x.prefix} type="button" onClick={() => setSet(x.prefix)} className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${set === x.prefix ? "border-fg text-fg" : "border-border text-soft hover:text-fg"}`}>{x.label}</button>
        ))}
      </div>
      {!q.trim() ? (
        <div className="flex flex-wrap gap-1.5">
          {ILLUSTRATION_IDEAS.map((w) => (
            <button key={w} type="button" onClick={() => setQ(w)} className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium capitalize text-soft hover:text-fg">{w}</button>
          ))}
        </div>
      ) : busy ? (
        <p className="flex items-center gap-2 py-6 text-sm text-soft"><Loader2 size={14} className="animate-spin" /> Searching…</p>
      ) : error ? (
        <p className="py-4 text-sm text-red-600">{error}</p>
      ) : ids.length === 0 ? (
        <p className="py-4 text-sm text-soft">Nothing found. Try another word.</p>
      ) : (
        <div className="grid max-h-60 grid-cols-4 gap-1.5 overflow-auto pr-1">
          {ids.map((id) => {
            const [prefix, name] = id.split(":");
            return (
              <button key={id} type="button" title={name.replace(/-/g, " ")} aria-label={`Add ${name.replace(/-/g, " ")}`} disabled={!!adding} onClick={() => pick(id)} className="relative flex aspect-square items-center justify-center rounded-xl border border-border bg-surface p-1.5 transition-colors hover:border-fg disabled:opacity-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${ICONIFY}/${prefix}/${name}.svg`} alt="" loading="lazy" className="h-full w-full object-contain" />
                {adding === id && <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface/70"><Loader2 size={16} className="animate-spin" /></span>}
              </button>
            );
          })}
        </div>
      )}
      <p className="text-[10px] leading-snug text-soft">
        Free to use: {ILLUSTRATION_SETS.map((s) => `${s.name} (${s.license})`).join(", ")}. Added pictures are copied into your page.
      </p>
    </div>
  );
}

export function ArtPicker({ onPick, onUpload, onImport, sticker, adjust }: { onPick: (key: string) => void; onUpload?: (files: FileList | null) => void; onImport?: (id: string) => Promise<void>; sticker?: StickerState | null; adjust?: (op: StickerOp) => void }) {
  const [tab, setTab] = useState<"built" | "free">("built");
  const [aq, setAq] = useState("");
  const tile = ([key, label]: readonly [string, string]) => (
    <button
      key={key}
      type="button"
      title={label}
      aria-label={`Add ${label}`}
      draggable
      onDragStart={(e) => {
        drag.current = { kind: "sticker", preset: { kind: "art", content: key, size: 64, effect: "none" } };
        e.dataTransfer.setData("text/plain", key);
        e.dataTransfer.effectAllowed = "copy";
      }}
      onDragEnd={() => (drag.current = null)}
      onClick={() => onPick(key)}
      className="flex aspect-square w-full cursor-grab items-center justify-center rounded-xl border border-border bg-surface text-fg transition-colors hover:border-fg active:cursor-grabbing"
    >
      <span style={{ fontSize: 24 }}><ArtSvg name={key} /></span>
    </button>
  );
  return (
    <div data-action className="grid w-80 gap-2 p-1 text-left">
      {sticker && adjust && (
        <div className="grid gap-1.5 border-b border-border pb-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soft">Selected sticker</p>
          <div className="flex items-center gap-1">
            {(
              [
                ["flip", "Mirror", <FlipHorizontal2 key="f" size={16} />, sticker.flip],
                ["rotL", "Rotate left", <RotateCcw key="l" size={16} />, false],
                ["rotR", "Rotate right", <RotateCw key="r" size={16} />, false],
                ["smaller", "Smaller", <ZoomOut key="s" size={16} />, false],
                ["bigger", "Bigger", <ZoomIn key="b" size={16} />, false],
              ] as [StickerOp, string, React.ReactNode, boolean][]
            ).map(([op, label, icon, on]) => (
              <Tooltip key={op} content={label} position="top" portal>
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={on}
                  onClick={() => adjust(op)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${on ? "border-fg bg-fg text-surface" : "border-border hover:border-fg"}`}
                >
                  {icon}
                </button>
              </Tooltip>
            ))}
          </div>
          <p className="text-[11px] text-soft">Rotation {Math.round(sticker.rotate)}° · Size {sticker.size}</p>
        </div>
      )}
      {onImport && (
        <div className="flex gap-1">
          {([["built", "Animated"], ["free", "Free library"]] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={`flex-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tab === id ? "bg-fg text-surface" : "bg-surface-muted text-soft hover:text-fg"}`}>{label}</button>
          ))}
        </div>
      )}
      {tab === "free" && onImport ? (
        <IllustrationLibrary onImport={onImport} />
      ) : (
        <>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soft">Animated illustrations</p>
          <label className="relative block">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-soft" />
            <input value={aq} onChange={(e) => setAq(e.target.value)} placeholder="Search animated: balloon, star, cake…" aria-label="Search animated illustrations" className="h-9 w-full rounded-lg border border-border-strong bg-surface pl-8 pr-2 text-sm text-fg placeholder:text-soft outline-none focus:border-fg-subtle" />
          </label>
          {(() => {
            const words = aq.trim().toLowerCase().split(/\s+/).filter(Boolean);
            const groups = ART_GROUPS.map(([title, items]) => [title, words.length ? items.filter(([k, l]) => words.every((w) => `${k} ${l} ${title}`.toLowerCase().includes(w))) : items] as const).filter(([, items]) => items.length);
            return (
              <div className="grid max-h-72 gap-3 overflow-auto pr-1">
                {groups.length === 0 && <p className="py-6 text-center text-xs text-soft">No animated illustration matches “{aq}”.</p>}
                {groups.map(([title, items]) => (
                  <div key={title} className="grid gap-1.5">
                    <p className="text-xs font-semibold text-fg">{title}</p>
                    <div className="grid grid-cols-4 gap-1.5">{items.map(tile)}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </>
      )}
      {onUpload && (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-500">
          <ImagePlus size={16} />
          Upload your own image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => {
              onUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

export type Limits = { rsvp: boolean; stickers: boolean; textCount: number; graffitiCount: number };

/** Popover content: every element you can add to this section (click to add, or drag onto the page). */
function ElementPicker({ onPick, limits }: { onPick: (type: ElementType) => void; limits: Limits }) {
  return (
    <div data-action className="grid w-64 gap-3 p-1 text-left">
      {GROUPS.map((g) => (
        <div key={g.title} className="grid gap-1.5">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-soft">
            <g.Icon size={12} />
            {g.title}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {g.types.map((type) => {
              const { Icon, label } = elementMeta(type);
              const disabled = type === "sticker" ? limits.stickers : type === "rsvp" && limits.rsvp;
              return (
                <button
                  key={type}
                  type="button"
                  disabled={disabled}
                  draggable={!disabled}
                  title={disabled ? (type === "sticker" ? "Sticker limit reached" : "The page already has an RSVP form") : label}
                  onDragStart={(e) => {
                    drag.current = type === "sticker" ? { kind: "sticker" } : { kind: "new", type };
                    e.dataTransfer.setData("text/plain", type);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onDragEnd={() => (drag.current = null)}
                  onClick={() => onPick(type)}
                  className="flex cursor-grab flex-col items-center gap-1 rounded-lg border border-border bg-surface px-1 py-2 text-fg transition-colors hover:border-fg active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon size={17} strokeWidth={1.5} className="text-soft" />
                  <span className="text-[10px] font-medium leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Popover content: the text stickers (+ Text, + Graffiti), with how many of each are already on the page. */
function TextStickerPicker({ limits, onPick }: { limits: Limits; onPick: (preset: Partial<Decoration>) => void }) {
  const counts = [limits.textCount, limits.graffitiCount];
  return (
    <div data-action className="grid w-56 gap-2 p-1 text-left">
      <h4 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-soft">
        <Type size={13} />
        Text
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {TEXT_PRESETS.map((p, i) => (
          <div
            key={p.label}
            draggable={!limits.stickers}
            onDragStart={(e) => {
              drag.current = { kind: "sticker", preset: p.d };
              e.dataTransfer.setData("text/plain", p.label);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onDragEnd={() => (drag.current = null)}
            className="cursor-grab"
          >
            <Button variant="outline" size="xs" disabled={limits.stickers} onClick={() => onPick(p.d)}>
              {p.label}
              {counts[i] > 0 && (
                <Badge variant="solid" size="xs" className="ml-1.5">
                  {counts[i]}
                </Badge>
              )}
            </Button>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-soft">Click to add in the middle, or drag onto the page.</p>
    </div>
  );
}

const half = (e: React.DragEvent) => {
  const r = e.currentTarget.getBoundingClientRect();
  return e.clientY < r.top + r.height / 2 ? "before" : "after";
};

export function EditBlock({
  block,
  sectionId,
  index,
  selected,
  pickedNo = 0,
  actions,
  children,
}: {
  block: Block;
  sectionId: string;
  index: number;
  selected: boolean;
  /** 1, 2, 3… = its place in the multi-selection; 0 = not picked */
  pickedNo?: number;
  actions: EditActions;
  children: ReactNode;
}) {
  const [over, setOver] = useState<"before" | "after" | null>(null);
  const [guide, setGuide] = useState<{ x: number; top: number; height: number; snapped: boolean } | null>(null);
  const root = useRef<HTMLDivElement>(null);

  // free drag: move the element anywhere in its section; a centre line shows (and snaps) while dragging, and everything below follows (the section grows or shrinks with it)
  const startMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = root.current;
    const wrap = el?.closest<HTMLElement>("[data-sec-body]");
    const sec = el?.closest<HTMLElement>("[data-section]");
    if (e.button !== 0 || e.shiftKey || e.metaKey || e.ctrlKey || !el || !wrap || !sec || (e.target as HTMLElement).closest("[data-action],input,textarea,select")) return;
    const sx = e.clientX, sy = e.clientY;
    const r0 = el.getBoundingClientRect();
    const w0 = wrap.getBoundingClientRect();
    const s0 = sec.getBoundingClientRect();
    const px0 = (block.x / 100) * w0.width;
    const baseCx = r0.left + r0.width / 2 - px0;
    const cx = w0.left + w0.width / 2;
    let moved = false;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      let px = px0 + dx;
      const snapped = Math.abs(baseCx + px - cx) < 8;
      if (snapped) px = cx - baseCx;
      // keep at least part of the element inside the section (full-width elements can still be nudged sideways)
      const keep = Math.min(r0.width, 80);
      px = Math.max(w0.left + keep - r0.width / 2 - baseCx, Math.min(w0.right - keep + r0.width / 2 - baseCx, px));
      // pushing: upwards the limit is the element's original spot (its normal spacing); downwards it pushes what is below
      // overlapping: it floats anywhere inside the section and nothing else moves
      const y = block.overlap
        ? Math.round(Math.min(block.y + (s0.bottom - r0.bottom), Math.max(block.y - (r0.top - s0.top), block.y + dy)))
        : Math.max(0, Math.round(block.y + dy));
      actions.placeBlock(block.id, Math.round((px / w0.width) * 1000) / 10, y);
      const sr = sec.getBoundingClientRect();
      setGuide({ x: cx, top: sr.top, height: sr.height, snapped });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setGuide(null);
      // releasing over a button / link must not press it
      if (moved) {
        const stop = (c: MouseEvent) => { c.preventDefault(); c.stopPropagation(); };
        window.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", stop, true), 0);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return (
    <div
      ref={root}
      data-block={block.id}
      onPointerDown={startMove}
      style={block.x || block.y ? (block.overlap ? { left: `${block.x}%`, top: block.y, zIndex: 2 } : { left: `${block.x}%`, marginTop: block.y }) : undefined}
      onDragOver={(e) => {
        const p = drag.current;
        if (!p || p.kind === "section" || p.kind === "sticker" || (p.kind === "block" && p.id === block.id)) return;
        e.preventDefault();
        e.stopPropagation();
        setOver(half(e));
      }}
      onDragLeave={() => setOver(null)}
      onDrop={(e) => {
        const p = drag.current;
        if (!p || p.kind === "section" || p.kind === "sticker") return;
        e.preventDefault();
        e.stopPropagation();
        const at = index + (over === "after" ? 1 : 0);
        drag.current = null;
        setOver(null);
        if (p.kind === "block") actions.moveBlock(p.id, sectionId, at);
        else actions.addBlock(p.type, sectionId, at);
      }}
      className={`group/b relative flex ${HUG.has(block.type) ? "w-fit max-w-full" : "w-full"} cursor-grab touch-none flex-col items-center hover:z-50 active:cursor-grabbing ${selected ? "is-selected z-50" : ""} ${pickedNo ? "is-picked" : ""}`}
    >
      {over === "before" && <i className="drop-line -top-3" />}
      {pickedNo > 0 && (
        <span aria-label={`Selected ${pickedNo}`} className="pick-badge pointer-events-none absolute -left-3 -top-3 z-30 flex h-7 min-w-7 items-center justify-center gap-0.5 rounded-full bg-brand px-1.5 text-xs font-extrabold text-white shadow-lg ring-2 ring-white">
          <Check size={13} strokeWidth={3} />{pickedNo}
        </span>
      )}
      {children}
      {over === "after" && <i className="drop-line -bottom-3" />}
      {guide && createPortal(<i aria-hidden className={`pointer-events-none fixed z-[100] w-0 transition-colors border-l-2 border-dashed`} style={{ left: guide.x, top: guide.top, height: guide.height, borderColor: guide.snapped ? "#22c55e" : "#ef4444" }} />, document.body)}
      <div
        className={`absolute -top-3 right-0 z-30 flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white shadow ${selected ? "" : "pointer-events-none opacity-0 group-hover/b:pointer-events-auto group-hover/b:opacity-100"}`}
      >
        {/* the grip is the handle for re-ordering (drop between elements or into another section); the body of the element moves freely */}
        <span
          data-action
          draggable
          title="Drag to re-order"
          className="flex cursor-grab items-center"
          onPointerDown={(e) => e.stopPropagation()}
          onDragStart={(e) => {
            e.stopPropagation();
            drag.current = { kind: "block", id: block.id };
            e.dataTransfer.setData("text/plain", block.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={() => {
            drag.current = null;
            setOver(null);
          }}
        ><GripVertical size={14} />{block.type}</span>
        <button type="button" data-action aria-label="Remove element" onClick={() => actions.removeBlock(block.id)} className="ml-1 rounded-full p-0.5 hover:bg-white/30"><X size={14} /></button>
      </div>
    </div>
  );
}

export function EditSection({
  section,
  index,
  count,
  sticker,
  limits,
  selected,
  actions,
  layer,
  children,
}: {
  section: Section;
  index: number;
  count: number;
  sticker: StickerState | null;
  limits: Limits;
  selected: boolean;
  actions: EditActions;
  layer: ReactNode;
  children: ReactNode;
}) {
  const [over, setOver] = useState<"before" | "after" | "inside" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [artOpen, setArtOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [borderOpen, setBorderOpen] = useState(false);
  return (
    <motion.div
      layout="position"
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      data-section={section.id}
      className={`group/s decor-host relative hover:z-40 ${selected ? "is-selected z-40" : ""} ${menuOpen || artOpen || addOpen || textOpen || borderOpen ? "!z-[60]" : ""} ${section.card ? "mx-auto my-8 w-[calc(100%-1.5rem)] max-w-7xl rounded-[64px] border border-border shadow-[0_10px_28px_-18px_rgba(0,0,0,0.25)]" : ""} ${section.hidden ? "opacity-50" : ""}`}
      onDragOver={(e) => {
        const p = drag.current;
        if (!p) return;
        e.preventDefault();
        setOver(p.kind === "section" ? half(e) : "inside");
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null);
      }}
      onDrop={(e) => {
        const p = drag.current;
        if (!p) return;
        e.preventDefault();
        const pos = over;
        drag.current = null;
        setOver(null);
        if (p.kind === "sticker") {
          const r = e.currentTarget.getBoundingClientRect();
          actions.addSticker(section.id, Math.round(((e.clientX - r.left) / r.width) * 1000) / 10, Math.round(((e.clientY - r.top) / r.height) * 1000) / 10, p.preset);
        } else if (p.kind === "section") actions.moveSection(p.id, index + (pos === "after" ? 1 : 0));
        else if (p.kind === "block") actions.moveBlock(p.id, section.id, section.blocks.length);
        else actions.addBlock(p.type, section.id, section.blocks.length);
      }}
    >
      {over === "before" && <i className="drop-line -top-1" />}
      {over === "inside" && <i className="pointer-events-none absolute inset-0 z-40 rounded-[inherit] ring-4 ring-inset ring-brand/50" />}
      {children}
      {layer}
      {section.blocks.length === 0 && (
        <p className="m-4 rounded-2xl border-2 border-dashed border-brand/40 py-10 text-center text-sm font-bold text-brand">Empty section — drop elements here</p>
      )}
      {/* section tools: a vertical rail in the gutter outside the left edge. data-action lets clicks through the editor's "click only selects" guard */}
      <div
        data-action
        className={`pointer-events-none absolute -left-11 top-3 z-30 flex w-9 flex-col items-center gap-1.5`}
      >
        <div className={`flex flex-col items-center gap-0.5 rounded-2xl bg-ink p-1 text-white shadow-lg pointer-events-auto`}>
        <Popover
          position="right"
          classNames={{ panel: "top-0 translate-y-0" }}
          open={addOpen}
          onOpenChange={(o) => {
            setAddOpen(o);
            if (o) actions.selectSection(section.id);
          }}
          content={
            <ElementPicker
              limits={limits}
              onPick={(type) => {
                if (type === "sticker") actions.addSticker(section.id, 50, 50);
                else actions.addBlock(type, section.id, section.blocks.length);
                setAddOpen(false);
              }}
            />
          }
        >
          <Tooltip content="Add an element" position="right" portal>
            <button type="button" aria-label="Add an element" className="flex h-7 w-7 items-center justify-center rounded-xl hover:bg-white/20">
              <Plus size={16} />
            </button>
          </Tooltip>
        </Popover>
        <Popover
          position="right"
          classNames={{ panel: "top-0 translate-y-0" }}
          open={textOpen}
          onOpenChange={(o) => {
            setTextOpen(o);
            if (o) actions.selectSection(section.id);
          }}
          content={
            <TextStickerPicker
              limits={limits}
              onPick={(preset) => {
                actions.addSticker(section.id, 50, 50, preset);
                setTextOpen(false);
              }}
            />
          }
        >
          <Tooltip content="Text stickers" position="right" portal>
            <button type="button" aria-label="Text stickers" className="flex h-7 w-7 items-center justify-center rounded-xl hover:bg-white/20">
              <Type size={16} />
            </button>
          </Tooltip>
        </Popover>
        <Popover
          position="right"
          classNames={{ panel: "top-0 translate-y-0" }}
          open={artOpen}
          onOpenChange={(o) => {
            setArtOpen(o);
            if (o) actions.selectSection(section.id);
          }}
          content={
            <ArtPicker
              sticker={sticker}
              adjust={actions.adjustSticker}
              onUpload={(files) => {
                void actions.uploadSticker(section.id, files);
                setArtOpen(false);
              }}
              onImport={async (id) => {
                await actions.importSticker(section.id, id);
                setArtOpen(false);
              }}
              onPick={(key) => {
                actions.addSticker(section.id, 50, 50, { kind: "art", content: key, size: 64, effect: "none" });
                setArtOpen(false);
              }}
            />
          }
        >
          <Tooltip content="Illustrations" position="right" portal>
            <button type="button" aria-label="Add animated illustration" className="flex h-7 w-7 items-center justify-center rounded-xl hover:bg-white/20">
              <PartyPopper size={16} />
            </button>
          </Tooltip>
        </Popover>
        <Popover
          position="right"
          classNames={{ panel: "top-0 translate-y-0" }}
          open={borderOpen}
          onOpenChange={(o) => {
            setBorderOpen(o);
            if (o) actions.selectSection(section.id);
          }}
          content={<BorderPicker border={section.border} onChange={(patch) => actions.setBorder(section.id, patch)} />}
        >
          <Tooltip content="Borders" position="right" portal>
            <button type="button" aria-label="Section borders" className="flex h-7 w-7 items-center justify-center rounded-xl hover:bg-white/20">
              <Frame size={16} />
            </button>
          </Tooltip>
        </Popover>
        <DropdownMenu
          align="start"
          onOpenChange={(o) => {
            setMenuOpen(o);
            if (o) actions.selectSection(section.id);
          }}
          trigger={
            <Tooltip content="Section options" position="right" portal>
              <button type="button" aria-label="Section options" className="flex h-7 w-7 items-center justify-center rounded-xl hover:bg-white/20">
                <MoreHorizontal size={16} />
              </button>
            </Tooltip>
          }
        >
          <DropdownMenuItem icon="sparkles" onClick={() => actions.editSection(section.id)}>Edit section</DropdownMenuItem>
          <DropdownMenuItem icon={section.hidden ? "eye" : "eye-off"} onClick={() => actions.toggleHidden(section.id)}>{section.hidden ? "Show on site" : "Hide on site"}</DropdownMenuItem>
          <DropdownMenuItem icon="copy" onClick={() => actions.duplicateSection(section.id)}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem icon="trash-2" danger onClick={() => actions.removeSection(section.id)}>Delete section</DropdownMenuItem>
        </DropdownMenu>
        {section.hidden && (
          <Tooltip content="Hidden on the live site — click to show it" position="right" portal>
            <button type="button" aria-label="Show this section on the site" onClick={() => actions.toggleHidden(section.id)} className="flex h-7 w-7 items-center justify-center rounded-xl text-white/80 hover:bg-white/20 hover:text-white">
              <EyeOff size={16} />
            </button>
          </Tooltip>
        )}
        </div>
        {/* move up / down: second pill under the tools */}
        <div className={`flex flex-col items-center gap-0.5 rounded-2xl bg-ink p-1 text-white shadow-lg pointer-events-auto`}>
          <Tooltip content="Move up" position="right" portal>
            <button type="button" aria-label="Move section up" disabled={index === 0} onClick={() => actions.moveSectionBy(section.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-xl hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent">
              <ArrowUp size={16} />
            </button>
          </Tooltip>
          <Tooltip content="Move down" position="right" portal>
            <button type="button" aria-label="Move section down" disabled={index === count - 1} onClick={() => actions.moveSectionBy(section.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-xl hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent">
              <ArrowDown size={16} />
            </button>
          </Tooltip>
        </div>
      </div>
      {/* section name label: top right, straddling the top edge */}
      <div className={`pointer-events-none absolute top-1.5 right-3 z-50 ${selected || menuOpen || artOpen || addOpen || textOpen || borderOpen ? "" : "opacity-0 group-hover/s:opacity-100"}`}>
        <span className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg ${selected ? "bg-[#2563eb]" : "bg-ink"}`}>
          {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
          {section.name || "Section"}
          {section.hidden && <span className="ml-1.5 font-normal opacity-70">(hidden)</span>}
        </span>
      </div>
      {over === "after" && <i className="drop-line -bottom-1" />}
    </motion.div>
  );
}
