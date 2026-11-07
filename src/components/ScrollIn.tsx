"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const FROM = {
  rise: { opacity: 0, y: 36 },
  zoom: { opacity: 0, scale: 0.92, y: 16 },
  left: { opacity: 0, x: -44 },
  right: { opacity: 0, x: 44 },
  drop: { opacity: 0, y: -24 },
  fade: { opacity: 0 },
} as const;
export type ScrollInKind = keyof typeof FROM;

/** Fades an element in as it scrolls into view (once). Works on the live page and in the editor's preview, and is skipped for people who prefer reduced motion. */
export default function ScrollIn({ children, kind = "rise", delay = 0, className = "", once = true }: { children: ReactNode; kind?: ScrollInKind; delay?: number; className?: string; /** false: plays again every time it scrolls back into view (screen-by-screen pages) */ once?: boolean }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={FROM[kind]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount: once ? 0.15 : 0.35, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
