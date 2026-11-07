"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** An info card that reacts when tapped: it flips over to show a second message, or pops with a little bounce. */
export default function TapCard({ mode, back, children }: { mode: "flip" | "pop"; back: string; children: ReactNode }) {
  const [on, setOn] = useState(false);
  const [pops, setPops] = useState(0);
  const reduce = useReducedMotion();
  const tap = () => (mode === "flip" ? setOn((v) => !v) : setPops((n) => n + 1));
  const key = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tap();
    }
  };

  if (mode === "pop") {
    return (
      <motion.div
        key={pops}
        role="button"
        tabIndex={0}
        onClick={tap}
        onKeyDown={key}
        className="w-full cursor-pointer"
        animate={pops && !reduce ? { scale: [1, 0.93, 1.06, 1], rotate: [0, -2, 2, 0] } : undefined}
        transition={{ duration: 0.55, ease: EASE }}
      >
        {children}
      </motion.div>
    );
  }
  const face = { gridArea: "1 / 1", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;
  return (
    <div role="button" tabIndex={0} aria-pressed={on} onClick={tap} onKeyDown={key} className="w-full cursor-pointer" style={{ perspective: 1100 }}>
      <motion.div className="grid" style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: on ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.75, ease: EASE }}>
        <div style={face}>{children}</div>
        <div style={{ ...face, transform: "rotateY(180deg)" }} className="flex items-center justify-center rounded-[28px] bg-accent-600 p-6 text-center text-lg font-bold leading-snug text-white shadow-lg">
          {back || "Tap again to flip back"}
        </div>
      </motion.div>
    </div>
  );
}
