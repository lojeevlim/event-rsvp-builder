"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Settings } from "@/lib/settings-shared";
import { hexMix } from "@/lib/color";
import { asSealId, SealEmblem, WaxSeal } from "@/components/Seal";

const EASE = [0.22, 1, 0.36, 1] as const;
const FONTS: Record<Intro["font"], string> = {
  serif: "Georgia, 'Times New Roman', serif",
  script: "'Brush Script MT', 'Segoe Script', 'Snell Roundhand', cursive",
  sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  rounded: "'Trebuchet MS', 'Arial Rounded MT Bold', sans-serif",
};
/** Envelope outlines: corner radius (px, of 300 wide), the front pocket and the flap (both drawn in a 300-wide box). */
const SHAPES: Record<Intro["shape"], { radius: number; pocket: string; flap: string; flapH: number }> = {
  classic: { radius: 22, pocket: "M0 22Q0 0 22 0L132 104Q150 118 168 104L278 0Q300 0 300 22V178Q300 200 278 200H22Q0 200 0 178Z", flap: "M0 22Q0 0 22 0H278Q300 0 300 22L168 108Q150 122 132 108Z", flapH: 116 },
  sharp: { radius: 3, pocket: "M0 0L150 112L300 0V200H0Z", flap: "M0 0H300L150 116Z", flapH: 116 },
  soft: { radius: 46, pocket: "M0 46Q0 0 46 0L130 100Q150 124 170 100L254 0Q300 0 300 46V154Q300 200 254 200H46Q0 200 0 154Z", flap: "M0 46Q0 0 46 0H254Q300 0 300 46L170 106Q150 130 130 106Z", flapH: 120 },
  arch: { radius: 22, pocket: "M0 22Q0 0 22 0Q70 70 150 76Q230 70 278 0Q300 0 300 22V178Q300 200 278 200H22Q0 200 0 178Z", flap: "M0 22Q0 0 22 0H278Q300 0 300 22Q290 90 150 126Q10 90 0 22Z", flapH: 128 },
};
// small sparkles that fly out when the seal breaks: [dx, dy, size, delay]
const SPARKS: [number, number, number, number][] = [[-120, -70, 10, 0], [110, -90, 12, 0.05], [-150, 10, 8, 0.1], [150, 20, 9, 0.02], [-70, -130, 7, 0.12], [70, -140, 8, 0.08], [-40, 80, 7, 0.14], [50, 90, 9, 0.06]];

type Intro = Settings["page"]["intro"];

/** A text that is just text on the live page, and an editable field in the editor. */
function Txt({ value, onChange, placeholder, className, style }: { value: string; onChange: (v: string) => void; placeholder: string; className: string; style?: CSSProperties }) {
  return <input style={style} value={value} placeholder={placeholder} aria-label={placeholder} maxLength={80} onChange={(e) => onChange(e.target.value)} className={`w-full min-w-0 rounded-md border border-dashed border-transparent bg-transparent text-center outline-none transition-colors placeholder:opacity-40 hover:border-accent-400 focus:border-accent-600 focus:bg-white/60 ${className}`} />;
}

/** The first screen: a sealed envelope on a soft, light background. Tapping it breaks the wax seal, opens the flap, slides the letter out, and the page appears.
 *  Its shape, paper, seal, background, writing and font all come from the page settings.
 *  With `edit` it sits inside the editor instead of covering the screen: its texts can be typed over, and tapping the envelope just plays the opening again. */
