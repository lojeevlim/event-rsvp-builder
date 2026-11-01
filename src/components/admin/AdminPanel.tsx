"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type PointerEvent as RPointerEvent } from "react";
import {
  applyName,
  decorPath,
  DEFAULT_PATH,
  EFFECTS,
  SHAPES,
  KINDS,
  MAX_BLOCKS,
  MAX_DECORATIONS,
  MAX_IMAGES,
  MAX_SECTIONS,
  newBlock,
  resolveRsvpParts,
  RSVP_FIELDS,
  RSVP_PART_META,
  type RsvpPart,
  type RsvpPartKey,
  type Block,
  type BlockType,
  type Decoration,
  type EventType,
  type Section,
  type Settings,
} from "@/lib/settings-shared";
import {
  ArrowDown, ArrowUp, CalendarDays, ChevronDown, GripVertical, Layers, LayoutTemplate, Palette, SlidersHorizontal, Trash2, Keyboard, Redo2, Undo2, MapPin, MoveHorizontal, MoveVertical, Maximize2, Plus, RotateCw, Sparkles, Sticker, Type, Wrench, X, type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import PageView from "@/components/PageView";
import { ICON_OPTIONS } from "@/components/icons";
import { GROUPS, PALETTE, TEXT_PRESETS } from "@/components/palette";
import ArtSvg, { ART_OPTIONS } from "@/components/ArtSvg";
import { applyPreset, EVENT_TYPE_OPTIONS, isPlaceholderName, PRESETS as EVENT_PRESETS } from "@/lib/presets";
import { DecorItem } from "@/components/Decorations";
import { drag, type EditActions } from "@/components/edit-ui";
import {
  ANIMATED_VARIANTS,
  Alert,
  AlertDialog,
  Badge,
  Button,
  ButtonGroup,
  Card,
  FileUpload,
  Image,
  Input,
  Popover,
  SegmentButton,
  ThemeProvider,
  Toast,
  Tooltip,
  UserMenu,
} from "@/components/ui";
import RsvpList from "./RsvpList";
import { ColorField, Grip, SelectField, SliderField, SwitchField, TextField, useReorder } from "./fields";

type Sel = { section: string | null; block: string | null };

const BG_OPTIONS = [["white", "Surface"], ["cream", "Muted"], ["brand", "Accent colour"], ["ink", "Dark accent"], ["plain", "None (dotted page)"]] as const;
const SIZE_OPTIONS = [["sm", "Small"], ["md", "Medium"], ["lg", "Large"], ["xl", "Extra large"]] as const;
const TONE_OPTIONS = [["ink", "Default"], ["brand", "Accent"], ["soft", "Muted"], ["white", "Contrast (follows the background)"]] as const;
type Clip =
  | { kind: "block"; block: Block }
  | { kind: "section"; section: Section; decorations: Decoration[] }
  | { kind: "sticker"; d: Decoration };

const SHORTCUTS: [string, string][] = [["Ctrl/\u2318 Z", "Undo"], ["Ctrl/\u2318 Shift Z  \u00b7  Ctrl Y", "Redo"], ["Ctrl/\u2318 C  \u00b7  X  \u00b7  V", "Copy, cut, paste the selected element, section or sticker"], ["Ctrl/\u2318 D", "Duplicate the selection"], ["Delete  \u00b7  Backspace", "Delete the selection"], ["Arrow keys", "Nudge a selected sticker (Shift = bigger steps)"], ["Alt + \u2191 / \u2193", "Move the selected element or section up / down"], ["Ctrl/\u2318 S", "Save changes"], ["Esc", "Clear the selection"], ["?", "Show this list"]];

const LG = "(min-width: 1024px)";
function useIsLg() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(LG);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(LG).matches,
    () => true,
  );
}

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n * 10) / 10));

/** next unused id like b12 / s3 */
function nextId(prefix: string, used: string[]) {
  let n = used.length + 1;
  while (used.includes(`${prefix}${n}`)) n++;
  return `${prefix}${n}`;
}

async function uploadFiles(files: FileList | null, max: number, onError: (m: string) => void) {
  const urls: string[] = [];
  for (const file of Array.from(files ?? []).slice(0, max)) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      onError(`${file.name}: ${data?.error ?? "upload failed"}`);
      break;
    }
    urls.push(data.url);
  }
  return urls;
}

