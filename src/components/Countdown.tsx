"use client";

import { useEffect, useRef, useState } from "react";
import { Stat } from "@/components/ui";
import SectionEffect from "@/components/SectionEffect";
import type { Section } from "@/lib/settings-shared";

function parts(target: number, now: number) {
  const s = Math.max(0, Math.floor((target - now) / 1000));
  return [
    ["Days", Math.floor(s / 86400)],
    ["Hours", Math.floor(s / 3600) % 24],
    ["Mins", Math.floor(s / 60) % 60],
    ["Secs", s % 60],
  ] as const;
}

const ZERO = [["Days", 0], ["Hours", 0], ["Mins", 0], ["Secs", 0]] as const;

/** Once the countdown has reached zero, `endHeading` (if set) replaces the number tiles and `fx` plays behind it. */
export default function Countdown({ target, label, light, endHeading = "", fx = "none" }: { target: string; label: string; light: boolean; endHeading?: string; fx?: Section["effect"] }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  // the height the section had while counting (countdown + the section's own top/bottom padding), kept for the message so it never changes size
  const box = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(0);

  const t = new Date(target).getTime();
  const items = now === null || Number.isNaN(t) ? ZERO : parts(t, now);
  // only once the clock is running and has really run out (not while the page is still loading)
  const done = now !== null && !Number.isNaN(t) && items.every(([, v]) => v === 0);
  const showMessage = done && !!endHeading;
  useEffect(() => {
    const el = box.current;
    if (!el || showMessage) return;
    const measure = () => {
      const sec = el.closest("section");
      const cs = sec ? getComputedStyle(sec) : null;
      setFull(Math.round(el.offsetHeight + (cs ? parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) : 0)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showMessage]);

  return (
    <div ref={box} data-cd-msg={showMessage || undefined} style={showMessage && full ? { minHeight: full } : undefined} className={`relative grid w-full ${light ? "text-[color:var(--on-bg,#fff)]" : "text-ink"}`}>
      {done && <SectionEffect kind={fx} />}
      {/* the label and tiles keep their space (hidden) once the message shows, so the block never changes height */}
      <div className={`relative z-10 col-start-1 row-start-1 ${showMessage ? "invisible" : ""}`} aria-hidden={showMessage || undefined}>
      <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-5">
        <span aria-hidden className="h-px max-w-20 flex-1 bg-current opacity-40" />
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] sm:text-base sm:tracking-[0.3em] md:text-lg">{label}</p>
        <span aria-hidden className="h-px max-w-20 flex-1 bg-current opacity-40" />
      </div>
      <div className="relative z-10 mx-auto mt-5 grid max-w-3xl grid-cols-4 gap-2 sm:mt-7 sm:gap-3 md:gap-5">
        {items.map(([name, value]) => (
          <Stat
            key={name}
            label={name}
            value={value}
            classNames={{
              root: `items-center justify-center rounded-2xl border-0 py-3 text-center shadow-none ring-1 ${light ? "bg-[color-mix(in_oklab,var(--on-bg,#fff)_15%,transparent)] ring-[color-mix(in_oklab,var(--on-bg,#fff)_25%,transparent)]" : "bg-line ring-line"}`,
              value: `font-display text-3xl font-bold tabular-nums sm:text-4xl md:text-5xl ${light ? "text-[color:var(--on-bg,#fff)]" : "text-ink"}`,
              label: `text-[10px] font-semibold uppercase tracking-wide sm:text-xs sm:tracking-wider ${light ? "text-[color:var(--on-bg,#fff)] opacity-85" : "text-soft"}`,
            }}
          />
        ))}
      </div>
      </div>
      {showMessage && (
        <h2 className="relative z-10 col-start-1 row-start-1 flex items-center justify-center px-2 text-center font-display text-3xl font-extrabold sm:text-4xl md:text-5xl">{endHeading}</h2>
      )}
    </div>
  );
}
