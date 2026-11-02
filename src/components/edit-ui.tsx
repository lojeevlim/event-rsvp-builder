"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, EyeOff, FlipHorizontal2, GripVertical, ImagePlus, MoreHorizontal, PartyPopper, Plus, Type, RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { Badge, Button, DropdownMenu, DropdownMenuItem, Popover, Tooltip } from "@/components/ui";
import ArtSvg, { ART_GROUPS } from "@/components/ArtSvg";
import { elementMeta, GROUPS, TEXT_PRESETS, type ElementType } from "@/components/palette";
import type { Block, BlockType, Decoration, Section } from "@/lib/settings-shared";

export type StickerOp = "flip" | "rotL" | "rotR" | "smaller" | "bigger";
export type StickerState = { flip: boolean; rotate: number; size: number };

export type EditActions = {
  adjustSticker: (op: StickerOp) => void;
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
  duplicateSection: (id: string) => void;
  /** upload a picture of your own and drop it into a section as a sticker */
  uploadSticker: (sectionId: string, files: FileList | null) => Promise<void>;
};

type Payload = { kind: "block"; id: string } | { kind: "new"; type: BlockType } | { kind: "section"; id: string } | { kind: "sticker"; preset?: Partial<Decoration> };

/** What is currently being dragged (dataTransfer can't be read during dragover). */
// blocks that hug their content so the hover highlight is tight; the rest span the full width
const HUG = new Set(["badge", "heading", "text", "script", "button", "emoji"]);

export const drag: { current: Payload | null } = { current: null };

/** Popover content: animated illustrations to drop into a section (click to add, or drag onto the page). */
export function ArtPicker({ onPick, onUpload, sticker, adjust }: { onPick: (key: string) => void; onUpload?: (files: FileList | null) => void; sticker?: StickerState | null; adjust?: (op: StickerOp) => void }) {
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
    <div data-action className="grid w-64 gap-2 p-1 text-left">
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
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-soft">Animated illustrations</p>
      <div className="grid max-h-72 gap-3 overflow-auto pr-1">
        {ART_GROUPS.map(([title, items]) => (
          <div key={title} className="grid gap-1.5">
            <p className="text-xs font-semibold text-fg">{title}</p>
            <div className="grid grid-cols-4 gap-1.5">{items.map(tile)}</div>
          </div>
        ))}
      </div>
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
  actions,
  children,
}: {
  block: Block;
  sectionId: string;
  index: number;
  selected: boolean;
  actions: EditActions;
  children: ReactNode;
}) {
  const [over, setOver] = useState<"before" | "after" | null>(null);
  return (
    <div
      data-block={block.id}
      draggable
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
      className={`group/b relative flex ${HUG.has(block.type) ? "w-fit max-w-full" : "w-full"} cursor-grab flex-col items-center active:cursor-grabbing ${selected ? "is-selected" : ""}`}
    >
      {over === "before" && <i className="drop-line -top-3" />}
      {children}
      {over === "after" && <i className="drop-line -bottom-3" />}
      <div
        className={`absolute -top-3 right-0 z-30 flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white shadow ${selected ? "" : "pointer-events-none opacity-0 group-hover/b:pointer-events-auto group-hover/b:opacity-100"}`}
      >
        <span className="flex items-center"><GripVertical size={14} />{block.type}</span>
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
  return (
    <motion.div
      layout="position"
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      data-section={section.id}
      className={`group/s decor-host relative hover:z-40 ${selected ? "is-selected z-40" : ""} ${section.card ? "mx-auto my-8 w-[calc(100%-1.5rem)] max-w-7xl rounded-[64px] border border-border shadow-[0_10px_28px_-18px_rgba(0,0,0,0.25)]" : ""} ${section.hidden ? "opacity-50" : ""}`}
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
        className={`pointer-events-none absolute -left-11 top-3 z-30 flex w-9 flex-col items-center gap-1.5 ${selected || menuOpen || artOpen || addOpen || textOpen ? "" : "invisible"}`}
      >
        <div className={`flex flex-col items-center gap-0.5 rounded-2xl bg-ink p-1 text-white shadow-lg ${selected || menuOpen || artOpen || addOpen || textOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
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
        <div className={`flex flex-col items-center gap-0.5 rounded-2xl bg-ink p-1 text-white shadow-lg ${selected || menuOpen || artOpen || addOpen || textOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
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
      <div className={`pointer-events-none absolute -top-3 right-3 z-50 ${selected || menuOpen || artOpen || addOpen || textOpen ? "" : "opacity-0 group-hover/s:opacity-100"}`}>
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
