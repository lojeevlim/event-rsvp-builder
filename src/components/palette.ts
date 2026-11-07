import {
  GalleryHorizontal,
  Heading,
  Hourglass,
  IdCard,
  Image as ImageIcon,
  LayoutGrid,
  Mail,
  MapPin,
  Minus,
  MousePointerClick,
  MoveVertical,
  PenLine,
  Sticker,
  Tag,
  Timer,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { BlockType, Decoration } from "@/lib/settings-shared";

export type ElementType = BlockType | "sticker";

/** every element you can add to a page */
export const PALETTE: { type: BlockType; Icon: LucideIcon; label: string }[] = [
  { type: "heading", Icon: Heading, label: "Heading" },
  { type: "text", Icon: Type, label: "Text" },
  { type: "badge", Icon: Tag, label: "Badge" },
  { type: "script", Icon: PenLine, label: "Handwritten" },
  { type: "button", Icon: MousePointerClick, label: "Button" },
  { type: "image", Icon: ImageIcon, label: "Image" },
  { type: "gallery", Icon: GalleryHorizontal, label: "Gallery" },
  { type: "card", Icon: IdCard, label: "Info card" },
  { type: "step", Icon: Timer, label: "Schedule step" },
  { type: "countdown", Icon: Hourglass, label: "Countdown" },
  { type: "rsvp", Icon: Mail, label: "RSVP form" },
  { type: "map", Icon: MapPin, label: "Map" },
  { type: "divider", Icon: Minus, label: "Divider" },
  { type: "spacer", Icon: MoveVertical, label: "Spacer" },
  { type: "illustration", Icon: Sticker, label: "Illustration" },
];

export const GROUPS: { title: string; Icon: LucideIcon; types: ElementType[] }[] = [
  { title: "Text", Icon: Type, types: ["heading", "text", "badge", "script"] },
  { title: "Media", Icon: ImageIcon, types: ["image", "gallery", "map", "sticker"] },
  { title: "Content", Icon: LayoutGrid, types: ["card", "step", "countdown", "rsvp"] },
  { title: "Layout & actions", Icon: MousePointerClick, types: ["button", "divider", "spacer"] },
];

export const elementMeta = (type: ElementType): { Icon: LucideIcon; label: string } =>
  type === "sticker" ? { Icon: Sticker, label: "Sticker" } : PALETTE.find((p) => p.type === type)!;

/** quick-add text stickers */
export const TEXT_PRESETS: { label: string; d: Partial<Decoration> }[] = [
  { label: "+ Text", d: { kind: "text", content: "Hooray!", size: 40, color: "#a1a1aa" } },
  { label: "+ Graffiti", d: { kind: "graffiti", content: "Party", size: 44, color: "#fcd34d", rotate: -8, effect: "wiggle" } },
];