export default function AdminPanel({ initial }: { initial: Settings }) {
  const [s, setS] = useState(initial);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial));
  const [view, setView] = useState<"edit" | "rsvps">("edit");
  const [sel, setSel] = useState<Sel>({ section: null, block: null });
  const [selDecor, setSelDecor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(false);
  // "Content" list: a collapsible bar under the preview on phones, always open in the desktop sidebar
  const [addedOpen, setAddedOpen] = useState(false);
  // "Event & theme" dropdown: controlled so the phone layout can give it a close button
  // (the header and the bar each render one, so remember which is open — a shared flag would open both and each would close the other)
  const [themeOpen, setThemeOpen] = useState<string | null>(null);
  // section settings: on phones the body can be folded away, leaving just its header
  const [settingsOpen, setSettingsOpen] = useState(false);
  // settings live in floating, draggable panels (the toolbox itself is a permanent icon strip)
  // the element / sticker that was just added: closing its panel untouched with ✕ takes it back out again
  const [fresh, setFresh] = useState<{ kind: "block" | "sticker"; id: string; snapshot: string } | null>(null);
  const [elementPanel, setElementPanel] = useState(false);
  // the RSVP form piece being edited in its own floating panel (clicked in the preview)
  const [rsvpPartKey, setRsvpPartKey] = useState<RsvpPartKey | null>(null);
  const [stickersPanel, setStickersPanel] = useState(false); // the text-stickers tool (+ Text, + Graffiti, the list)
  const [pendingType, setPendingType] = useState<EventType | null>(null);
  const [selKind, setSelKind] = useState<"sticker" | "block" | "section" | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [stickerPanel, setStickerPanel] = useState(false);
  const [hist, setHist] = useState({ past: 0, future: 0 });
  const past = useRef<Settings[]>([]);
  const future = useRef<Settings[]>([]);
  const last = useRef<Settings>(initial);
  const skip = useRef(false);
  const burst = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clip = useRef<Clip | null>(null);
  const isLg = useIsLg();
  const dragging = useRef<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // focus: bring the selected section / element into view and put the cursor in its first field
  useEffect(() => {
    if (!sel.section) return;
    const q = sel.block ? `[data-block="${sel.block}"]` : `[data-section="${sel.section}"]`;
    previewRef.current?.querySelector(q)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (!sel.block) return;
    const t = setTimeout(() => document.querySelector<HTMLElement>('[data-panel="element"] input:not([type=hidden]), [data-panel="element"] textarea')?.focus({ preventScroll: true }), 150);
    return () => clearTimeout(t);
  }, [sel.section, sel.block]);

  // undo / redo: every change pushes the previous state; rapid changes (typing, dragging) merge into one step
  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      last.current = s;
      return;
    }
    if (s === last.current || JSON.stringify(s) === JSON.stringify(last.current)) return;
    if (!burst.current) {
      past.current.push(last.current);
      if (past.current.length > 100) past.current.shift();
      future.current = [];
    } else clearTimeout(burst.current);
    burst.current = setTimeout(() => (burst.current = null), 400);
    last.current = s;
    setHist({ past: past.current.length, future: 0 });
  }, [s]);

  const dirty = JSON.stringify(s) !== savedJson;
  const curSection = s.sections.find((x) => x.id === sel.section);
  const curBlock = curSection?.blocks.find((b) => b.id === sel.block);

  /* ---- state mutators ---- */
  const updateSection = (id: string, p: Partial<Section>) =>
    setS((prev) => ({ ...prev, sections: prev.sections.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
  const updateBlock = (id: string, p: Partial<Block>) =>
    setS((prev) => ({
      ...prev,
      sections: prev.sections.map((x) => ({ ...x, blocks: x.blocks.map((b) => (b.id === id ? { ...b, ...p } : b)) })),
    }));

  const actions: EditActions = {
    moveBlock(id, toSection, index) {
      setS((prev) => {
        const from = prev.sections.find((x) => x.blocks.some((b) => b.id === id));
        const block = from?.blocks.find((b) => b.id === id);
        if (!from || !block) return prev;
        const fromIdx = from.blocks.indexOf(block);
        const at = from.id === toSection && fromIdx < index ? index - 1 : index;
        return {
          ...prev,
          sections: prev.sections.map((x) => {
            let blocks = x.blocks;
            if (x.id === from.id) blocks = blocks.filter((b) => b.id !== id);
            if (x.id === toSection) {
              blocks = [...blocks];
              blocks.splice(at, 0, block);
            }
            return blocks === x.blocks ? x : { ...x, blocks };
          }),
        };
      });
      setSel({ section: toSection, block: id });
      setSelKind("block");
    },
    addBlock(type, toSection, index) {
      const used = s.sections.flatMap((x) => x.blocks.map((b) => b.id));
      const target = s.sections.find((x) => x.id === toSection);
      if (!target || target.blocks.length >= MAX_BLOCKS) return setMsg({ ok: false, text: "That section is full." });
      if (type === "rsvp" && s.sections.some((x) => x.blocks.some((b) => b.type === "rsvp")))
        return setMsg({ ok: false, text: "The page already has an RSVP form." });
      const b = newBlock(type, nextId("b", used));
      setS((prev) => ({
        ...prev,
        sections: prev.sections.map((x) => {
          if (x.id !== toSection) return x;
          const blocks = [...x.blocks];
          blocks.splice(index, 0, b);
          return { ...x, blocks };
        }),
      }));
      setSel({ section: toSection, block: b.id });
      setSelKind("block");
      setElementPanel(true);
      setFresh({ kind: "block", id: b.id, snapshot: JSON.stringify(b) });
    },
    removeBlock(id) {
      setS((prev) => ({ ...prev, sections: prev.sections.map((x) => ({ ...x, blocks: x.blocks.filter((b) => b.id !== id) })) }));
      setSel((p) => (p.block === id ? { ...p, block: null } : p));
    },
    moveSection(id, index) {
      setS((prev) => {
        const from = prev.sections.findIndex((x) => x.id === id);
        if (from < 0) return prev;
        const list = [...prev.sections];
        const [m] = list.splice(from, 1);
        list.splice(from < index ? index - 1 : index, 0, m);
        return { ...prev, sections: list };
      });
      setSel({ section: id, block: null });
    },
    removeSection(id) {
      setConfirmDelete(id);
    },
    addSticker(sectionId, x, y, preset) {
      addSticker({ ...preset, x: clamp(x), y: clamp(y) }, sectionId);
    },
    adjustSticker(op) {
      if (!selDecor) return;
      setS((prev) => ({
        ...prev,
        decorations: prev.decorations.map((d) => {
          if (d.id !== selDecor) return d;
          const turn = (delta: number) => ((((d.rotate + delta + 180) % 360) + 360) % 360) - 180;
          const size = (f: number) => Math.max(4, Math.round(d.size * f));
          return op === "flip" ? { ...d, flip: !d.flip } : op === "rotL" ? { ...d, rotate: turn(-15) } : op === "rotR" ? { ...d, rotate: turn(15) } : op === "smaller" ? { ...d, size: size(1 / 1.15) } : { ...d, size: size(1.15) };
        }),
      }));
    },
    async uploadSticker(sectionId, files) {
      const [url] = await uploadFiles(files, 1, (m) => setMsg({ ok: false, text: m }));
      if (url) addSticker({ kind: "image", content: url, size: 96, effect: "none", color: "#ffffff" }, sectionId);
    },
    selectSection(id) {
      setSel({ section: id, block: null });
      setSelKind("section");
    },
    editSection(id) {
      setSel({ section: id, block: null });
      setSelKind("section");
      setLeftOpen(true);
    },
    moveSectionBy(id, delta) {
      setS((prev) => {
        const i = prev.sections.findIndex((x) => x.id === id);
        const j = i + delta;
        if (i < 0 || j < 0 || j >= prev.sections.length) return prev;
        const list = [...prev.sections];
        [list[i], list[j]] = [list[j], list[i]];
        return { ...prev, sections: list };
      });
    },
    toggleHidden(id) {
      updateSection(id, { hidden: !s.sections.find((x) => x.id === id)?.hidden });
    },
    duplicateSection(id) {
      const src = s.sections.find((x) => x.id === id);
      if (!src) return;
      if (s.sections.length >= MAX_SECTIONS) return setMsg({ ok: false, text: "Too many sections." });
      const used = s.sections.flatMap((x) => x.blocks.map((b) => b.id));
      const newId = nextId("s", s.sections.map((x) => x.id));
      const blocks = src.blocks.filter((b) => b.type !== "rsvp").map((b) => {
        const bid = nextId("b", used);
        used.push(bid);
        return { ...b, id: bid };
      });
      setS((prev) => {
        const list = [...prev.sections];
        list.splice(list.findIndex((x) => x.id === id) + 1, 0, { ...src, id: newId, name: `${src.name} copy`, blocks });
        return { ...prev, sections: list };
      });
      setSel({ section: newId, block: null });
    },
    addSection(index) {
      if (s.sections.length >= MAX_SECTIONS) return setMsg({ ok: false, text: "Too many sections." });
      const id = nextId("s", s.sections.map((x) => x.id));
      const sec: Section = { id, name: "New section", bg: "white", bgColor: "", hidden: false, effect: "none", card: false, wide: false, pad: "lg", blocks: [] };
      setS((prev) => {
        const list = [...prev.sections];
        list.splice(index, 0, sec);
        return { ...prev, sections: list };
      });
      setSel({ section: id, block: null });
    },
  };

  function addSticker(p: Partial<Decoration>, sectionId?: string) {
    const target = s.sections.find((x) => x.id === sectionId) ?? curSection ?? s.sections[0];
    if (!target) return;
    if (s.decorations.length >= MAX_DECORATIONS) return setMsg({ ok: false, text: `Up to ${MAX_DECORATIONS} stickers per page.` });
    const d: Decoration = { id: nextId("d", s.decorations.map((x) => x.id)), section: target.id, kind: "text", content: "Hooray!", x: 50, y: 50, size: 40, rotate: 0, color: "#a1a1aa", effect: "float", ...p, flip: p.flip ?? false, sx: p.sx ?? 1, sy: p.sy ?? 1, shape: p.shape ?? "original", opacity: p.opacity ?? 100, path: p.path ?? DEFAULT_PATH };
    setS((prev) => ({ ...prev, decorations: [...prev.decorations, d] }));
    setSel({ section: target.id, block: null });
    setSelDecor(d.id);
    setSelKind("sticker");
    setStickerPanel(true);
    setFresh({ kind: "sticker", id: d.id, snapshot: JSON.stringify(d) });
    setLeftOpen(true); // sticker settings live in the left panel
  }

  function deleteSection(id: string) {
    setS((prev) => ({
      ...prev,
      sections: prev.sections.filter((x) => x.id !== id),
      decorations: prev.decorations.filter((d) => d.section !== id),
    }));
    setSel({ section: null, block: null });
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setS(data);
      setSavedJson(JSON.stringify(data));
      setMsg({ ok: true, text: "Saved — site updated" });
    } else {
      setMsg({ ok: false, text: data?.error ?? "Could not save." });
    }
    setSaving(false);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    location.reload();
  }

  function onPreviewClick(e: React.MouseEvent) {
    const t = e.target as HTMLElement;
    if (t.closest("[data-action]")) return; // toolbar buttons handle themselves
    // inside the editor a click only selects: no scrolling, links or buttons run
    e.preventDefault();
    e.stopPropagation();
    if (t.closest(".decor, [data-keep]")) return; // stickers and their path handle keep the selection
    setSelDecor(null);
    const section = t.closest<HTMLElement>("[data-section]")?.dataset.section ?? null;
    const block = t.closest<HTMLElement>("[data-block]")?.dataset.block ?? null;
    const part = (t.closest<HTMLElement>("[data-rsvp-part]")?.dataset.rsvpPart as RsvpPartKey | undefined) ?? null;
    setRsvpPartKey(section && block ? part : null);
    if (section) {
      setSel({ section, block });
      if (block) setElementPanel(!part); // a clicked form piece opens its own panel instead of the whole element's
      setSelKind(block ? "block" : "section");
      setLeftOpen(true); // a highlighted section opens its settings panel
    } else {
      // clicking the empty canvas clears the selection (hides Edit and the section panel)
      setSel({ section: null, block: null });
      setSelKind(null);
      setLeftOpen(false);
    }
  }

  /* ---- undo / redo ---- */
  function undo() {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(s);
    skip.current = true;
    burst.current = null;
    setS(prev);
    setHist({ past: past.current.length, future: future.current.length });
  }
  function redo() {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(s);
    skip.current = true;
    burst.current = null;
    setS(next);
    setHist({ past: past.current.length, future: future.current.length });
  }

  /* ---- clipboard: copy / cut / paste / duplicate / delete ---- */
  const curDecor = s.decorations.find((d) => d.id === selDecor);
  const hasSelection = (selKind === "sticker" && !!curDecor) || (selKind === "block" && !!curBlock) || (selKind === "section" && !!curSection);

  function copySelection() {
    if (selKind === "sticker" && curDecor) clip.current = { kind: "sticker", d: curDecor };
    else if (selKind === "block" && curBlock) clip.current = { kind: "block", block: curBlock };
    else if (selKind === "section" && curSection) clip.current = { kind: "section", section: curSection, decorations: s.decorations.filter((d) => d.section === curSection.id) };
    else return false;
    return true;
  }

  function pasteClipboard() {
    const c = clip.current;
    if (!c) return;
    const target = curSection ?? s.sections[0];
    if (!target && c.kind !== "section") return;
    if (c.kind === "sticker") {
      const { id: _id, ...rest } = c.d;
      void _id;
      addSticker({ ...rest, x: clamp(c.d.x + 3), y: clamp(c.d.y + 3) }, target.id);
    } else if (c.kind === "block") {
      if (c.block.type === "rsvp") return setMsg({ ok: false, text: "The page can only have one RSVP form." });
      if (target.blocks.length >= MAX_BLOCKS) return setMsg({ ok: false, text: "That section is full." });
      const used = s.sections.flatMap((x) => x.blocks.map((b) => b.id));
      const copy: Block = { ...c.block, id: nextId("b", used), images: [...c.block.images] };
      const at = curBlock ? target.blocks.findIndex((b) => b.id === curBlock.id) + 1 : target.blocks.length;
      setS((prev) => ({
        ...prev,
        sections: prev.sections.map((x) => {
          if (x.id !== target.id) return x;
          const blocks = [...x.blocks];
          blocks.splice(at, 0, copy);
          return { ...x, blocks };
        }),
      }));
      setSel({ section: target.id, block: copy.id });
      setSelKind("block");
      setElementPanel(true);
      setFresh({ kind: "block", id: copy.id, snapshot: JSON.stringify(copy) });
    } else {
      if (s.sections.length >= MAX_SECTIONS) return setMsg({ ok: false, text: "Too many sections." });
      const used = s.sections.flatMap((x) => x.blocks.map((b) => b.id));
      const newId = nextId("s", s.sections.map((x) => x.id));
      const blocks = c.section.blocks
        .filter((b) => b.type !== "rsvp")
        .map((b) => {
          const id = nextId("b", used);
          used.push(id);
          return { ...b, id };
        });
      const dUsed = s.decorations.map((x) => x.id);
      const decos = c.decorations.slice(0, Math.max(0, MAX_DECORATIONS - s.decorations.length)).map((x) => {
        const id = nextId("d", dUsed);
        dUsed.push(id);
        return { ...x, id, section: newId };
      });
      setS((prev) => {
        const list = [...prev.sections];
        const at = curSection ? list.findIndex((x) => x.id === curSection.id) + 1 : list.length;
        list.splice(at, 0, { ...c.section, id: newId, name: `${c.section.name} copy`, blocks });
        return { ...prev, sections: list, decorations: [...prev.decorations, ...decos] };
      });
      setSel({ section: newId, block: null });
      setSelKind("section");
    }
  }

  function deleteSelection() {
    if (selKind === "sticker" && curDecor) {
      setS((prev) => ({ ...prev, decorations: prev.decorations.filter((d) => d.id !== curDecor.id) }));
      setSelDecor(null);
    } else if (selKind === "block" && curBlock) actions.removeBlock(curBlock.id);
    else if (selKind === "section" && curSection) setConfirmDelete(curSection.id);
  }

  function nudge(dx: number, dy: number) {
    if (selKind === "sticker" && curDecor) {
      setS((prev) => ({ ...prev, decorations: prev.decorations.map((d) => (d.id === curDecor.id ? { ...d, x: clamp(d.x + dx), y: clamp(d.y + dy) } : d)) }));
    } else if (selKind === "block" && curBlock && curSection) {
      const i = curSection.blocks.findIndex((b) => b.id === curBlock.id);
      const j = i + (dy < 0 ? -1 : 1);
      if (j >= 0 && j < curSection.blocks.length) actions.moveBlock(curBlock.id, curSection.id, dy < 0 ? i - 1 : i + 2);
    } else if (selKind === "section" && curSection) actions.moveSectionBy(curSection.id, dy < 0 ? -1 : 1);
  }

  function onKey(e: KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey;
    const k = e.key.toLowerCase();
    if (mod && k === "s") {
      e.preventDefault();
      if (view === "edit" && dirty && !saving) save();
      return;
    }
    if (previewing) {
      if (k === "escape") setPreviewing(false);
      return;
    }
    if (view !== "edit") return;
    const typing = (e.target as HTMLElement | null)?.closest("input, textarea, select, [contenteditable='true'], [role='dialog'], [role='alertdialog']");
    if (typing) return; // leave native text editing (and dialogs) alone
    if (mod && k === "z") {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    } else if (mod && k === "y") {
      e.preventDefault();
      redo();
    } else if (mod && (k === "c" || k === "x")) {
      if (copySelection()) {
        e.preventDefault();
        if (k === "x") deleteSelection();
      }
    } else if (mod && k === "v") {
      if (clip.current) {
        e.preventDefault();
        pasteClipboard();
      }
    } else if (mod && k === "d") {
      e.preventDefault();
      if (copySelection()) pasteClipboard();
    } else if ((k === "delete" || k === "backspace") && hasSelection) {
      e.preventDefault();
      deleteSelection();
    } else if (k === "escape") {
      setSel({ section: null, block: null });
      setSelDecor(null);
      setSelKind(null);
      setLeftOpen(false);
    } else if (k.startsWith("arrow") && hasSelection) {
      const step = e.shiftKey ? 2 : 0.5;
      const dx = k === "arrowleft" ? -step : k === "arrowright" ? step : 0;
      const dy = k === "arrowup" ? -step : k === "arrowdown" ? step : 0;
      if (selKind === "sticker" || e.altKey) {
        e.preventDefault();
        nudge(dx, dy);
      }
    } else if (e.key === "?") {
      setHelpOpen(true);
    }
  }
  const keyRef = useRef(onKey);
  useEffect(() => {
    keyRef.current = onKey; // always call the latest handler
  });
  useEffect(() => {
    const f = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);

  const stickerInfo = selKind === "sticker" && curDecor ? { section: curDecor.section, flip: curDecor.flip, rotate: curDecor.rotate, size: curDecor.size } : null;
  const display = applyName(s);

  const layer = (id: string) => (
    <DragLayer
      items={display.decorations.filter((d) => d.section === id)}
      selected={selDecor}
      onPathEnd={(did, x, y) => setS((prev) => ({ ...prev, decorations: prev.decorations.map((d) => (d.id === did ? { ...d, path: { ...d.path, x, y } } : d)) }))}
      onSelect={(did) => {
        setSelDecor(did);
        setSelKind("sticker");
        setStickerPanel(true);
        setSel({ section: id, block: null });
        setLeftOpen(true);
      }}
      onChange={(did, patch) => setS((prev) => ({ ...prev, decorations: prev.decorations.map((d) => (d.id === did ? { ...d, ...patch } : d)) }))}
      onRemove={(did) => {
        setS((prev) => ({ ...prev, decorations: prev.decorations.filter((d) => d.id !== did) }));
        setSelDecor(null);
      }}
      onMove={(did, x, y) => setS((prev) => ({ ...prev, decorations: prev.decorations.map((d) => (d.id === did ? { ...d, x, y } : d)) }))}
      draggingRef={dragging}
    />
  );

  const hasRsvp = s.sections.some((x) => x.blocks.some((b) => b.type === "rsvp"));
  const stickersFull = s.decorations.length >= MAX_DECORATIONS;
  const target = curSection ?? s.sections[0];

  /** a ready-made section: heading, short text and a map */
  function addMapSection() {
    if (s.sections.length >= MAX_SECTIONS) return setMsg({ ok: false, text: "Too many sections." });
    const sid = nextId("s", s.sections.map((x) => x.id));
    const used = s.sections.flatMap((x) => x.blocks.map((b) => b.id));
    const mk = (type: BlockType, patch: Partial<Block>) => {
      const id = nextId("b", used);
      used.push(id);
      return { ...newBlock(type, id), ...patch };
    };
    const map = mk("map", {});
    const sec: Section = {
      id: sid,
      name: "Map",
      bg: "cream",
      bgColor: "",
      hidden: false,
      effect: "none",
      card: false,
      wide: false,
      pad: "lg",
      blocks: [mk("heading", { text: "Find us" }), mk("text", { text: "Directions and parking tips for getting here.", size: "lg", tone: "soft" }), map],
    };
    setS((prev) => {
      const list = [...prev.sections];
      list.splice(curSection ? list.findIndex((x) => x.id === curSection.id) + 1 : list.length, 0, sec);
      return { ...prev, sections: list };
    });
    setSel({ section: sid, block: map.id });
    setSelKind("block");
    setElementPanel(true);
    setFresh({ kind: "block", id: map.id, snapshot: JSON.stringify(map) });
  }

  /** an element tool for the strip: icon with its label underneath (showLabel) instead of a tooltip */
  const miniTool = (type: BlockType | "sticker", showLabel = true) => {
    const sticker = type === "sticker";
    const meta = sticker ? { Icon: Sticker, label: "Sticker" } : PALETTE.find((p) => p.type === type)!;
    const disabled = sticker ? stickersFull : type === "rsvp" && hasRsvp;
    return (
      <div
        key={type}
        className="overflow-hidden rounded-xl"
        draggable={!disabled}
        onDragStart={(e) => {
          drag.current = sticker ? { kind: "sticker" } : { kind: "new", type };
          e.dataTransfer.setData("text/plain", type);
          e.dataTransfer.effectAllowed = "copy";
          // the browser's own drag picture has square white corners; hand it a rounded copy instead
          const tile = e.currentTarget.firstElementChild as HTMLElement | null;
          if (tile) {
            const { width, height } = tile.getBoundingClientRect();
            const ghost = tile.cloneNode(true) as HTMLElement;
            Object.assign(ghost.style, { position: "fixed", top: "-1000px", left: "-1000px", width: `${width}px`, height: `${height}px`, borderRadius: "14px", background: "#ffffff", border: "1.5px solid #2563eb", overflow: "hidden", pointerEvents: "none" });
            document.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, width / 2, height / 2);
            setTimeout(() => ghost.remove(), 0);
          }
        }}
        onDragEnd={() => (drag.current = null)}
      >
        <button
          type="button"
          disabled={disabled}
          aria-label={meta.label}
          title={disabled ? (sticker ? "Sticker limit reached" : "The page already has an RSVP form") : undefined}
          onClick={() => (sticker ? addSticker({}) : target && actions.addBlock(type, target.id, target.blocks.length))}
          className={`group flex cursor-grab flex-col items-center justify-center gap-1 rounded-xl border border-border bg-surface-muted text-soft active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 ${showLabel ? "min-h-[3.6rem] w-16 px-1 py-2" : "h-9 w-9"}`}
        >
          <meta.Icon size={19} strokeWidth={1.75} className={TOOL_TONE[type]} />
          {showLabel && <span className="text-center text-[10px] font-medium leading-tight">{meta.label}</span>}
        </button>
      </div>
    );
  };

  /** Done keeps everything; ✕ keeps it too — unless the element was only just added and is still untouched, then it is taken back out */
  const justAddedBlock = !!curBlock && fresh?.kind === "block" && fresh.id === curBlock.id;
  const justAddedSticker = !!curDecor && fresh?.kind === "sticker" && fresh.id === curDecor.id;
  const untouched = (item: object | undefined) => !!fresh && JSON.stringify(item) === fresh.snapshot;

  function closeElementPanel(cancel: boolean) {
    if (cancel && justAddedBlock && curBlock && untouched(curBlock)) actions.removeBlock(curBlock.id);
    if (justAddedBlock) setFresh(null);
    setElementPanel(false);
  }
  function closeStickerPanel(cancel: boolean) {
    if (cancel && justAddedSticker && curDecor && untouched(curDecor)) {
      setS((prev) => ({ ...prev, decorations: prev.decorations.filter((d) => d.id !== curDecor.id) }));
      setSelDecor(null);
    }
    if (justAddedSticker) setFresh(null);
    setStickerPanel(false);
  }

  /** a plain button for the strip: icon with its label underneath (showLabel) */
  const stripButton = (label: string, Icon: LucideIcon, onClick: () => void, active = false, showLabel = true) => (
    <button
      key={label}
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl border ${showLabel ? "min-h-[3.6rem] w-16 px-1 py-2" : "h-9 w-9"} ${
        active ? "border-fg bg-fg text-surface shadow-md" : "border-border bg-surface-muted text-soft"
      }`}
    >
      <Icon size={19} strokeWidth={1.75} className={active ? undefined : TOOL_TONE[label]} />
      {showLabel && <span className="text-center text-[10px] font-medium leading-tight">{label}</span>}
    </button>
  );

  // Event & theme, Preview and Save: in the header, or (phones, edit view) floating above the "Content" bar
  const actionButtons = (parts: ("theme" | "view" | "save")[], compact = false, slot = "header") => (
    <>
      {parts.includes("theme") && view === "edit" && (
        <Popover
          transition="blur"
          transitionDelay={60}
          open={themeOpen === slot}
          onOpenChange={(o) => setThemeOpen(o ? slot : null)}
          position="bottom"
          classNames={{ panel: "fixed inset-x-0 mx-auto sm:inset-x-auto sm:mx-0 sm:left-4 sm:right-auto top-14 sm:top-16 w-[min(92vw,360px)] translate-x-0 z-50 p-5 shadow-xl max-h-[calc(100dvh-4.5rem)] overflow-y-auto" }}
          content={
            <>
              <div className="-mt-2 mb-2 flex items-center justify-between sm:hidden">
                <span className="text-xs font-bold uppercase tracking-wide text-soft">Event &amp; theme</span>
                <Button variant="ghost" size="sm" icon="x" iconOnly aria-label="Close event and theme" onClick={() => setThemeOpen(null)} />
              </div>
              <ThemeTool s={s} setS={setS} onPickType={setPendingType} />
            </>
          }
        >
          <Tooltip content="Event & theme" position="bottom" classNames={{ bubble: compact ? "" : "hidden" }}>
            <Button size="sm" shape="pill" aria-label="Event and theme" className={`font-semibold shadow-sm ${compact ? "px-2" : "max-sm:px-2.5 max-sm:text-xs"}`}>
              <CalendarDays size={15} className={compact ? "" : "mr-1"} /> <span className={compact ? "hidden" : ""}>Event &amp; theme</span> <ChevronDown size={14} className={`ml-1 opacity-70 ${compact ? "hidden" : "max-sm:hidden"}`} />
            </Button>
          </Tooltip>
        </Popover>
      )}
      {parts.includes("view") && <Tooltip content="Preview — the page as visitors will see it, including unsaved changes" position="bottom" classNames={{ bubble: compact ? "" : "hidden" }}>
        <Button size="sm" shape="pill" icon="eye" aria-label="Preview" className={`font-semibold shadow-sm ${compact ? "px-2" : "max-sm:px-2.5 max-sm:text-xs"}`} onClick={() => setPreviewing(true)}><span className={compact ? "hidden" : ""}>Preview</span></Button>
      </Tooltip>}
      {parts.includes("save") && view === "edit" && (
        <Tooltip content="Save changes — publish to the live site" position="bottom" classNames={{ bubble: compact ? "" : "hidden" }}>
          <Button size="sm" icon="save" aria-label="Save changes" shape="pill" className={compact ? "px-2" : "max-sm:px-2.5 max-sm:text-xs"} animation={dirty ? "particles" : undefined} loading={saving} disabled={saving || !dirty} onClick={save}>
            <span className={compact ? "hidden" : ""}>Save changes</span>
          </Button>
        </Tooltip>
      )}
    </>
  );

  const layerSection = curSection ?? s.sections[0];
  const confirmSection = s.sections.find((x) => x.id === confirmDelete);

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden bg-surface-muted text-fg">
        <header className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2 text-xs sm:gap-3 sm:px-5 sm:py-3">
          <h1 className="mr-1 text-xs font-semibold sm:mr-3 sm:text-sm tracking-tight">
            Admin<span className="ml-2 font-normal text-soft max-sm:hidden">Page editor</span>
          </h1>
          <ButtonGroup shape="pill">
            <SegmentButton active={view === "edit"} icon="palette" onClick={() => setView("edit")}>Edit page</SegmentButton>
            <SegmentButton active={view === "rsvps"} icon="users" onClick={() => setView("rsvps")}>RSVPs</SegmentButton>
          </ButtonGroup>
          {/* phones: on the first row, at the right end, level with the RSVPs tab */}
          <UserMenu transition="blur" transitionDelay={60} className="ml-auto sm:hidden" name="Admin" avatarInitials="A" items={[{ label: "Log out", danger: true }]} onItemSelect={() => logout()} />
          <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-end sm:ml-auto">
            <Tooltip content="Undo (Ctrl/⌘ Z)" position="bottom" className="max-sm:hidden">
              <Button variant="ghost" size="sm" className="px-2" aria-label="Undo" disabled={hist.past === 0 || view !== "edit"} onClick={undo}><Undo2 size={16} /></Button>
            </Tooltip>
            <Tooltip content="Redo (Ctrl/⌘ Shift Z)" position="bottom" className="max-sm:hidden">
              <Button variant="ghost" size="sm" className="px-2" aria-label="Redo" disabled={hist.future === 0 || view !== "edit"} onClick={redo}><Redo2 size={16} /></Button>
            </Tooltip>
            <Tooltip content="Keyboard shortcuts (?)" position="bottom" className="max-sm:hidden">
              <Button variant="ghost" size="sm" className="px-2" aria-label="Keyboard shortcuts" onClick={() => setHelpOpen(true)}><Keyboard size={16} /></Button>
            </Tooltip>
            {dirty && <Badge variant="soft" color="amber" dot>Unsaved changes</Badge>}
            <UserMenu transition="blur" transitionDelay={60} className="max-sm:hidden" name="Admin" avatarInitials="A" items={[{ label: "Log out", danger: true }]} onItemSelect={() => logout()} />
          </div>
          {/* own row below lg: Event & theme and Preview on the left, Save on the right */}
          <div className={`flex w-full items-center justify-between gap-2 ${view === "edit" ? "lg:hidden" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">{actionButtons(["theme", "view"])}</div>
            <div className="flex items-center">{actionButtons(["save"])}</div>
          </div>
        </header>

        {view === "rsvps" ? (
          <div className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-4xl">
              <Card variant="elevated" padding="lg">
                <RsvpList />
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <AnimatePresence initial={false}>
              {leftOpen && curSection && (
                <motion.aside
                  key="section-settings"
                  initial={{ width: isLg ? 0 : "100%", height: isLg ? "auto" : 0, opacity: 0 }}
                  animate={{ width: isLg ? 290 : "100%", height: "auto", opacity: 1 }}
                  exit={{ width: isLg ? 0 : "100%", height: isLg ? "auto" : 0, opacity: 0 }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  className="max-h-[45vh] shrink-0 overflow-hidden border-b border-border bg-surface lg:max-h-none lg:border-b-0 lg:border-r"
                >
                    <div className="h-full w-full overflow-auto lg:w-[290px]">
                      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 py-3.5 backdrop-blur">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fg text-surface shadow-sm">
                            <Layers size={17} />
                          </span>
                          <div className="grid min-w-0 gap-1">
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soft">Section settings</p>
                            {/* same blue as the section's label in the preview, so the two read as one thing */}
                            <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-[#2563eb] px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                              <span className="truncate">{curSection.name || "Section"}</span>
                              {curSection.hidden && <span className="shrink-0 font-normal opacity-80">· hidden</span>}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center">
                          <button
                            type="button"
                            aria-expanded={settingsOpen}
                            aria-label={settingsOpen ? "Collapse section settings" : "Expand section settings"}
                            onClick={() => setSettingsOpen((o) => !o)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-soft hover:bg-surface-muted hover:text-fg lg:hidden"
                          >
                            <ChevronDown size={16} className={`transition-transform ${settingsOpen ? "" : "-rotate-90"}`} />
                          </button>
                          <Button variant="ghost" size="sm" icon="x" iconOnly aria-label="Close section settings" onClick={() => setLeftOpen(false)} />
                        </div>
                      </div>
                      <div className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${settingsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] lg:grid-rows-[1fr]"}`}>
                        <div className={`min-h-0 overflow-hidden transition-[visibility] duration-300 ${settingsOpen ? "" : "max-lg:invisible"}`}>
                          <div className="grid gap-6 p-4">
                            <div id="left-section" className="scroll-mt-16">
                              <SectionEditor sec={curSection} set={(p) => updateSection(curSection.id, p)} remove={() => setConfirmDelete(curSection.id)} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                </motion.aside>
              )}
            </AnimatePresence>
              <div
                ref={previewRef}
                className="min-h-0 min-w-0 flex-1 overflow-auto bg-surface-muted p-6 lg:pt-2"
                onClickCapture={onPreviewClick}
                onSubmitCapture={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {/* large screens: an oval bar of page actions above the page */}
                <div data-action className="fx-invert sticky top-0 z-30 mb-3 mx-auto hidden max-w-[1100px] justify-between lg:flex">
                  <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1.5 shadow-md">{actionButtons(["theme", "view"], false, "bar")}</div>
                  <div className="flex items-center rounded-full border border-border bg-surface px-2.5 py-1.5 shadow-md">{actionButtons(["save"])}</div>
                </div>
                {/* only this preview takes the site theme — the admin UI itself stays as it is */}
                <ThemeProvider isolated mode={s.theme.mode} accent={s.theme.accent} design={s.theme.design}>
                  <div data-font={s.theme.font} className={`editing ${sel.section ? "has-selection" : ""} page-bg mx-auto max-w-[1100px] overflow-x-clip rounded-2xl pt-1 text-fg ring-1 ring-border`}>
                    <PageView s={display} edit={{ selected: sel, layer, actions, sticker: stickerInfo }} />
                  </div>
                </ThemeProvider>
              </div>

            {/* always-visible list of everything added to the selected section */}
            <aside className="max-h-56 w-full shrink-0 overflow-y-auto overscroll-contain border-t border-border bg-surface lg:max-h-none lg:w-[176px] lg:border-l lg:border-t-0">
              <button
                type="button"
                aria-expanded={addedOpen}
                onClick={() => setAddedOpen((o) => !o)}
                className={`sticky top-0 z-10 flex h-11 w-full shrink-0 items-center gap-3 bg-surface/95 px-3 text-left backdrop-blur lg:h-[65px] lg:cursor-default ${addedOpen ? "border-b border-border" : "max-lg:border-b-0"} lg:border-b lg:border-border`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2 lg:justify-center">
                  <span className="inline-flex w-fit max-w-full items-center gap-2 rounded-full bg-[#2563eb] px-3.5 py-1 text-sm font-bold text-white shadow-sm">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
                    <span className="truncate">{layerSection ? `${layerSection.name || "Untitled"} section` : "—"}</span>
                  </span>
                </div>
                {layerSection && <Badge variant="soft" size="xs" color="blue" className="lg:hidden">{layerSection.blocks.length + s.decorations.filter((d) => d.section === layerSection.id).length}</Badge>}
                <ChevronDown size={16} className={`shrink-0 text-soft transition-transform lg:hidden ${addedOpen ? "" : "-rotate-90"}`} aria-hidden />
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${addedOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] lg:grid-rows-[1fr]"}`}>
              <div className={`min-h-0 overflow-hidden transition-[visibility] duration-300 ${addedOpen ? "" : "max-lg:invisible"}`}>
              <div className="p-3">
              <span className="mb-2 inline-flex w-fit max-w-full items-center gap-2 rounded-full bg-ink px-3.5 py-1 text-sm font-bold text-white shadow-sm">
                <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
                <span className="truncate">Content</span>
              </span>
              {layerSection ? (
                <ElementList
              section={layerSection}
              stickers={s.decorations.filter((d) => d.section === layerSection.id)}
              selBlock={sel.block}
              selSticker={selKind === "sticker" ? selDecor : null}
              onReorder={(blocks) => updateSection(layerSection.id, { blocks })}
              onPickBlock={(id) => {
                setSel({ section: layerSection.id, block: id });
                setSelKind("block");
                setElementPanel(true);
                previewRef.current?.querySelector(`[data-block="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              onPickSticker={(id) => {
                setSel({ section: layerSection.id, block: null });
                setSelDecor(id);
                setSelKind("sticker");
                setStickerPanel(true);
                previewRef.current?.querySelector(`[data-decor="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              onDeleteBlock={(id) => actions.removeBlock(id)}
              onDeleteSticker={(id) => {
                setS((prev) => ({ ...prev, decorations: prev.decorations.filter((d) => d.id !== id) }));
                if (selDecor === id) setSelDecor(null);
              }}
            />
              ) : (
                <p className="text-xs text-soft">Select a section to see its elements.</p>
              )}
              </div>
              </div>
              </div>
            </aside>

            {/* the toolbox is a permanent icon strip: click or drag a tool; settings open in floating panels */}
            <aside className="max-h-24 w-full shrink-0 overflow-hidden border-t border-border bg-surface lg:max-h-none lg:flex lg:w-[84px] lg:flex-col lg:border-l lg:border-t-0">
              <div className="hidden h-[65px] shrink-0 flex-col items-center justify-center gap-1.5 border-b border-border bg-gradient-to-b from-surface-muted to-surface px-2 lg:flex">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-fg text-surface shadow-sm"><Wrench size={12} /></span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg">Toolbox</p>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto p-2 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:py-3">
                {GROUPS.map((g, i) => (
                  <Fragment key={g.title}>
                    {i > 0 && <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-border lg:mx-0 lg:my-1 lg:h-px lg:w-6" />}
                    {g.types.map((t) => (
                      <span key={t} className="shrink-0">{miniTool(t)}</span>
                    ))}
                  </Fragment>
                ))}
                <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-border lg:mx-0 lg:my-1 lg:h-px lg:w-6" />
                {stripButton("Text stickers", Sparkles, () => setStickersPanel((o) => !o), stickersPanel)}
                {stripButton("New section", Plus, () => actions.addSection(curSection ? s.sections.indexOf(curSection) + 1 : s.sections.length))}
                {stripButton("New map", MapPin, addMapSection)}
              </div>
            </aside>
          </div>
        )}

        {previewing && (
          <div className="fixed inset-0 z-50 overflow-auto bg-surface-muted">
            <div className="sticky top-0 z-[60] flex items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 py-2 backdrop-blur">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="soft" size="sm">Preview</Badge>
                <span className="text-soft">{dirty ? "Includes your unsaved changes" : "Matches the live page"}</span>
              </div>
              <div className="flex items-center gap-2">
                <a href="/" target="_blank">
                  <Button variant="ghost" size="sm">Open live page ↗</Button>
                </a>
                <Button size="sm" icon="x" onClick={() => setPreviewing(false)}>Back to editor</Button>
              </div>
            </div>
            <ThemeProvider isolated mode={s.theme.mode} accent={s.theme.accent} design={s.theme.design}>
              <div
                data-font={s.theme.font}
                className="page-bg min-h-screen text-fg"
                onSubmitCapture={(e) => {
                  e.preventDefault(); // the form is only a preview here — nothing is sent
                  e.stopPropagation();
                }}
              >
                <PageView s={display} />
              </div>
            </ThemeProvider>
          </div>
        )}

        {stickerPanel && selKind === "sticker" && curDecor && !previewing && <Connector panel="sticker" selector={`[data-decor="${curDecor.id}"]`} />}
        <AnimatePresence>
        {stickerPanel && selKind === "sticker" && curDecor && !previewing && (
          <FloatingPanel key="sticker" panelId="sticker" title={`Edit ${KIND_LABEL[curDecor.kind].toLowerCase()}`} onClose={() => closeStickerPanel(true)} onDone={() => closeStickerPanel(false)} closeHint={justAddedSticker && untouched(curDecor) ? "Cancel — removes the sticker you just added" : "Close"}>
            <StickerEditor
              cur={curDecor}
              update={(patch) => setS((prev) => ({ ...prev, decorations: prev.decorations.map((d) => (d.id === curDecor.id ? { ...d, ...patch } : d)) }))}
            />
          </FloatingPanel>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {stickersPanel && !previewing && (
          <FloatingPanel key="stickers" panelId="stickers" title="Text stickers" onClose={() => setStickersPanel(false)} onDone={() => setStickersPanel(false)}>
            <DecorTools
              section={(curSection ?? s.sections[0])?.id ?? ""}
              s={s}
              setS={setS}
              sel={selDecor}
              onNew={(d) => setFresh({ kind: "sticker", id: d.id, snapshot: JSON.stringify(d) })}
              setSel={(id) => {
                setSelDecor(id);
                if (id) {
                  setSelKind("sticker");
                  setStickerPanel(true);
                }
              }}
            />
          </FloatingPanel>
        )}
        </AnimatePresence>

        {elementPanel && curBlock && !previewing && <Connector panel="element" selector={`[data-block="${curBlock.id}"]`} />}
        <AnimatePresence>
        {rsvpPartKey && curBlock?.type === "rsvp" && !previewing && (
          <FloatingPanel key="rsvppart" panelId="rsvppart" title={`Form piece: ${RSVP_PART_META[rsvpPartKey].label}`} onClose={() => setRsvpPartKey(null)} onDone={() => setRsvpPartKey(null)}>
            <RsvpPartEditor b={curBlock} partKey={rsvpPartKey} set={(p) => updateBlock(curBlock.id, p)} onRemoved={() => setRsvpPartKey(null)} />
          </FloatingPanel>
        )}
        </AnimatePresence>

        {rsvpPartKey && curBlock?.type === "rsvp" && !previewing && <Connector panel="rsvppart" selector={`[data-rsvp-part="${rsvpPartKey}"]`} />}

        <AnimatePresence>
        {elementPanel && curBlock && !previewing && (
          <FloatingPanel key="element" panelId="element" title={`Element: ${PALETTE.find((p) => p.type === curBlock.type)?.label ?? curBlock.type}`} onClose={() => closeElementPanel(true)} onDone={() => closeElementPanel(false)} closeHint={justAddedBlock && untouched(curBlock) ? "Cancel — removes the element you just added" : "Close"}>
            <BlockEditor b={curBlock} set={(p) => updateBlock(curBlock.id, p)} remove={() => actions.removeBlock(curBlock.id)} setMsg={setMsg} onEditPart={(k) => { setRsvpPartKey(k); }} />
          </FloatingPanel>
        )}
        </AnimatePresence>

        <Toast
          open={!!msg}
          onClose={() => setMsg(null)}
          variant={msg?.ok ? "success" : "error"}
          position="bottom-center"
          duration={3500}
        >
          {msg?.text}
        </Toast>

        <AlertDialog
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
          title="Keyboard shortcuts"
          description={
            <span className="mt-2 grid gap-1.5 text-left">
              {SHORTCUTS.map(([keys, what]) => (
                <span key={keys} className="flex items-baseline justify-between gap-4">
                  <kbd className="rounded-md border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[11px]">{keys}</kbd>
                  <span className="text-right text-xs">{what}</span>
                </span>
              ))}
            </span>
          }
          confirmLabel="Got it"
          onConfirm={() => setHelpOpen(false)}
        />
        <AlertDialog
          open={!!pendingType}
          onClose={() => setPendingType(null)}
          title={`Use the ${pendingType ? EVENT_PRESETS[pendingType].label : ""} text?`}
          description="This rewrites the hero, event details, schedule, RSVP and footer text for this type of event. Your layout, colours, images and stickers are kept, and you can still edit everything afterwards."
          confirmLabel="Generate text"
          onConfirm={() => {
            if (pendingType) setS((prev) => applyPreset(prev, pendingType));
            setPendingType(null);
          }}
        />
        <AlertDialog
          open={!!confirmSection}
          onClose={() => setConfirmDelete(null)}
          variant="destructive"
          title={`Delete “${confirmSection?.name ?? ""}”?`}
          description="This removes the section with all its elements and stickers. You can still undo by reloading before you save."
          confirmLabel="Delete section"
          onConfirm={() => {
            if (confirmDelete) deleteSection(confirmDelete);
            setConfirmDelete(null);
          }}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

const FONT_OPTIONS = [
  ["playful", "Playful — Nunito & Fredoka"],
  ["modern", "Modern — Inter & Poppins"],
  ["elegant", "Elegant — Lora & Playfair Display"],
  ["bold", "Bold — DM Sans & Space Grotesk"],
] as const;

function ThemeTool({ s, setS, onPickType }: { s: Settings; setS: React.Dispatch<React.SetStateAction<Settings>>; onPickType: (t: EventType) => void }) {
  const set = (p: Partial<Settings["theme"]>) => setS((prev) => ({ ...prev, theme: { ...prev.theme, ...p } }));
  return (
    <div className="grid gap-5">
      <div className="grid gap-1.5">
        <SelectField label="Event type" value={s.eventType} options={EVENT_TYPE_OPTIONS} onChange={(t) => t !== s.eventType && onPickType(t)} />
        <p className="text-xs text-soft">Pick a type to generate ready-made text and sentences for it.</p>
      </div>
      <div className="grid gap-2">
        <TextField
          label="Event name — use {name} in any text"
          value={s.name}
          placeholder={`Enter the real name, e.g. ${EVENT_PRESETS[s.eventType].nameHint}`}
          maxLength={60}
          onChange={(v) => setS((prev) => ({ ...prev, name: v }))}
        />
        {isPlaceholderName(s.name) && (
          <Alert variant="warning" icon={false}>
            Add the real event name. It replaces <b>{"{name}"}</b> across the page, and visitors will see “[Event name]” until you do.
          </Alert>
        )}
      </div>
      <ColorField
        label="Theme"
        value={/^#[0-9a-fA-F]{6}$/.test(s.theme.accent) ? s.theme.accent : "#18181b"}
        presets={["#18181b", "#0f172a", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#0ea5e9"]}
        onChange={(accent) => set({ accent })}
      />
      <SwitchField label="Dark mode" checked={s.theme.mode === "dark"} onChange={(dark) => set({ mode: dark ? "dark" : "light" })} />
      <SelectField label="Font style" value={s.theme.font} options={FONT_OPTIONS} onChange={(font) => set({ font })} />
      <p className="text-xs text-soft">The accent colour, mode and font style restyle the whole site, and every lojee-ui component on it.</p>
    </div>
  );
}

/** a small labelled group in the section settings */
function Group({ label, Icon, children }: { label: string; Icon: LucideIcon; children: React.ReactNode }) {
  return (
    <section className="grid gap-3">
      <h3 className="flex items-center gap-1.5 border-b border-border pb-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-soft">
        <Icon size={13} />
        {label}
      </h3>
      {children}
    </section>
  );
}

function SectionEditor({ sec, set, remove }: { sec: Section; set: (p: Partial<Section>) => void; remove: () => void }) {
  return (
    <div className="grid gap-6">
      <Group label="General" Icon={SlidersHorizontal}>
        <TextField label="Name (admin only)" value={sec.name} maxLength={60} onChange={(name) => set({ name })} />
        <SwitchField label="Hide this section on the site" checked={sec.hidden} onChange={(hidden) => set({ hidden })} />
      </Group>

      <Group label="Background" Icon={Palette}>
        <SelectField label="Preset" value={sec.bg} options={BG_OPTIONS} onChange={(bg) => set({ bg })} />
        <SelectField
          label="Effect"
          value={sec.effect}
          options={[
            ["none", "None"],
            ["balloons", "Balloons rising"],
            ["hearts", "Hearts floating up"],
            ["bubbles", "Bubbles rising"],
            ["stars", "Twinkling stars"],
            ["fireflies", "Fireflies"],
            ["snow", "Snow falling"],
            ["rain", "Rain"],
            ["confetti", "Confetti falling"],
            ["graffiti", "Graffiti falling & fading"],
          ]}
          onChange={(effect) => set({ effect })}
        />
        <div className="grid gap-3 rounded-xl border border-border p-3">
          <SwitchField label="Custom colour" checked={!!sec.bgColor} onChange={(on) => set({ bgColor: on ? "#f4f4f5" : "" })} />
          {sec.bgColor ? (
            <>
              <ColorField
                label="Colour"
                value={sec.bgColor}
                presets={["#ffffff", "#f4f4f5", "#18181b", "#fef3c7", "#fce7f3", "#dbeafe", "#dcfce7", "#ef4444", "#6366f1", "#0ea5e9"]}
                onChange={(bgColor) => set({ bgColor })}
              />
              <Button variant="outline" size="xs" className="justify-self-start" onClick={() => set({ bgColor: "" })}>
                <Undo2 size={14} className="mr-1" />
                Back to the original background
              </Button>
            </>
          ) : (
            <p className="text-xs text-soft">Using the preset above.</p>
          )}
        </div>
      </Group>

      <Group label="Layout" Icon={LayoutTemplate}>
        <SelectField label="Spacing" value={sec.pad} options={[["sm", "Small"], ["md", "Medium"], ["lg", "Large"]]} onChange={(pad) => set({ pad })} />
        <SwitchField label="Rounded card style" checked={sec.card} onChange={(card) => set({ card })} />
        <SwitchField label="Wide content (use more of the page width)" checked={sec.wide} onChange={(wide) => set({ wide })} />
      </Group>

      <div className="border-t border-border pt-5">
        <Button variant="destructive-outline" size="sm" shape="pill" icon="trash-2" className="w-full font-semibold" onClick={remove}>
          Delete section
        </Button>
      </div>
    </div>
  );
}

const RSVP_ICON_BTN = "flex h-7 w-7 items-center justify-center rounded-lg text-soft hover:bg-surface-muted hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-soft";

/** the RSVP form pieces (resolved, so any missing one is included) and how to change or reorder them */
function rsvpPartOps(b: Block, set: (p: Partial<Block>) => void) {
  const parts = resolveRsvpParts(b.parts);
  return {
    parts,
    setPart: (key: RsvpPartKey, patch: Partial<RsvpPart>) => set({ parts: parts.map((p) => (p.key === key ? { ...p, ...patch } : p)) }),
    move: (key: RsvpPartKey, d: number) => {
      const a = [...parts];
      const i = a.findIndex((p) => p.key === key);
      if (i < 0 || i + d < 0 || i + d >= a.length) return;
      [a[i], a[i + d]] = [a[i + d], a[i]];
      set({ parts: a });
    },
  };
}

/** The floating settings for one piece of the RSVP form: where it sits, how big it is, and its own text. */
function RsvpPartEditor({ b, partKey, set, onRemoved }: { b: Block; partKey: RsvpPartKey; set: (p: Partial<Block>) => void; onRemoved: () => void }) {
  const { parts, setPart, move } = rsvpPartOps(b, set);
  const i = parts.findIndex((p) => p.key === partKey);
  const p = parts[i];
  const meta = RSVP_PART_META[partKey];
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-fg-muted">Position</span>
        <div className="flex items-center gap-1">
          <button type="button" className={RSVP_ICON_BTN} aria-label="Move up" title="Move up" disabled={i === 0} onClick={() => move(partKey, -1)}><ArrowUp size={14} /></button>
          <button type="button" className={RSVP_ICON_BTN} aria-label="Move down" title="Move down" disabled={i === parts.length - 1} onClick={() => move(partKey, 1)}><ArrowDown size={14} /></button>
        </div>
      </div>
      <SwitchField label={meta.required ? "Shown (the form needs this)" : "Show this piece"} checked={!p.hidden} onChange={(show) => !meta.required && setPart(partKey, { hidden: !show })} />
      <div className="grid grid-cols-3 gap-2">
        <SelectField label="Size" value={p.size} options={SIZE_OPTIONS} onChange={(size) => setPart(partKey, { size })} />
        <SelectField label="Align" value={p.align} options={[["left", "Left"], ["center", "Center"], ["right", "Right"]]} onChange={(align) => setPart(partKey, { align })} />
        <SelectField label="Width" value={p.width} options={[["half", "Half"], ["full", "Full"], ["fit", "Fit"]]} onChange={(width) => setPart(partKey, { width })} />
      </div>
      {RSVP_FIELDS.some((f) => f.group === partKey) && (
        <div className="grid gap-3 border-t border-border pt-3">
          <span className="text-xs font-bold uppercase tracking-wide text-fg-muted">Text</span>
          {RSVP_FIELDS.filter((f) => f.group === partKey).map((f) => (
            <TextField key={f.key} label={f.label} value={b.labels[f.key] ?? ""} placeholder={f.def} long={"long" in f} maxLength={300} onChange={(v) => set({ labels: { ...b.labels, [f.key]: v } })} />
          ))}
          <p className="text-xs text-soft">Leave a field empty to use the standard text.</p>
        </div>
      )}
      <div className="grid gap-1.5 border-t border-border pt-3">
        <Button
          variant="destructive-outline"
          size="sm"
          shape="pill"
          icon="trash-2"
          className="w-full font-semibold"
          disabled={meta.required}
          onClick={() => {
            setPart(partKey, { hidden: true });
            onRemoved();
          }}
        >
          Remove from form
        </Button>
        <p className="text-xs text-soft">{meta.required ? "The form can't work without this piece." : "Removed pieces can be added back from the RSVP element's list."}</p>
      </div>
    </div>
  );
}

function BlockEditor({ b, set, remove, setMsg, onEditPart }: { b: Block; set: (p: Partial<Block>) => void; remove: () => void; setMsg: (m: { ok: boolean; text: string }) => void; onEditPart?: (key: RsvpPartKey) => void }) {
  const t = (field: "text" | "text2" | "text3" | "url" | "icon", label: string, long = false) => (
    <TextField label={label} value={b[field]} long={long} onChange={(v) => set({ [field]: v })} />
  );
  const rsvp = rsvpPartOps(b, set);
  const sizeSel = (label = "Size") => <SelectField label={label} value={b.size} options={SIZE_OPTIONS} onChange={(size) => set({ size })} />;
  const toneSel = <SelectField label="Colour" value={b.tone} options={TONE_OPTIONS} onChange={(tone) => set({ tone })} />;

  return (
    <>
      <div className="grid gap-3">
        {b.type === "badge" && t("text", "Text")}
        {b.type === "heading" && (
          <>
            {t("text", "Text")}
            <div className="grid grid-cols-2 gap-2">{sizeSel()}{toneSel}</div>
            <SwitchField label="UPPERCASE" checked={b.caps} onChange={(caps) => set({ caps })} />
          </>
        )}
        {b.type === "text" && (
          <>
            {t("text", "Text", true)}
            <div className="grid grid-cols-2 gap-2">{sizeSel()}{toneSel}</div>
          </>
        )}
        {b.type === "script" && t("text", "Text")}
        {b.type === "button" && (
          <>
            {t("text", "Button text")}
            {t("url", "Link (#rsvp, or https://…)")}
            <SelectField
              label="Animation"
              value={b.text2 || "glow"}
              options={[["none", "None"], ...ANIMATED_VARIANTS.map((a) => [a, a.replace("-", " ").replace(/^./, (c) => c.toUpperCase())] as const)]}
              onChange={(text2) => set({ text2 })}
            />
          </>
        )}
        {b.type === "emoji" && (<>{t("text", "Emoji")}{sizeSel()}</>)}
        {b.type === "card" && (
          <>
            <SelectField label="Icon" value={b.icon} options={[["", "None"], ...ICON_OPTIONS]} onChange={(icon) => set({ icon })} />
            {t("text", "Title")}
            {t("text2", "Main line")}
            {t("text3", "Second line")}
            {t("url", "Link (optional, https://…)")}
          </>
        )}
        {b.type === "step" && (<>{t("text", "Time")}{t("text2", "Title")}{t("text3", "Description", true)}</>)}
        {b.type === "countdown" && (
          <>
            {t("text", "Label")}
            <TextField label="Counts down to" type="datetime-local" value={b.text2} onChange={(text2) => set({ text2 })} />
            <SelectField
              label="Text colour"
              value={b.tone === "white" ? "white" : "ink"}
              options={[["white", "Contrast (follows the background)"], ["ink", "Default"]]}
              onChange={(tone) => set({ tone })}
            />
          </>
        )}
        {b.type === "rsvp" && (
          <>
            {t("text", "Form title")}
            {t("text2", "Form subtitle", true)}
            <div className="grid gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-fg-muted">Form pieces</p>
              <p className="-mt-1 text-xs text-soft">Click a piece in the preview, or its Edit button, to open its own settings.</p>
              {rsvp.parts.map((p, i) => {
                const meta = RSVP_PART_META[p.key];
                return (
                  <div key={p.key} className={`flex items-center gap-1 rounded-xl border border-border py-1.5 pl-3 pr-1.5 ${p.hidden ? "bg-surface-muted/60" : ""}`}>
                    <span className={`flex-1 truncate text-sm font-semibold ${p.hidden ? "text-soft line-through" : ""}`}>{meta.label}</span>
                    <button type="button" className={RSVP_ICON_BTN} aria-label={`Move ${meta.label} up`} disabled={i === 0} onClick={() => rsvp.move(p.key, -1)}><ArrowUp size={14} /></button>
                    <button type="button" className={RSVP_ICON_BTN} aria-label={`Move ${meta.label} down`} disabled={i === rsvp.parts.length - 1} onClick={() => rsvp.move(p.key, 1)}><ArrowDown size={14} /></button>
                    {p.hidden ? (
                      <Button variant="ghost" size="sm" onClick={() => rsvp.setPart(p.key, { hidden: false })}>Add back</Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => onEditPart?.(p.key)}>Edit</Button>
                    )}
                  </div>
                );
              })}
            </div>
            <fieldset className="grid gap-3 rounded-xl border border-border p-3">
              <legend className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-soft">Thank-you message</legend>
              {RSVP_FIELDS.filter((f) => f.group === "done").map((f) => (
                <TextField key={f.key} label={f.label} value={b.labels[f.key] ?? ""} placeholder={f.def} long={"long" in f} maxLength={300} onChange={(v) => set({ labels: { ...b.labels, [f.key]: v } })} />
              ))}
              <p className="text-xs text-soft">Shown after someone sends the form. Leave empty to use the standard text.</p>
            </fieldset>
          </>
        )}
        {b.type === "divider" && t("text", "Label (optional)")}
        {b.type === "spacer" && sizeSel("Height")}
        {b.type === "image" && <ImageField b={b} set={set} setMsg={setMsg} />}
        {b.type === "gallery" && <GalleryField b={b} set={set} setMsg={setMsg} />}
        {b.type === "map" && <MapFields b={b} set={set} setMsg={setMsg} />}
        <Button variant="destructive-outline" size="sm" icon="trash-2" className="justify-self-start" onClick={remove}>
          Delete element
        </Button>
      </div>
    </>
  );
}

function ImageField({ b, set, setMsg }: { b: Block; set: (p: Partial<Block>) => void; setMsg: (m: { ok: boolean; text: string }) => void }) {
  return (
    <>
      {b.url && <Image src={b.url} alt={b.text} ratio="16/9" fit="cover" rounded="lg" />}
      <TextField label="Description (alt text)" value={b.text} onChange={(text) => set({ text })} />
      <SelectField label="Image size" value={b.size} options={[["sm", "Small"], ["md", "Medium"], ["lg", "Large"], ["xl", "Extra large"]]} onChange={(size) => set({ size })} />
      <FileUpload
        label={b.url ? "Replace image" : "Upload image"}
        accept="image/png,image/jpeg,image/webp,image/gif"
        onFilesSelected={async (files) => {
          const [url] = await uploadFiles(files, 1, (m) => setMsg({ ok: false, text: m }));
          if (url) set({ url });
        }}
      />
    </>
  );
}

/** Map settings: search an address (OpenStreetMap Nominatim) or type the coordinates. */
function MapFields({ b, set, setMsg }: { b: Block; set: (p: Partial<Block>) => void; setMsg: (m: { ok: boolean; text: string }) => void }) {
  const [busy, setBusy] = useState(false);
  const [lat = "", lng = ""] = b.text3.split(",").map((x) => x.trim());
  const setCoords = (la: string, lo: string) => set({ text3: la || lo ? `${la},${lo}` : "" });

  async function find() {
    if (!b.text2.trim()) return setMsg({ ok: false, text: "Type an address to search for first." });
    setBusy(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(b.text2)}`);
      const [hit] = (await res.json()) as { lat: string; lon: string; display_name: string }[];
      if (!hit) setMsg({ ok: false, text: "Couldn't find that address — try adding the city or country." });
      else {
        set({ text3: `${(+hit.lat).toFixed(6)},${(+hit.lon).toFixed(6)}` });
        setMsg({ ok: true, text: `Found: ${hit.display_name.slice(0, 70)}` });
      }
    } catch {
      setMsg({ ok: false, text: "The address search isn't reachable right now. Enter the coordinates instead." });
    }
    setBusy(false);
  }

  return (
    <>
      <TextField label="Title (shown on the pin)" value={b.text} onChange={(text) => set({ text })} />
      <TextField label="Address" value={b.text2} placeholder="e.g. 10 Downing Street, London" onChange={(text2) => set({ text2 })} />
      <Button variant="outline" size="sm" icon="map-pin" loading={busy} className="justify-self-start" onClick={find}>
        Find on map
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Latitude" value={lat} placeholder="51.5034" onChange={(v) => setCoords(v, lng)} />
        <TextField label="Longitude" value={lng} placeholder="-0.1276" onChange={(v) => setCoords(lat, v)} />
      </div>
      <div className="grid gap-2">
        <p className="text-xs font-bold uppercase tracking-wide">Pin avatar (optional)</p>
        {b.url && (
          <div className="flex items-center gap-3">
            <Image src={b.url} alt="" ratio="1/1" fit="cover" rounded="full" width={56} height={56} />
            <Button variant="outline" size="xs" onClick={() => set({ url: "" })}>Remove avatar</Button>
          </div>
        )}
        <FileUpload
          label={b.url ? "Replace avatar" : "Upload an avatar for the pin"}
          accept="image/png,image/jpeg,image/webp,image/gif"
          onFilesSelected={async (files) => {
            const [url] = await uploadFiles(files, 1, (m) => setMsg({ ok: false, text: m }));
            if (url) set({ url });
          }}
        />
        <p className="text-xs text-soft">Shown as a round picture in place of the pin.</p>
      </div>
      <SliderField label="Zoom" min={3} max={18} value={Number(b.icon) || 14} onChange={(v) => set({ icon: String(v) })} />
      <SelectField label="Height" value={b.size} options={[["sm", "Small"], ["md", "Medium"], ["lg", "Large"], ["xl", "Extra large"]]} onChange={(size) => set({ size })} />
    </>
  );
}

function GalleryField({ b, set, setMsg }: { b: Block; set: (p: Partial<Block>) => void; setMsg: (m: { ok: boolean; text: string }) => void }) {
  const images = b.images;
  const dnd = useReorder(images, (l) => set({ images: l }));
  return (
    <>
      <SelectField
        label="Picture size"
        value={b.size}
        options={[["sm", "Small — 5 per row"], ["md", "Medium — 3 per row"], ["lg", "Large — 2 per row"], ["xl", "Extra large — 1 per row"]]}
        onChange={(size) => set({ size })}
      />
      <p className="text-xs font-bold uppercase tracking-wide">Images ({images.length}/{MAX_IMAGES}) — drag ⠿ to reorder</p>
      <div className="grid grid-cols-2 gap-2">
        {images.map((img, i) => (
          <div key={img.url} {...dnd.row(i)}>
            <Card variant="outline" padding="sm">
              <Image src={img.url} alt={img.alt} ratio="1/1" fit="cover" rounded="lg" />
              <div className="mt-2 grid gap-2">
                <Input size="sm" placeholder="Description" value={img.alt} onChange={(e) => set({ images: images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)) })} />
                <div className="flex items-center justify-between">
                  <Grip {...dnd.handle(i)} />
                  <Button variant="ghost" size="xs" icon="trash-2" iconOnly aria-label="Remove image" onClick={() => set({ images: images.filter((_, j) => j !== i) })} />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
      {images.length < MAX_IMAGES && (
        <FileUpload
          label="Upload images"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif"
          onFilesSelected={async (files) => {
            const urls = await uploadFiles(files, MAX_IMAGES - images.length, (m) => setMsg({ ok: false, text: m }));
            if (urls.length) set({ images: [...images, ...urls.map((url) => ({ url, alt: "" }))] });
          }}
        />
      )}
      <p className="text-xs text-soft">PNG, JPG, WEBP or GIF, up to 5 MB each.</p>
    </>
  );
}

/* ---- stickers (free-positioned decorations) ---- */

function DragLayer({
  items,
  selected,
  onSelect,
  onMove,
  onPathEnd,
  onChange,
  onRemove,
  draggingRef,
}: {
  items: Decoration[];
  selected: string | null;
  onChange: (id: string, patch: Partial<Decoration>) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onPathEnd: (id: string, x: number, y: number) => void;
  draggingRef: React.RefObject<string | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sel = items.find((d) => d.id === selected);
  function move(e: RPointerEvent) {
    const id = draggingRef.current;
    if (!id || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = clamp(((e.clientX - r.left) / r.width) * 100);
    const y = clamp(((e.clientY - r.top) / r.height) * 100);
    if (id.startsWith("end:")) {
      const real = id.slice(4);
      if (items.some((d) => d.id === real)) onPathEnd(real, x, y);
    } else if (items.some((d) => d.id === id)) onMove(id, x, y);
  }

  // handles on the dashed frame: rotate, stretch on x / y, grow evenly, remove
  const handlesFor = (d: Decoration) => {
    const sx = d.sx ?? 1;
    const sy = d.sy ?? 1;
    const grab = (mode: "rot" | "x" | "y" | "size") => (e: React.PointerEvent<HTMLElement>) => {
      e.stopPropagation();
      e.preventDefault();
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);
      const box = el.closest(".decor") as HTMLElement;
      const r = box.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const rad = (d.rotate * Math.PI) / 180;
      const local = (px: number, py: number) => ({
        x: (px - cx) * Math.cos(rad) + (py - cy) * Math.sin(rad),
        y: -(px - cx) * Math.sin(rad) + (py - cy) * Math.cos(rad),
      });
      const start = local(e.clientX, e.clientY);
      const startDist = Math.hypot(e.clientX - cx, e.clientY - cy) || 1;
      const k = (v: number) => Math.max(0.02, Math.round(v * 100) / 100);
      const move = (ev: PointerEvent) => {
        if (mode === "rot") {
          let a = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90;
          a = ((((a + 180) % 360) + 360) % 360) - 180;
          if (ev.shiftKey) a = Math.round(a / 15) * 15;
          onChange(d.id, { rotate: Math.round(a) });
          return;
        }
        const p = local(ev.clientX, ev.clientY);
        if (mode === "x") onChange(d.id, { sx: k(sx * (p.x / (start.x || 1))) });
        else if (mode === "y") onChange(d.id, { sy: k(sy * (p.y / (start.y || 1))) });
        else onChange(d.id, { size: Math.max(4, Math.round(d.size * (Math.hypot(ev.clientX - cx, ev.clientY - cy) / startDist))) });
      };
      const up = () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    };
    const knob = "pointer-events-auto absolute flex h-6 w-6 touch-none items-center justify-center rounded-full border-2 border-[#2563eb] bg-white text-[#2563eb] shadow";
    const at = (left: string, top: string) => ({ left, top, transform: `translate(-50%,-50%) scale(${1 / sx},${1 / sy})` });
    return (
      <>
        <span aria-hidden className="absolute left-1/2 -top-5 h-5 w-px bg-[#2563eb]" />
        <span title="Drag to rotate (Shift snaps to 15°)" data-keep className={`${knob} cursor-grab`} style={at("50%", "-28px")} onPointerDown={grab("rot")}><RotateCw size={13} /></span>
        <span title="Drag to stretch sideways" data-keep className={`${knob} cursor-ew-resize`} style={at("100%", "50%")} onPointerDown={grab("x")}><MoveHorizontal size={13} /></span>
        <span title="Drag to stretch up / down" data-keep className={`${knob} cursor-ns-resize`} style={at("50%", "100%")} onPointerDown={grab("y")}><MoveVertical size={13} /></span>
        <span title="Drag to resize" data-keep className={`${knob} cursor-nwse-resize`} style={at("100%", "100%")} onPointerDown={grab("size")}><Maximize2 size={13} /></span>
        <span
          title="Remove"
          role="button"
          data-keep
          className={`${knob} cursor-pointer border-red-500 text-red-600`}
          style={at("0%", "0%")}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(d.id);
          }}
        >
          <X size={13} />
        </span>
      </>
    );
  };

  // the path as a curve, so the editor can draw it (control point recovered from the curve's midpoint)
  let curve: string | null = null;
  if (sel?.path?.on) {
    const mid = decorPath(sel)[2];
    const cx = 2 * mid[0] - (sel.x + sel.path.x) / 2;
    const cy = 2 * mid[1] - (sel.y + sel.path.y) / 2;
    curve = `M${sel.x} ${sel.y} Q${cx} ${cy} ${sel.path.x} ${sel.path.y}`;
  }

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-20 touch-none overflow-hidden"
      onPointerMove={move}
      onPointerUp={() => (draggingRef.current = null)}
      onPointerCancel={() => (draggingRef.current = null)}
    >
      {sel && curve && (
        <>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d={curve} fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="6 5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div
            title="Drag to set where it travels"
            data-keep
            className="pointer-events-auto absolute z-30 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-full border-2 border-white bg-[#2563eb] text-[9px] font-bold text-white shadow active:cursor-grabbing"
            style={{ left: `${sel.path.x}%`, top: `${sel.path.y}%` }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              draggingRef.current = `end:${sel.id}`;
            }}
          >
            end
          </div>
        </>
      )}
      {items.map((d) => {
        const grab = (e: React.PointerEvent<HTMLDivElement>) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          draggingRef.current = d.id;
          onSelect(d.id);
        };
        // with a path the sticker plays its motion live; a faint copy stays at the start spot so it can still be selected and dragged
        return d.path?.on ? (
          <Fragment key={d.id}>
            <DecorItem d={d} noPath selected={d.id === selected} handles={handlesFor(d)} className="pointer-events-auto cursor-grab touch-none opacity-40 active:cursor-grabbing" onPointerDown={grab} />
            <DecorItem d={d} noDelay aria-hidden className="pointer-events-none" />
          </Fragment>
        ) : (
          <DecorItem key={d.id} d={d} noPath selected={d.id === selected} handles={handlesFor(d)} className="pointer-events-auto cursor-grab touch-none active:cursor-grabbing" onPointerDown={grab} />
        );
      })}
    </div>
  );
}

const KIND_LABEL = { text: "Text", graffiti: "Graffiti", emoji: "Emoji", art: "Illustration", image: "Image" } as const;

/** Preview a sticker at a small size (used for tiles and the chip list). */
function StickerThumb({ d, size = 28 }: { d: Pick<Decoration, "kind" | "content" | "color">; size?: number }) {
  return d.kind === "image" ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={d.content} alt="" className="h-8 w-auto max-w-14 rounded object-contain" />
  ) : d.kind === "art" ? (
    <span className="flex items-center justify-center" style={{ fontSize: size * 0.8 }}><ArtSvg name={d.content} /></span>
  ) : (
    <span className="max-w-full truncate px-1 text-sm font-bold" style={{ color: d.kind === "emoji" ? undefined : d.color }}>{d.content || "·"}</span>
  );
}

function DecorTools({
  section,
  s,
  setS,
  sel,
  setSel,
  onNew,
}: {
  section: string;
  s: Settings;
  setS: React.Dispatch<React.SetStateAction<Settings>>;
  sel: string | null;
  setSel: (id: string | null) => void;
  onNew: (d: Decoration) => void;
}) {
  const all = s.decorations;
  const mine = all.filter((d) => d.section === section);
  const full = all.length >= MAX_DECORATIONS;

  function add(p: Partial<Decoration>) {
    const d: Decoration = { id: nextId("d", all.map((x) => x.id)), section, kind: "emoji", content: "", x: 50, y: 50, size: 40, rotate: 0, color: "#a1a1aa", effect: "none", ...p, flip: p.flip ?? false, sx: p.sx ?? 1, sy: p.sy ?? 1, shape: p.shape ?? "original", opacity: p.opacity ?? 100, path: p.path ?? DEFAULT_PATH };
    setS((prev) => ({ ...prev, decorations: [...prev.decorations, d] }));
    onNew(d);
    setSel(d.id);
  }

  const heading = (text: string, Icon: LucideIcon) => (
    <h4 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-soft">
      <Icon size={13} />
      {text}
    </h4>
  );

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-soft">Add words like “Hooray!” and drag them into place. For animated illustrations, use the party-popper icon on the section&apos;s tool bar.</p>
        <Badge variant="outline" size="xs" color={full ? "rose" : undefined}>{all.length}/{MAX_DECORATIONS}</Badge>
      </div>

      <div className="grid gap-2">
        {heading("Text", Type)}
        <div className="flex flex-wrap gap-1.5">
          {TEXT_PRESETS.map((p) => (
            <div
              key={p.label}
              draggable={!full}
              onDragStart={(e) => {
                drag.current = { kind: "sticker", preset: p.d };
                e.dataTransfer.setData("text/plain", p.label);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onDragEnd={() => (drag.current = null)}
              className="cursor-grab"
            >
                          <Button variant="outline" size="xs" disabled={full} onClick={() => add(p.d)}>
              {p.label}
              {all.some((x) => x.kind === p.d.kind) && (
                <Badge variant="solid" size="xs" className="ml-1.5">{all.filter((x) => x.kind === p.d.kind).length}</Badge>
              )}
            </Button>
            </div>
          ))}
        </div>
      </div>

      {mine.length > 0 && (
        <div className="grid gap-2">
          {heading(`On this section (${mine.length})`, Layers)}
          <div className="flex flex-wrap gap-2">
            {mine.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSel(d.id)}
                className={`flex h-11 min-w-11 max-w-28 items-center justify-center rounded-xl border px-1 transition-colors ${d.id === sel ? "border-fg bg-surface-muted" : "border-border hover:border-fg/50"}`}
              >
                <StickerThumb d={d} />
              </button>
            ))}
          </div>
        </div>
      )}

      {mine.length > 0 && <p className="text-xs text-soft">Select a sticker to edit it in a floating panel you can drag around.</p>}
    </div>
  );
}


/** The sticker settings, shown inside the floating panel. */
function StickerEditor({ cur, update }: { cur: Decoration; update: (patch: Partial<Decoration>) => void }) {
  return (
    <div className="grid gap-4">
      {cur.kind === "image" ? (
        <div className="grid gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cur.content} alt="" className="max-h-32 w-auto max-w-full justify-self-start rounded-lg border border-border object-contain p-1" />
          <FileUpload
            label="Replace image"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onFilesSelected={async (files) => {
              const [url] = await uploadFiles(files, 1, () => {});
              if (url) update({ content: url });
            }}
          />
        </div>
      ) : cur.kind === "art" ? (
        <SelectField label="Illustration" value={cur.content} options={ART_OPTIONS} onChange={(content) => update({ content })} />
      ) : (
        <TextField label="Text / emoji" value={cur.content} maxLength={40} onChange={(content) => update({ content })} />
      )}
      <div className="grid grid-cols-2 gap-2">
        {cur.kind !== "image" && (
          <SelectField label="Style" value={cur.kind} options={KINDS.filter((k) => k !== "image").map((k) => [k, KIND_LABEL[k]] as const)} onChange={(kind) => update({ kind, content: kind === "art" && !ART_OPTIONS.some(([k]) => k === cur.content) ? "cake" : cur.content })} />
        )}
        <SelectField label="Motion" value={cur.effect} options={EFFECTS.map((k) => [k, k[0].toUpperCase() + k.slice(1)] as const)} onChange={(effect) => update({ effect })} />
      </div>
      {(cur.kind === "text" || cur.kind === "graffiti") && <ColorField label="Colour" value={cur.color} onChange={(color) => update({ color })} />}
      <SwitchField label="Mirror (flip left ↔ right)" checked={cur.flip} onChange={(flip) => update({ flip })} />
      {cur.kind === "image" && (
        <SelectField
          label="Shape"
          value={cur.shape}
          options={SHAPES.map((k) => [k, { original: "Original", rounded: "Rounded corners", circle: "Circle", square: "Square", heart: "Heart", star: "Star", hexagon: "Hexagon" }[k]] as const)}
          onChange={(shape) => update({ shape })}
        />
      )}
      <SliderField label="Opacity (%)" min={10} max={100} value={cur.opacity} onChange={(opacity) => update({ opacity })} />

      <div className="grid gap-3 rounded-xl border border-border p-3">
        <SwitchField
          label="Move along a path"
          checked={cur.path.on}
          onChange={(on) =>
            update({
              path: on
                ? { ...cur.path, on: true, x: cur.x > 60 ? cur.x - 30 : cur.x + 30, y: cur.y > 50 ? cur.y - 25 : cur.y + 25 }
                : { ...cur.path, on: false },
            })
          }
        />
        {cur.path.on && (
          <>
            <p className="text-xs text-soft">Drag the blue “end” dot on the page to set where it travels. The sticker plays live here (a faint copy stays at the start so you can still select it). On the page it travels, fades out, rests for the pause, then repeats.</p>
            <SliderField label="Curve" min={-100} max={100} value={cur.path.curve} onChange={(curve) => update({ path: { ...cur.path, curve } })} />
            <SliderField label="Duration (seconds)" min={1} max={30} value={cur.path.duration} onChange={(duration) => update({ path: { ...cur.path, duration } })} />
            <SliderField label="Pause between moves (seconds)" min={0} max={20} value={cur.path.delay} onChange={(delay) => update({ path: { ...cur.path, delay } })} />
          </>
        )}
      </div>

    </div>
  );
}

/** A dashed line from a floating panel to the element it edits; it follows dragging, scrolling and resizing. */
function Connector({ panel, selector }: { panel: string; selector: string }) {
  const [geo, setGeo] = useState<{ sx: number; sy: number; ex: number; ey: number } | null>(null);

  useEffect(() => {
    let raf = 0;
    let lastKey = "";
    const tick = () => {
      const p = document.querySelector(`[data-panel="${panel}"]`)?.getBoundingClientRect();
      const t = document.querySelector(selector)?.getBoundingClientRect();
      let next: { sx: number; sy: number; ex: number; ey: number } | null = null;
      if (p && t && t.width > 0 && t.bottom > 0 && t.top < window.innerHeight) {
        const targetIsLeft = t.left + t.width / 2 < p.left + p.width / 2;
        next = {
          sx: targetIsLeft ? p.left : p.right,
          sy: Math.min(p.bottom - 24, Math.max(p.top + 24, t.top + t.height / 2)),
          ex: targetIsLeft ? t.right : t.left,
          ey: t.top + t.height / 2,
        };
      }
      const key = next ? `${Math.round(next.sx)},${Math.round(next.sy)},${Math.round(next.ex)},${Math.round(next.ey)}` : "";
      if (key !== lastKey) {
        lastKey = key;
        setGeo(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [panel, selector]);

  if (!geo) return null;
  const bend = Math.max(40, Math.abs(geo.ex - geo.sx) / 2);
  const dir = geo.ex < geo.sx ? -1 : 1;
  return (
    <svg className="pointer-events-none fixed inset-0 z-[39] h-full w-full" aria-hidden>
      <path
        d={`M ${geo.sx} ${geo.sy} C ${geo.sx + dir * bend} ${geo.sy}, ${geo.ex - dir * bend} ${geo.ey}, ${geo.ex} ${geo.ey}`}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
      <circle cx={geo.sx} cy={geo.sy} r="4" fill="#2563eb" />
      <circle cx={geo.ex} cy={geo.ey} r="5" fill="#fff" stroke="#2563eb" strokeWidth="2.5" />
    </svg>
  );
}

const lastPanelPos: Record<string, { x: number; y: number }> = {}; // remembered per panel between openings
// where each panel first opens (cascaded, so several open together do not sit exactly on top of each other)
const PANEL_START: Record<string, { fromRight: number; y: number; left?: number }> = { element: { fromRight: 300, y: 90 }, sticker: { fromRight: 340, y: 130 }, stickers: { fromRight: 320, y: 200 }, rsvppart: { fromRight: 360, y: 150 } }; // clear of the element list + toolbox columns

/** A small window that floats over the editor; drag it by its header. */
function FloatingPanel({ panelId, title, onClose, onDone, closeHint = "Close", width = 340, children }: { panelId: string; title: string; onClose: () => void; onDone: () => void; closeHint?: string; width?: number; children: React.ReactNode }) {
  const [pos, setPos] = useState(
    () => lastPanelPos[panelId] ?? { x: PANEL_START[panelId]?.left ?? Math.max(16, (typeof window === "undefined" ? 900 : window.innerWidth) - width - (PANEL_START[panelId]?.fromRight ?? 90)), y: PANEL_START[panelId]?.y ?? 110 },
  );
  const grab = useRef<{ dx: number; dy: number } | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(12px)", scale: 0.96 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: 0.28, delay: 0.06, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, filter: "blur(12px)", scale: 0.96, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
      className="fixed z-40 flex max-h-[75vh] flex-col overflow-hidden rounded-2xl border border-border bg-surface text-fg shadow-2xl"
      style={{ left: pos.x, top: pos.y, width }}
      role="dialog"
      aria-label={title}
      data-panel={panelId}
    >
      <div
        className="flex cursor-grab touch-none select-none items-center justify-between gap-2 border-b border-accent-700 bg-accent-600 px-3 py-2 text-white active:cursor-grabbing"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          grab.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
        }}
        onPointerMove={(e) => {
          if (!grab.current) return;
          const next = {
            x: Math.min(window.innerWidth - 80, Math.max(0, e.clientX - grab.current.dx)),
            y: Math.min(window.innerHeight - 48, Math.max(0, e.clientY - grab.current.dy)),
          };
          lastPanelPos[panelId] = next;
          setPos(next);
        }}
        onPointerUp={() => (grab.current = null)}
        onPointerCancel={() => (grab.current = null)}
      >
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <GripVertical size={14} className="opacity-70" />
          {title}
        </span>
        <button type="button" aria-label={closeHint} title={closeHint} onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md text-white/80 hover:bg-white/20 hover:text-white">
          <X size={14} />
        </button>
      </div>
      <div className="overflow-auto p-4">{children}</div>
      <div className="border-t border-border bg-surface p-3">
        <Button shape="pill" size="sm" className="w-full font-semibold" onClick={onDone}>
          Done
        </Button>
      </div>
    </motion.div>
  );
}


/** toolbox icon colour per tool (full class names so Tailwind keeps them) */
const TOOL_TONE: Record<string, string> = {
  heading: "text-indigo-600",
  text: "text-slate-600",
  badge: "text-amber-600",
  script: "text-violet-600",
  image: "text-sky-600",
  gallery: "text-cyan-600",
  map: "text-emerald-600",
  sticker: "text-orange-600",
  card: "text-teal-600",
  step: "text-blue-600",
  countdown: "text-rose-600",
  rsvp: "text-pink-600",
  button: "text-fuchsia-600",
  divider: "text-zinc-600",
  spacer: "text-stone-600",
  "Text stickers": "text-yellow-600",
  Layers: "text-lime-600",
  "New section": "text-purple-600",
  "New map": "text-green-600",
};

const TYPE_COLOR: Record<string, string> = { heading: "indigo", text: "slate", badge: "amber", script: "violet", image: "sky", gallery: "cyan", map: "emerald", emoji: "orange", card: "teal", step: "blue", countdown: "rose", rsvp: "pink", button: "fuchsia", divider: "slate", spacer: "slate" };

/** Every element and sticker of one section: click to select, drag ⠿ to reorder the elements, ✕ to delete. */
function ElementList({
  section,
  stickers,
  selBlock,
  selSticker,
  onReorder,
  onPickBlock,
  onPickSticker,
  onDeleteBlock,
  onDeleteSticker,
}: {
  section: Section;
  stickers: Decoration[];
  selBlock: string | null;
  selSticker: string | null;
  onReorder: (blocks: Block[]) => void;
  onPickBlock: (id: string) => void;
  onPickSticker: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onDeleteSticker: (id: string) => void;
}) {
  const dnd = useReorder(section.blocks, onReorder);
  const [shut, setShut] = useState<Record<string, boolean>>({});
  const heading = (text: string, count: number, Icon: LucideIcon) => (
    <button
      type="button"
      aria-expanded={!shut[text]}
      onClick={() => setShut((o) => ({ ...o, [text]: !o[text] }))}
      className="col-span-full flex w-full items-center gap-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-soft hover:text-fg"
    >
      <Icon size={13} />
      <span className="flex-1 text-left">{text}</span>
      <Badge variant="soft" size="xs" color="blue">{count}</Badge>
      <ChevronDown size={14} className={`transition-transform ${shut[text] ? "-rotate-90" : ""}`} />
    </button>
  );
  const row = "group relative flex items-center gap-2.5 overflow-hidden rounded-xl border px-2 py-2 text-left transition-all hover:-translate-y-px";
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2 lg:gap-3">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-1 sm:grid-cols-2 sm:gap-x-2 lg:grid-cols-[minmax(0,1fr)]">
        {heading("Components", section.blocks.length, Layers)}
        {!shut.Components && section.blocks.length === 0 && <p className="col-span-full text-xs text-soft">Nothing here yet — add an element from the toolbox.</p>}
        {!shut.Components && section.blocks.map((b, i) => {
          const meta = PALETTE.find((p) => p.type === b.type);
          const snippet = (b.text || b.text2 || b.url || "").trim();
          return (
            <div key={b.id} {...dnd.row(i)} className={`${row} ${b.id === selBlock ? "border-[#2563eb]/40 bg-[#2563eb]/[0.05] shadow-[0_2px_10px_rgba(37,99,235,0.12)] before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r before:bg-[#2563eb]" : "border-transparent hover:border-border hover:bg-surface-muted"}`}>
              <Grip {...dnd.handle(i)} />
              <button type="button" onClick={() => onPickBlock(b.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <span className="grid min-w-0 gap-0.5">
                  <Badge variant="soft" size="xs" color={TYPE_COLOR[b.type] as "indigo"} className="w-fit max-w-full">{meta?.label ?? b.type}</Badge>
                  <span className="block truncate text-xs text-soft">{snippet || "—"}</span>
                </span>
              </button>
              <button type="button" aria-label={`Delete ${meta?.label ?? b.type}`} onClick={() => onDeleteBlock(b.id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-soft opacity-0 transition-opacity hover:text-red-600 focus:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100 lg:h-7 lg:w-7">
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {stickers.length > 0 && (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-1 sm:grid-cols-2 sm:gap-x-2 lg:grid-cols-[minmax(0,1fr)]">
          {heading("Stickers", stickers.length, Sparkles)}
          {!shut.Stickers && stickers.map((d) => (
            <div key={d.id} className={`${row} ${d.id === selSticker ? "border-[#2563eb]/40 bg-[#2563eb]/[0.05] shadow-[0_2px_10px_rgba(37,99,235,0.12)] before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r before:bg-[#2563eb]" : "border-transparent hover:border-border hover:bg-surface-muted"}`}>
              <button type="button" onClick={() => onPickSticker(d.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <span className="grid min-w-0 gap-0.5">
                  <Badge variant="soft" size="xs" color="rose" className="w-fit max-w-full">{KIND_LABEL[d.kind]}</Badge>
                  <span className="block truncate text-xs text-soft">{d.kind === "image" || d.kind === "art" ? (d.kind === "art" ? d.content : "your picture") : d.content}</span>
                </span>
              </button>
              <button type="button" aria-label="Delete sticker" onClick={() => onDeleteSticker(d.id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-soft opacity-0 transition-opacity hover:text-red-600 focus:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100 lg:h-7 lg:w-7">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
