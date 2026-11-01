"use client";

import { GripVertical } from "lucide-react";
import { useRef, type DragEvent, type ReactNode } from "react";
import { ColorPicker, Input, Label, Select, Slider, Switch, Textarea } from "@/components/ui";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-bold uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  long,
  type,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  long?: boolean;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <Field label={label}>
      {long ? (
        <Textarea rows={3} value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input size="sm" type={type} value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

// lojee-ui renders a hidden native <select value=…>; changes arrive through onOptionSelect, so this only silences React's "value without onChange" warning
const noop = () => {};

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <Select size="sm" value={value} options={options.map(([v, l]) => ({ value: v, label: l }))} onOptionSelect={(v) => onChange(v as T)} onChange={noop} />
    </Field>
  );
}

export function SwitchField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <Switch size="sm" label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} />;
}

export function SliderField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <Field label={label}>
      <Slider size="sm" showValue min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)} />
    </Field>
  );
}

export function ColorField({ label, value, onChange, presets }: { label: string; value: string; onChange: (v: string) => void; presets?: string[] }) {
  return (
    <Field label={label}>
      <ColorPicker value={value} presets={presets} onChange={onChange} />
    </Field>
  );
}

/** Drag-and-drop reordering: put `handle(i)` on a ⠿ grip and `row(i)` on the row it moves. */
export function useReorder<T>(list: T[], set: (l: T[]) => void) {
  const from = useRef<number | null>(null);
  return {
    handle: (i: number) => ({
      draggable: true,
      onDragStart: (e: DragEvent) => {
        from.current = i;
        e.dataTransfer.effectAllowed = "move";
        const row = (e.currentTarget as HTMLElement).closest("[data-row]");
        if (row) e.dataTransfer.setDragImage(row, 16, 16);
      },
    }),
    row: (i: number) => ({
      "data-row": true,
      onDragOver: (e: DragEvent) => e.preventDefault(),
      onDrop: () => {
        const f = from.current;
        from.current = null;
        if (f === null || f === i) return;
        const a = [...list];
        a.splice(i, 0, a.splice(f, 1)[0]);
        set(a);
      },
    }),
  };
}

export const Grip = (props: React.HTMLAttributes<HTMLSpanElement> & { draggable?: boolean }) => (
  <span {...props} title="Drag to reorder" className="cursor-grab select-none px-1 text-soft active:cursor-grabbing"><GripVertical size={18} /></span>
);
