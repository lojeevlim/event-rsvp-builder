import {
  Baby,
  Cake,
  CalendarDays,
  Camera,
  Car,
  Clock,
  Flag,
  Gift,
  Heart,
  MapPin,
  Music,
  PartyPopper,
  Phone,
  Shirt,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  Utensils,
  type LucideIcon,
} from "lucide-react";

/** Lucide icons an element can use. The stored value is the key; unknown values (old emoji) render as text. */
export const ICONS: Record<string, { label: string; Icon: LucideIcon }> = {
  "calendar-days": { label: "Calendar", Icon: CalendarDays },
  "map-pin": { label: "Location", Icon: MapPin },
  shirt: { label: "Dress code", Icon: Shirt },
  clock: { label: "Clock", Icon: Clock },
  flag: { label: "Flag", Icon: Flag },
  gift: { label: "Gift", Icon: Gift },
  cake: { label: "Cake", Icon: Cake },
  "party-popper": { label: "Party popper", Icon: PartyPopper },
  baby: { label: "Baby", Icon: Baby },
  car: { label: "Car", Icon: Car },
  music: { label: "Music", Icon: Music },
  camera: { label: "Camera", Icon: Camera },
  utensils: { label: "Food", Icon: Utensils },
  ticket: { label: "Ticket", Icon: Ticket },
  trophy: { label: "Trophy", Icon: Trophy },
  heart: { label: "Heart", Icon: Heart },
  star: { label: "Star", Icon: Star },
  sparkles: { label: "Sparkles", Icon: Sparkles },
  phone: { label: "Phone", Icon: Phone },
};

export const ICON_OPTIONS = Object.entries(ICONS).map(([value, { label }]) => [value, label] as const);

export function BlockIcon({ name, size = 36, className = "" }: { name: string; size?: number; className?: string }) {
  if (!name) return null;
  const found = ICONS[name];
  if (!found) return <span className="text-4xl">{name}</span>;
  return <found.Icon size={size} strokeWidth={2} className={`text-brand ${className}`} aria-hidden />;
}
