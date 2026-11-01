import type { CSSProperties } from "react";
import type { Section } from "@/lib/settings-shared";

const SHADES = [300, 400, 500, 600, 700];
const WORDS = ["PARTY", "YAY!", "WOW", "CHEERS", "FUN", "JOIN US", "HOORAY", "LET'S GO"];
const accent = (i: number) => `var(--color-accent-${SHADES[i % SHADES.length]})`;
// fixed spread (no Math.random) so server and client render the same thing
const spread = (i: number) => `${(i * 37 + 11) % 94}%`;
const dur = (i: number, base: number, range: number) => `${base + ((i * 7) % range)}s`;
const delay = (i: number, step: number) => `${-(i * step)}s`;

export default function SectionEffect({ kind }: { kind: Section["effect"] }) {
  if (kind === "none") return null;

  const top = (i: number) => `${(i * 53 + 9) % 88}%`;
  const items =
    kind === "balloons"
      ? Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="fx-item fx-rise" style={{ left: spread(i), animationDuration: dur(i, 10, 6), animationDelay: delay(i, 1.9) } as CSSProperties}>
            <span className="fx-sway" style={{ animationDuration: dur(i, 3, 3) }}>
              <i className="balloon" style={{ background: accent(i), color: accent(i), transform: `scale(${0.8 + (i % 4) * 0.15})` }} />
            </span>
          </span>
        ))
      : kind === "graffiti"
        ? WORDS.map((w, i) => (
            <span key={w} className="fx-item fx-fade-fall font-comic" style={{ left: spread(i), color: accent(i), fontSize: `${22 + (i % 4) * 8}px`, animationDuration: dur(i, 9, 5), animationDelay: delay(i, 1.6), ["--r" as string]: `${(i % 2 ? 1 : -1) * (6 + i * 3)}deg` } as CSSProperties}>
              {w}
            </span>
          ))
        : kind === "hearts"
          ? Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="fx-item fx-up" style={{ left: spread(i), animationDuration: dur(i, 8, 6), animationDelay: delay(i, 1.3) } as CSSProperties}>
                <span className="fx-sway" style={{ animationDuration: dur(i, 2, 3) }}>
                  <svg viewBox="0 0 24 24" width={16 + (i % 4) * 8} height={16 + (i % 4) * 8} fill={accent(i)} opacity=".75">
                    <path d="M12 21s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.400-9 12-9 12z" />
                  </svg>
                </span>
              </span>
            ))
          : kind === "stars"
            ? Array.from({ length: 22 }, (_, i) => (
                <svg key={i} className="fx-star" viewBox="0 0 24 24" width={10 + (i % 4) * 6} height={10 + (i % 4) * 6} style={{ left: spread(i), top: top(i), animationDuration: dur(i, 2, 3), animationDelay: delay(i, 0.45), fill: i % 3 === 0 ? "#fbbf24" : accent(i) } as CSSProperties}>
                  <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" />
                </svg>
              ))
            : kind === "snow"
              ? Array.from({ length: 28 }, (_, i) => (
                  <span key={i} className="fx-item fx-snow" style={{ left: spread(i), animationDuration: dur(i, 9, 7), animationDelay: delay(i, 0.8), fontSize: `${10 + (i % 4) * 5}px` } as CSSProperties}>
                    <span className="fx-sway" style={{ animationDuration: dur(i, 2, 3), color: "#7dd3fc" }}>{i % 3 ? "❄" : "❅"}</span>
                  </span>
                ))
              : kind === "rain"
                ? Array.from({ length: 34 }, (_, i) => (
                    <i key={i} className="fx-item fx-rain" style={{ left: spread(i), animationDuration: `${0.8 + ((i * 7) % 7) / 10}s`, animationDelay: delay(i, 0.21), background: "linear-gradient(to bottom, transparent, #7dd3fc)" } as CSSProperties} />
                  ))
                : kind === "bubbles"
                  ? Array.from({ length: 14 }, (_, i) => (
                      <span key={i} className="fx-item fx-up" style={{ left: spread(i), animationDuration: dur(i, 9, 7), animationDelay: delay(i, 1.4) } as CSSProperties}>
                        <span className="fx-sway" style={{ animationDuration: dur(i, 3, 3) }}>
                          <i className="bubble" style={{ width: 18 + (i % 5) * 10, height: 18 + (i % 5) * 10, borderColor: accent(i) }} />
                        </span>
                      </span>
                    ))
                  : kind === "fireflies"
                    ? Array.from({ length: 18 }, (_, i) => (
                        <i key={i} className="fx-firefly" style={{ left: spread(i), top: top(i), animationDuration: dur(i, 6, 6), animationDelay: delay(i, 0.9) } as CSSProperties} />
                      ))
                    : Array.from({ length: 26 }, (_, i) => (
                        <i key={i} className="fx-item fx-fall confetti" style={{ left: spread(i), background: i % 6 === 5 ? "#fbbf24" : accent(i), animationDuration: dur(i, 6, 5), animationDelay: delay(i, 0.7) } as CSSProperties} />
                      ));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
      {items}
    </div>
  );
}