export default function EnvelopeIntro({ intro, top = 0, edit }: { intro: Intro; top?: number; edit?: { onChange: (p: Partial<Intro>) => void; autoplay: boolean } }) {
  const [phase, setPhase] = useState<"closed" | "opening" | "gone">(edit?.autoplay ? "opening" : "closed");
  const [flapBehind, setFlapBehind] = useState(false);
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);

  // while it is up, nothing behind it scrolls
  useEffect(() => {
    const el = box.current;
    if (!el || phase === "gone" || edit) return;
    const stop = (e: Event) => e.preventDefault();
    el.addEventListener("wheel", stop, { passive: false });
    el.addEventListener("touchmove", stop, { passive: false });
    return () => {
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchmove", stop);
    };
  }, [phase, edit]);

  useEffect(() => {
    if (phase !== "opening") return;
    const half = window.setTimeout(() => setFlapBehind(true), 520);
    // on the live page the envelope goes away; in the editor it closes again so it can be played again
    const done = window.setTimeout(() => {
      setPhase(edit ? "closed" : "gone");
      if (edit) setFlapBehind(false);
    }, 2700);
    return () => {
      window.clearTimeout(half);
      window.clearTimeout(done);
    };
  }, [phase, edit]);

  const seal = asSealId(intro.seal);
  const letter = (intro.sender.replace(/\{name\}/gi, "").trim()[0] ?? "A").toUpperCase();
  const shape = SHAPES[intro.shape];
  const open = () => (reduce ? setPhase("gone") : phase === "closed" && setPhase("opening"));
  const opening = phase === "opening";

  // paper: the envelope's colour and the shades made from it
  const paper = intro.paper || "#fbf7ef";
  const front = [hexMix(paper, 45, "#ffffff"), hexMix(paper, 90, "#000000")];
  const flap = [hexMix(paper, 55, "#ffffff"), hexMix(paper, 84, "#000000")];
  const lining = hexMix(paper, 80, "#000000");
  const sheet = [hexMix(paper, 30, "#ffffff"), hexMix(paper, 92, "#ffffff")];
  const fontFamily = FONTS[intro.font];
  const ink: CSSProperties = intro.textColor ? { color: intro.textColor } : {};
  const radiusPx = `${Math.round((shape.radius / 300) * 440)}px`;

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          ref={box}
          key="intro"
          role="dialog"
          aria-label="Open your invitation"
          className={`flex flex-col items-center justify-center gap-7 overflow-hidden px-5 ${edit ? "relative min-h-[680px] w-full rounded-2xl py-10 ring-1 ring-border" : "fixed inset-x-0 bottom-0 z-[90]"}`}
          style={{ top: edit ? undefined : top, background: `linear-gradient(180deg, ${intro.bgFrom || "#ffffff"} 0%, ${intro.bgTo || "var(--color-accent-100)"} 100%)` }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.12, filter: "blur(10px)" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <motion.div className="relative z-10 grid justify-items-center gap-2 text-center" initial={{ opacity: 0, y: 14 }} animate={opening ? { opacity: 0, y: -22 } : { opacity: 1, y: 0 }} transition={{ duration: opening ? 0.5 : 0.9, delay: opening ? 0 : 0.15, ease: EASE }}>
            {edit ? (
              <>
                <Txt value={intro.title} onChange={(title) => edit.onChange({ title })} placeholder="Heading" style={{ ...ink, fontFamily }} className="text-[11px] font-semibold uppercase tracking-[0.34em] text-fg/60 sm:text-xs" />
                <Txt value={intro.sender} onChange={(sender) => edit.onChange({ sender })} placeholder="From — {name} is the event name" style={{ ...ink, fontFamily }} className={`text-4xl leading-tight text-accent-800 sm:text-5xl ${intro.font === "script" ? "" : "italic"}`} />
              </>
            ) : (
              <>
                {intro.title && <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-fg/60 sm:text-xs" style={{ ...ink, fontFamily }}>{intro.title}</p>}
                {intro.sender && <p className={`max-w-[88vw] text-balance text-4xl leading-tight text-accent-800 sm:text-5xl ${intro.font === "script" ? "" : "italic"}`} style={{ ...ink, fontFamily }}>{intro.sender}</p>}
              </>
            )}
            <span aria-hidden className="mt-1 flex items-center gap-2 text-accent-600" style={ink}><span className="h-px w-10 bg-current opacity-50" /><SealEmblem id={seal} letter={letter} size={14} /><span className="h-px w-10 bg-current opacity-50" /></span>
          </motion.div>

          <motion.button
            type="button"
            onClick={open}
            aria-label="Open the envelope"
            className="relative z-10 block w-[min(88vw,440px)] cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-accent-400/50"
            style={{ aspectRatio: "3 / 2", perspective: 1400 }}
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.25, ease: EASE }}
            whileHover={opening ? undefined : { y: -4 }}
          >
            <motion.span className="absolute inset-0 block" animate={opening ? { y: 34, scale: 0.95 } : { y: [0, -6, 0] }} transition={opening ? { duration: 1, delay: 0.9, ease: EASE } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <span className="absolute inset-0 block shadow-[0_34px_60px_-22px_rgba(0,0,0,0.45)]" style={{ borderRadius: radiusPx }} />
              {/* inside of the envelope, with a lining */}
              <span className="absolute inset-0 block ring-1 ring-black/10" style={{ borderRadius: radiusPx, backgroundColor: lining, backgroundImage: "repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 8px, transparent 8px 16px)" }} />
              {/* the letter */}
              <motion.span
                className="absolute inset-x-[5%] bottom-[5%] top-[7%] z-[1] flex flex-col items-center justify-center p-4 text-center shadow-lg ring-1 ring-black/10"
                style={{ borderRadius: Math.max(4, shape.radius * 0.6), background: `linear-gradient(180deg, ${sheet[0]}, ${sheet[1]})` }}
                animate={opening ? { y: "-64%", scale: 1.04 } : { y: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.85, ease: EASE }}
              >
                <span className="absolute inset-2 block border border-black/10" style={{ borderRadius: Math.max(2, shape.radius * 0.45) }} />
                {intro.letter ? (
                  <span className="relative text-balance px-2 text-lg font-semibold leading-snug text-accent-800" style={{ ...ink, fontFamily }}>{intro.letter}</span>
                ) : (
                  <>
                    <span className="relative block h-1.5 w-1/3 rounded-full bg-accent-300" />
                    <span className="relative mt-3 block h-1 w-1/2 rounded-full bg-black/10" />
                    <span className="relative mt-2 block h-1 w-2/5 rounded-full bg-black/10" />
                  </>
                )}
              </motion.span>
              {/* front pocket */}
              <svg aria-hidden className="absolute inset-0 z-[2] h-full w-full drop-shadow-[0_-2px_3px_rgba(0,0,0,0.12)]" viewBox="0 0 300 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="env-pocket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={front[0]} /><stop offset="1" stopColor={front[1]} /></linearGradient>
                </defs>
                <path d={shape.pocket} fill="url(#env-pocket)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
              </svg>
              {/* the flap */}
              <motion.span aria-hidden className="absolute inset-x-0 top-0 block" style={{ height: `${(shape.flapH / 200) * 100}%`, transformOrigin: "top", zIndex: flapBehind ? 0 : 3 }} animate={opening ? { rotateX: 180 } : { rotateX: 0 }} transition={{ duration: 0.85, delay: 0.25, ease: EASE }}>
                <svg className="h-full w-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.18)]" viewBox={`0 0 300 ${shape.flapH}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="env-flap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={flap[0]} /><stop offset="1" stopColor={flap[1]} /></linearGradient>
                  </defs>
                  <path d={shape.flap} fill="url(#env-flap)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                </svg>
              </motion.span>
              {/* sparkles when the seal breaks */}
              {opening && SPARKS.map(([dx, dy, size, delay], i) => (
                <motion.span key={i} aria-hidden className="pointer-events-none absolute left-1/2 z-[5] text-accent-500" style={{ top: `${(shape.flapH / 200) * 100}%`, fontSize: size * 1.6, ...(intro.sealColor ? { color: intro.sealColor } : {}) }} initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }} animate={{ opacity: [0, 1, 0], x: dx, y: dy, scale: [0.3, 1.1, 0.6] }} transition={{ duration: 1.1, delay: delay + 0.1, ease: "easeOut" }}>✦</motion.span>
              ))}
              {/* the wax seal */}
              <motion.span
                aria-hidden
                className="absolute left-1/2 z-[4] block -translate-x-1/2 -translate-y-1/2"
                style={{ top: `${(shape.flapH / 200) * 100 - 2}%` }}
                animate={opening ? { scale: [1, 1.18, 0], opacity: [1, 1, 0], rotate: [0, -10, 18] } : { scale: [1, 1.04, 1] }}
                transition={opening ? { duration: 0.5 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <WaxSeal id={seal} letter={letter} size={84} color={intro.sealColor || undefined} />
              </motion.span>
            </motion.span>
          </motion.button>

          <motion.p
            className="relative z-10 rounded-full border border-accent-300 bg-white/70 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-800 shadow-sm backdrop-blur-sm"
            style={{ ...ink, ...(intro.textColor ? { borderColor: intro.textColor } : {}), fontFamily }}
            initial={{ opacity: 0 }}
            animate={opening ? { opacity: 0 } : { opacity: [0.55, 1, 0.55] }}
            transition={opening ? { duration: 0.3 } : { duration: 2.4, repeat: Infinity }}
          >
            {edit ? <Txt value={intro.hint} onChange={(hint) => edit.onChange({ hint })} placeholder="Hint" style={{ ...ink, fontFamily }} className="uppercase tracking-[0.28em] text-accent-800" /> : intro.hint}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
