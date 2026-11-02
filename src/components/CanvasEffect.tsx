"use client";

import { useEffect, useRef } from "react";
import { startFireworks } from "@/lib/fireworks-engine";
import { startEffect, type EffectKind } from "@/lib/effects-engine";

/** A canvas background effect that fills its section. Stays still for visitors who prefer reduced motion. */
export default function CanvasEffect({ kind }: { kind: EffectKind | "fireworks" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return kind === "fireworks" ? startFireworks(el) : startEffect(el, kind);
  }, [kind]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
