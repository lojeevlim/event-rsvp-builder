"use client";

import { useEffect, useState } from "react";
import { Stat } from "@/components/ui";

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

export default function Countdown({ target, label, light }: { target: string; label: string; light: boolean }) {
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

  const t = new Date(target).getTime();
  const items = now === null || Number.isNaN(t) ? ZERO : parts(t, now);

  return (
    <div className={`w-full ${light ? "text-[color:var(--on-bg,#fff)]" : "text-ink"}`}>
      <div className="flex items-center justify-center gap-5">
        <span aria-hidden className="h-px max-w-20 flex-1 bg-current opacity-40" />
        <p className="text-base font-extrabold uppercase tracking-[0.3em] md:text-lg">{label}</p>
        <span aria-hidden className="h-px max-w-20 flex-1 bg-current opacity-40" />
      </div>
      <div className="mx-auto mt-7 grid max-w-3xl grid-cols-4 gap-3 md:gap-5">
        {items.map(([name, value]) => (
          <Stat
            key={name}
            label={name}
            value={value}
            classNames={{
              root: `items-center justify-center rounded-2xl border-0 py-3 text-center shadow-none ring-1 ${light ? "bg-[color-mix(in_oklab,var(--on-bg,#fff)_15%,transparent)] ring-[color-mix(in_oklab,var(--on-bg,#fff)_25%,transparent)]" : "bg-line ring-line"}`,
              value: `font-display text-4xl font-bold tabular-nums md:text-5xl ${light ? "text-[color:var(--on-bg,#fff)]" : "text-ink"}`,
              label: `text-xs font-semibold uppercase tracking-wider ${light ? "text-[color:var(--on-bg,#fff)] opacity-85" : "text-soft"}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
