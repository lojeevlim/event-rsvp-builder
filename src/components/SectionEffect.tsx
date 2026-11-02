import type { CSSProperties } from "react";
import type { Section } from "@/lib/settings-shared";
import CanvasEffect from "@/components/CanvasEffect";

const SHADES = [300, 400, 500, 600, 700];
const WORDS = ["PARTY", "YAY!", "WOW", "CHEERS", "FUN", "JOIN US", "HOORAY", "LET'S GO"];
const accent = (i: number) => `var(--color-accent-${SHADES[i % SHADES.length]})`;
// fixed spread (no Math.random) so server and client render the same thing
const spread = (i: number) => `${(i * 37 + 11) % 94}%`;
const dur = (i: number, base: number, range: number) => `${base + ((i * 7) % range)}s`;
const delay = (i: number, step: number) => `${-(i * step)}s`;

export default function SectionEffect({ kind }: { kind: Section["effect"] }) {
  if (kind === "none") return null;

  // balloons and graffiti are DOM elements; everything else is drawn on a canvas
  const items =
    kind === "balloons" ? (
      Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="fx-item fx-rise" style={{ left: spread(i), animationDuration: dur(i, 10, 6), animationDelay: delay(i, 1.9) } as CSSProperties}>
          <span className="fx-sway" style={{ animationDuration: dur(i, 3, 3) }}>
            <i className="balloon" style={{ background: accent(i), color: accent(i), transform: `scale(${0.8 + (i % 4) * 0.15})` }} />
          </span>
        </span>
      ))
    ) : kind === "graffiti" ? (
      WORDS.map((w, i) => (
        <span key={w} className="fx-item fx-fade-fall font-comic" style={{ left: spread(i), color: accent(i), fontSize: `${22 + (i % 4) * 8}px`, animationDuration: dur(i, 9, 5), animationDelay: delay(i, 1.6), ["--r" as string]: `${(i % 2 ? 1 : -1) * (6 + i * 3)}deg` } as CSSProperties}>
          {w}
        </span>
      ))
    ) : (
      <CanvasEffect kind={kind} />
    );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
      {items}
    </div>
  );
}
