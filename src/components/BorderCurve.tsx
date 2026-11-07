"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** One border edge whose tiles follow a curve and/or a wave: each tile is placed along the line and turned to match its slope. curve > 0 bows the middle into the section, curve < 0 bows the ends. */
export default function CurvedEdge({ side, w, h, k, curve, wave, art }: { side: "top" | "bottom" | "left" | "right"; w: number; h: number; k: number; curve: number; wave: number; art: ReactNode }) {
  const ref = useRef<SVGSVGElement>(null);
  const [len, setLen] = useState(0);
  const horizontal = side === "top" || side === "bottom";
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setLen(horizontal ? el.clientWidth : el.clientHeight);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [horizontal]);

  const thick = h * k;
  const tw = w * k;
  const bow = Math.min(len * 0.18, 140) * (Math.abs(curve) / 100); // how far the curve moves tiles into the section
  // more wave = more ripples: the height stays gentle, the distance between ripples shrinks (320px down to 80px)
  const amp = wave ? 14 : 0;
  const lambda = 320 - (wave / 100) * 240;
  const total = thick + bow + amp;
  const n = len ? Math.ceil(len / tw) : 0;
  const tiles = Array.from({ length: n }, (_, i) => {
    const cx = i * tw + tw / 2;
    const t = (2 * cx) / len - 1; // -1 … 1 along the edge
    const phase = (2 * Math.PI * cx) / lambda;
    const off = (curve >= 0 ? bow * (1 - t * t) : bow * t * t) + (amp * (1 - Math.cos(phase))) / 2;
    const slope = (curve >= 0 ? -2 * t : 2 * t) * bow * (2 / len) + (amp * Math.PI * Math.sin(phase)) / lambda;
    const deg = (Math.atan(slope) * 180) / Math.PI;
    return <g key={i} transform={`translate(${cx} ${off}) rotate(${deg}) translate(${-tw / 2} 0) scale(${k})`}>{art}</g>;
  });
  const turn = { top: "", bottom: `translate(0 ${total}) scale(1 -1)`, left: "", right: "" }[side];
  const style = {
    top: { top: 0, left: 0, right: 0, height: total },
    bottom: { bottom: 0, left: 0, right: 0, height: total },
    left: { left: 0, top: 0, bottom: 0, width: total },
    right: { right: 0, top: 0, bottom: 0, width: total },
  }[side];
  // vertical edges: draw as a horizontal strip, then lay it on its side
  const wrap = { top: "", bottom: "", left: `translate(0 ${len}) rotate(-90)`, right: `translate(${total} 0) rotate(90)` }[side];
  return (
    <svg ref={ref} aria-hidden className="pointer-events-none absolute" style={style} width={horizontal ? "100%" : total} height={horizontal ? total : "100%"}>
      <g transform={wrap}>
        <g transform={turn}>{tiles}</g>
      </g>
    </svg>
  );
}
