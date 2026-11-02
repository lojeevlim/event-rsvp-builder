import type { CSSProperties, ReactNode } from "react";

/** Extra animated illustrations (food, holidays, love, nature). Same conventions as ArtSvg.tsx; animation classes live in globals.css. */
const dl = (s: number): CSSProperties => ({ animationDelay: `${s}s` });
const pivot = (x: number, y: number): CSSProperties => ({ transformBox: "view-box", transformOrigin: `${x}px ${y}px` });
const sparkle = (x: number, y: number, k = 1) => `M${x} ${y - 7 * k}Q${x} ${y} ${x + 7 * k} ${y}Q${x} ${y} ${x} ${y + 7 * k}Q${x} ${y} ${x - 7 * k} ${y}Q${x} ${y} ${x} ${y - 7 * k}z`;

const steam = (x: number, y: number) => (
  <>
    <circle className="art-smoke" cx={x} cy={y} r="3" fill="#cbd5e1" />
    <circle className="art-smoke" style={dl(0.9)} cx={x + 5} cy={y} r="2.500" fill="#e2e8f0" />
  </>
);

export type ArtEntry = { label: string; svg: ReactNode };

export const ART_MORE: Record<string, ArtEntry> = {
  /* ---------- fast food ---------- */
  burger: {
    label: "Burger",
    svg: (
      <>
        <g className="art-bob">
          <path d="M10 30Q10 10 32 10Q54 10 54 30z" fill="#f59e0b" />
          <ellipse cx="22" cy="19" rx="2.500" ry="1.400" fill="#fde68a" />
          <ellipse cx="32" cy="15" rx="2.500" ry="1.400" fill="#fde68a" />
          <ellipse cx="42" cy="20" rx="2.500" ry="1.400" fill="#fde68a" />
          <ellipse cx="30" cy="24" rx="2.500" ry="1.400" fill="#fde68a" />
        </g>
        <path d="M8 32q4 5 8 0t8 0 8 0 8 0 8 0 8 0" stroke="#22c55e" strokeWidth="4.500" strokeLinecap="round" fill="none" />
        <path d="M10 36h44l-7 8-8-8-8 8-8-8-8 8z" fill="#fde047" />
        <rect x="9" y="40" width="46" height="9" rx="4.500" fill="#78350f" />
        <path d="M10 51h44v3q0 6-8 6H18q-8 0-8-6z" fill="#f59e0b" />
      </>
    ),
  },
  fries: {
    label: "French fries",
    svg: (
      <>
        {[
          [17, 8, 18, "#fde047", 0],
          [22, 4, 22, "#facc15", 0.3],
          [27, 9, 17, "#fde047", 0.6],
          [32, 3, 23, "#facc15", 0.2],
          [37, 8, 18, "#fde047", 0.5],
          [42, 5, 21, "#facc15", 0.8],
          [46, 10, 16, "#fde047", 0.1],
        ].map(([x, y, h, c, d], i) => (
          <rect key={i} className="art-bob" style={dl(Number(d))} x={x} y={y} width="4.500" height={Number(h) + 12} rx="1.500" fill={String(c)} />
        ))}
        <path d="M13 30h38l-4.500 28H17.500z" fill="#ef4444" />
        <path d="M13 30h38l-.8 5H13.800z" fill="#dc2626" />
        <path d="M32 36v22" stroke="#fde047" strokeWidth="5" opacity=".9" />
      </>
    ),
  },
  "fried-chicken": {
    label: "Fried chicken",
    svg: (
      <>
        <g className="art-bob">
          <path d="M8 30C8 14 26 6 40 14c11 8 5 24-10 28C17 45 8 41 8 30z" fill="#ea580c" />
          <circle cx="20" cy="22" r="2" fill="#fbbf24" />
          <circle cx="30" cy="18" r="2.200" fill="#fbbf24" />
          <circle cx="36" cy="28" r="2" fill="#fbbf24" />
          <circle cx="22" cy="34" r="1.800" fill="#fbbf24" />
          <path d="M36 38L52 54" stroke="#fef3c7" strokeWidth="5" strokeLinecap="round" />
          <circle cx="54" cy="55" r="3.800" fill="#fef3c7" />
          <circle cx="58" cy="50" r="3.800" fill="#fef3c7" />
        </g>
        {steam(14, 8)}
      </>
    ),
  },
  "chicken-bucket": {
    label: "Chicken bucket",
    svg: (
      <>
        <circle className="art-bob" cx="21" cy="22" r="9" fill="#ea580c" />
        <circle className="art-bob" style={dl(0.4)} cx="33" cy="16" r="10" fill="#c2410c" />
        <circle className="art-bob" style={dl(0.8)} cx="44" cy="23" r="9" fill="#ea580c" />
        <path d="M13 28h38l-4.500 30h-29z" fill="#fff" />
        <path d="M20 28l2 30M32 28v30M44 28l-2 30" stroke="#ef4444" strokeWidth="6" />
        <rect x="11" y="24" width="42" height="7" rx="3.500" fill="#ef4444" />
      </>
    ),
  },
  spaghetti: {
    label: "Spaghetti",
    svg: (
      <>
        <ellipse cx="32" cy="48" rx="27" ry="10" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
        <ellipse cx="32" cy="40" rx="19" ry="10" fill="#fde047" />
        <path d="M18 38q14 6 28 0M20 43q12 5 24 0M22 34q10 4 20 0" stroke="#facc15" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M17 34q15-12 30 0q-15 8-30 0z" fill="#ef4444" />
        <circle className="art-bob" cx="25" cy="30" r="4.500" fill="#78350f" />
        <circle className="art-bob" style={dl(0.4)} cx="39" cy="30" r="4.500" fill="#78350f" />
        <circle className="art-bob" style={dl(0.8)} cx="32" cy="24" r="4.500" fill="#92400e" />
        {steam(20, 14)}
      </>
    ),
  },
  soda: {
    label: "Soda",
    svg: (
      <>
        <path d="M34 18l7-13h10" stroke="#ef4444" strokeWidth="3.500" strokeLinecap="round" fill="none" />
        <path d="M17 22h30l-4 36H21z" fill="#fff" />
        <path d="M18.500 33h27l-1.500 12H20z" fill="#ef4444" />
        <path d="M20 46h24l-1 12H21z" fill="#7c2d12" opacity=".85" />
        <rect x="14" y="17" width="36" height="6" rx="3" fill="#e2e8f0" />
        <circle className="art-bubble" cx="26" cy="52" r="1.800" fill="#fff" />
        <circle className="art-bubble" style={dl(0.7)} cx="36" cy="54" r="1.500" fill="#fff" />
        <circle className="art-bubble" style={dl(1.3)} cx="31" cy="50" r="1.300" fill="#fff" />
      </>
    ),
  },
  sundae: {
    label: "Sundae",
    svg: (
      <>
        <circle cx="25" cy="28" r="9" fill="#f9a8d4" />
        <circle cx="39" cy="28" r="9" fill="#fde68a" />
        <circle cx="32" cy="22" r="9" fill="#fef3c7" />
        <path d="M23 20q4 8 8 2t8 2 3-6q-4 6-10 4t-9-2z" fill="#78350f" />
        <path d="M16 32h32q0 14-16 17-16-3-16-17z" fill="#bae6fd" opacity=".8" />
        <rect x="30" y="48" width="4" height="8" fill="#94a3b8" />
        <rect x="21" y="55" width="22" height="4" rx="2" fill="#94a3b8" />
        <circle className="art-bob" cx="32" cy="10" r="4.500" fill="#ef4444" />
        <path d="M32 6q2-4 6-4" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  hotdog: {
    label: "Hot dog",
    svg: (
      <g className="art-sway">
        <rect x="6" y="28" width="52" height="24" rx="12" fill="#d97706" />
        <rect x="3" y="30" width="58" height="12" rx="6" fill="#b91c1c" />
        <path d="M6 36h52v8q0 12-12 12H18Q6 56 6 44z" fill="#fbbf24" />
        <path d="M7 35q4-5 8 0t8 0 8 0 8 0 8 0 8 0" stroke="#fde047" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M12 38q4-5 8 0t8 0 8 0 8 0 8 0" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  pizza: {
    label: "Pizza",
    svg: (
      <g className="art-bob">
        <path d="M32 60L7 15Q32 4 57 15z" fill="#fbbf24" />
        <path d="M7 15Q32 4 57 15" stroke="#d97706" strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle className="art-pulse" cx="24" cy="25" r="4.500" fill="#ef4444" />
        <circle className="art-pulse" style={dl(0.5)} cx="39" cy="24" r="4.500" fill="#ef4444" />
        <circle className="art-pulse" style={dl(1)} cx="32" cy="39" r="4.500" fill="#ef4444" />
        <circle cx="32" cy="27" r="1.800" fill="#166534" />
        <circle cx="29" cy="48" r="1.800" fill="#166534" />
        <path d="M24 40v6M40 36v7" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
  pie: {
    label: "Hand pie",
    svg: (
      <>
        <g className="art-sway">
          <rect x="6" y="20" width="52" height="32" rx="9" fill="#f59e0b" />
          <rect x="10" y="24" width="44" height="24" rx="6" fill="none" stroke="#d97706" strokeWidth="2.500" strokeDasharray="3 4" />
          <path d="M18 29l8 8M30 29l8 8M42 29l8 8M18 39l4 4M30 39l4 4" stroke="#b45309" strokeWidth="2.500" strokeLinecap="round" />
          <circle cx="50" cy="28" r="1.500" fill="#fde68a" />
        </g>
        {steam(24, 12)}
      </>
    ),
  },
  taco: {
    label: "Taco",
    svg: (
      <>
        <g className="art-bob">
          <path d="M8 40q4-10 10-10M56 40q-4-10-10-10" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="24" cy="26" r="4" fill="#ef4444" />
          <circle cx="38" cy="24" r="4" fill="#ef4444" />
          <circle cx="31" cy="30" r="4" fill="#92400e" />
        </g>
        <path d="M5 54a27 27 0 0 1 54 0z" fill="#fbbf24" />
        <path d="M10 54a22 22 0 0 1 44 0" fill="none" stroke="#f59e0b" strokeWidth="3" />
      </>
    ),
  },
  popcorn: {
    label: "Popcorn",
    svg: (
      <>
        {[
          [20, 24, 8],
          [31, 17, 9],
          [43, 22, 8],
          [36, 27, 7],
          [25, 15, 6],
          [48, 14, 5],
        ].map(([x, y, r], i) => (
          <circle key={i} className="art-bob" style={dl(i * 0.25)} cx={x} cy={y} r={r} fill={i % 2 ? "#fef3c7" : "#fde68a"} />
        ))}
        <path d="M13 28h38l-4.500 30h-29z" fill="#fff" />
        <path d="M20 28l2 30M32 28v30M44 28l-2 30" stroke="#ef4444" strokeWidth="6" />
      </>
    ),
  },
  "ice-cream": {
    label: "Ice cream",
    svg: (
      <>
        <path d="M19 33h26L32 61z" fill="#f59e0b" />
        <path d="M24 38l11 14M30 36l9 12M38 36l-12 14" stroke="#d97706" strokeWidth="1.800" />
        <g className="art-bob">
          <circle cx="32" cy="27" r="14" fill="#f9a8d4" />
          <path d="M18 30q4 6 7 0t7 0 7 0 7 0" fill="#f472b6" />
          <circle cx="32" cy="14" r="9" fill="#fde68a" />
          <circle cx="32" cy="5" r="3.500" fill="#ef4444" />
        </g>
      </>
    ),
  },
  bee: {
    label: "Happy bee",
    svg: (
      <g className="art-float">
        <ellipse className="art-flap" style={pivot(24, 20)} cx="24" cy="20" rx="8" ry="12" fill="#bae6fd" opacity=".85" transform="rotate(-25 24 20)" />
        <ellipse className="art-flap" style={pivot(40, 20)} cx="40" cy="20" rx="8" ry="12" fill="#bae6fd" opacity=".85" transform="rotate(25 40 20)" />
        <ellipse cx="32" cy="38" rx="20" ry="18" fill="#fde047" />
        <path d="M20 26q-4 12 0 24M32 21v34M44 26q4 12 0 24" stroke="#1e293b" strokeWidth="5" fill="none" />
        <circle cx="25" cy="34" r="3.500" fill="#fff" />
        <circle cx="39" cy="34" r="3.500" fill="#fff" />
        <circle cx="25.500" cy="34.500" r="1.800" fill="#0f172a" />
        <circle cx="39.500" cy="34.500" r="1.800" fill="#0f172a" />
        <path d="M27 42q5 5 10 0" stroke="#0f172a" strokeWidth="2.200" strokeLinecap="round" fill="none" />
        <circle cx="21" cy="40" r="2.200" fill="#fb7185" opacity=".6" />
        <circle cx="43" cy="40" r="2.200" fill="#fb7185" opacity=".6" />
        <path d="M28 21q-3-8-8-9M36 21q3-8 8-9" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    ),
  },

  /* ---------- food & drinks ---------- */
  donut: {
    label: "Donut",
    svg: (
      <g className="art-sway">
        <path d="M32 6a26 26 0 1 0 .01 0zM32 25a7 7 0 1 1-.01 0z" fillRule="evenodd" fill="#d97706" transform="translate(0 2)" />
        <path d="M32 8a24 24 0 1 0 .01 0zM32 25a7 7 0 1 1-.01 0z" fillRule="evenodd" fill="#f472b6" />
        {[
          [18, 22, 30, "#fde047"],
          [42, 20, -20, "#60a5fa"],
          [46, 36, 60, "#fff"],
          [30, 46, 10, "#34d399"],
          [16, 38, -50, "#fff"],
          [32, 14, 80, "#fde047"],
        ].map(([x, y, r, c], i) => (
          <rect key={i} className="art-blink" style={dl(i * 0.2)} x={Number(x) - 3} y={Number(y) - 1} width="6" height="2.200" rx="1" fill={String(c)} transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </g>
    ),
  },
  cookie: {
    label: "Cookie",
    svg: (
      <g className="art-bob">
        <circle cx="32" cy="32" r="25" fill="#d97706" />
        <circle cx="32" cy="32" r="25" fill="none" stroke="#b45309" strokeWidth="2" strokeDasharray="3 5" />
        <circle cx="22" cy="24" r="4" fill="#78350f" />
        <circle cx="38" cy="20" r="3.500" fill="#78350f" />
        <circle cx="42" cy="36" r="4.500" fill="#78350f" />
        <circle cx="26" cy="42" r="3.500" fill="#78350f" />
        <circle cx="32" cy="31" r="2.500" fill="#78350f" />
        <circle cx="50" cy="26" r="2" fill="#78350f" />
      </g>
    ),
  },
  coffee: {
    label: "Coffee",
    svg: (
      <>
        <path d="M46 28h4q8 0 8 7t-8 7h-4" stroke="#94a3b8" strokeWidth="3.500" fill="none" />
        <path d="M10 28h38v12q0 16-19 16T10 40z" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
        <ellipse cx="29" cy="28" rx="19" ry="4.500" fill="#78350f" />
        <path d="M24 28q5 2 10 0" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <ellipse cx="29" cy="58" rx="24" ry="3.500" fill="#cbd5e1" />
        <path className="art-smoke" d="M22 22q-4-6 0-10" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path className="art-smoke" style={dl(0.8)} d="M32 22q-4-6 0-10" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  boba: {
    label: "Bubble tea",
    svg: (
      <>
        <path d="M36 16l5-12" stroke="#f472b6" strokeWidth="4.500" strokeLinecap="round" />
        <path d="M16 18h32l-4 40H20z" fill="#fef3c7" opacity=".9" />
        <path d="M17.500 32h29l-2.500 26H20z" fill="#d6a46a" />
        <path d="M14 18q18-10 36 0z" fill="#e2e8f0" />
        {[
          [24, 54],
          [32, 55],
          [40, 54],
          [28, 49],
          [36, 49],
        ].map(([x, y], i) => (
          <circle key={i} className="art-bob" style={dl(i * 0.2)} cx={x} cy={y} r="3.200" fill="#1e293b" />
        ))}
      </>
    ),
  },
  sushi: {
    label: "Sushi",
    svg: (
      <g className="art-sway">
        <rect x="10" y="34" width="44" height="20" rx="10" fill="#fff" stroke="#e2e8f0" strokeWidth="1.500" />
        <path d="M8 38q24-16 48 0-2 10-24 10T8 38z" fill="#fb923c" />
        <path d="M18 34l4 10M28 31l3 12M38 31l-2 12M47 34l-5 10" stroke="#fff" strokeWidth="2" opacity=".7" strokeLinecap="round" />
        <rect x="29" y="30" width="7" height="26" rx="1" fill="#0f172a" />
      </g>
    ),
  },
  bbq: {
    label: "BBQ skewer",
    svg: (
      <>
        <path d="M5 59L59 5" stroke="#d6a46a" strokeWidth="3" strokeLinecap="round" />
        {[
          [20, 44, "#92400e"],
          [30, 34, "#b91c1c"],
          [40, 24, "#92400e"],
          [50, 14, "#b91c1c"],
        ].map(([x, y, c], i) => (
          <rect key={i} className="art-bob" style={dl(i * 0.3)} x={Number(x) - 7} y={Number(y) - 7} width="14" height="14" rx="4" fill={String(c)} transform={`rotate(-45 ${x} ${y})`} />
        ))}
        {steam(14, 40)}
      </>
    ),
  },
  "halo-halo": {
    label: "Halo-halo",
    svg: (
      <>
        <path d="M16 24h32l-5 34H21z" fill="#e0f2fe" />
        <path d="M17.500 32h29l-1.500 9H19z" fill="#fbbf24" />
        <path d="M19 41h26l-1.500 8H20.500z" fill="#f9a8d4" />
        <path d="M20.500 49h23l-.5 9H21.500z" fill="#fef3c7" />
        <g className="art-bob">
          <ellipse cx="32" cy="24" rx="17" ry="6" fill="#fff" />
          <circle cx="32" cy="15" r="10" fill="#a78bfa" />
          <circle cx="32" cy="5" r="3.500" fill="#ef4444" />
        </g>
        <path d="M48 12l8-8" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  cupcake2: {
    label: "Sprinkle cupcake",
    svg: (
      <>
        <path d="M14 34h36l-5 22H19z" fill="#60a5fa" />
        <path d="M22 34l2 22M32 34v22M42 34l-2 22" stroke="#fff" strokeWidth="1.500" opacity=".5" />
        <path d="M12 36c0-10 8-12 12-14 0-8 16-8 16 0 4 2 12 4 12 14z" fill="#fff" />
        <path d="M24 22q8-12 16 0" fill="#fde68a" />
        <circle className="art-blink" cx="22" cy="31" r="1.500" fill="#ef4444" />
        <circle className="art-blink" style={dl(0.4)} cx="34" cy="28" r="1.500" fill="#34d399" />
        <circle className="art-blink" style={dl(0.8)} cx="44" cy="32" r="1.500" fill="#f472b6" />
        <path className="art-twinkle" d={sparkle(32, 10, 1)} fill="#fde047" />
      </>
    ),
  },
  lollipop: {
    label: "Lollipop",
    svg: (
      <g className="art-sway">
        <rect x="30" y="34" width="4" height="26" rx="2" fill="#e2e8f0" />
        <circle cx="32" cy="22" r="18" fill="#f472b6" />
        <path d="M32 22m0 0a3 3 0 0 1 6 0 6 6 0 0 1-12 0 9 9 0 0 1 18 0 12 12 0 0 1-24 0" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path className="art-twinkle" d={sparkle(52, 8, 0.8)} fill="#fde047" />
      </g>
    ),
  },

  /* ---------- party ---------- */
  pinata: {
    label: "Piñata",
    svg: (
      <g className="art-swing" style={pivot(32, 2)}>
        <path d="M32 2v10" stroke="#94a3b8" strokeWidth="2" />
        <path d="M32 12l7 14 16 2-12 11 3 16-14-8-14 8 3-16L9 28l16-2z" fill="#fbbf24" />
        <path d="M32 12l7 14 16 2-12 11" fill="#f472b6" opacity=".9" />
        <path d="M32 12l-7 14L9 28l12 11" fill="#60a5fa" opacity=".9" />
        <path d="M32 40l-14 8 3-16" fill="#34d399" opacity=".9" />
        <path className="art-twinkle" d={sparkle(32, 30, 1)} fill="#fff" />
      </g>
    ),
  },

  /* ---------- holidays ---------- */
  pumpkin: {
    label: "Pumpkin",
    svg: (
      <>
        <g className="art-bob">
          <path d="M28 12q2-6 8-6" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" fill="none" />
          <ellipse cx="32" cy="38" rx="25" ry="20" fill="#f97316" />
          <path d="M32 18q-8 20 0 40M20 20q-10 18-2 36M44 20q10 18 2 36" stroke="#ea580c" strokeWidth="2.500" fill="none" />
          <path className="art-blink" d="M20 32l6 0-3-7zM38 32l6 0-3-7z" fill="#fde047" />
          <path className="art-blink" d="M22 44l4-3 3 3 3-3 3 3 3-3 4 3-4 5-3-3-3 3-3-3-3 3z" fill="#fde047" />
        </g>
      </>
    ),
  },
  ghost: {
    label: "Ghost",
    svg: (
      <g className="art-float">
        <path d="M10 58V30Q10 6 32 6t22 24v28l-7.500-6L40 58l-8-6-8 6-6.500-6z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.500" />
        <circle cx="25" cy="29" r="3.500" fill="#0f172a" />
        <circle cx="39" cy="29" r="3.500" fill="#0f172a" />
        <ellipse cx="32" cy="40" rx="4" ry="5" fill="#0f172a" />
        <circle cx="19" cy="37" r="3" fill="#fecdd3" />
        <circle cx="45" cy="37" r="3" fill="#fecdd3" />
      </g>
    ),
  },
  "easter-egg": {
    label: "Easter egg",
    svg: (
      <g className="art-sway">
        <path d="M32 6C18 6 10 26 10 38c0 12 10 20 22 20s22-8 22-20C54 26 46 6 32 6z" fill="#a78bfa" />
        <path d="M11 34l7-6 7 6 7-6 7 6 7-6 7 6" stroke="#fde047" strokeWidth="3.500" fill="none" strokeLinejoin="round" />
        <circle cx="20" cy="46" r="2.500" fill="#fff" />
        <circle cx="32" cy="48" r="2.500" fill="#f472b6" />
        <circle cx="44" cy="46" r="2.500" fill="#fff" />
        <circle cx="30" cy="18" r="2.500" fill="#fff" />
        <path className="art-twinkle" d={sparkle(50, 12, 0.8)} fill="#fde047" />
      </g>
    ),
  },
  gingerbread: {
    label: "Gingerbread man",
    svg: (
      <g className="art-sway">
        <circle cx="32" cy="14" r="10" fill="#b45309" />
        <path d="M22 25h20l14 6-4 8-9-3v9l7 11-7 4-9-11-9 11-7-4 7-11V36l-9 3-4-8z" fill="#b45309" />
        <circle cx="28" cy="12" r="1.500" fill="#fff" />
        <circle cx="36" cy="12" r="1.500" fill="#fff" />
        <path d="M27 17q5 4 10 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle className="art-blink" cx="32" cy="30" r="2.200" fill="#ef4444" />
        <circle className="art-blink" style={dl(0.5)} cx="32" cy="38" r="2.200" fill="#22c55e" />
        <path d="M16 31l-4 7M48 31l4 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  stocking: {
    label: "Stocking",
    svg: (
      <g className="art-swing" style={pivot(32, 6)}>
        <path d="M20 8h22v28l14 10q5 5 0 10l-3 3q-5 5-10 0L20 42z" fill="#ef4444" />
        <rect x="17" y="4" width="28" height="12" rx="5" fill="#fff" />
        <path d="M46 52q3-3 7-1" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M24 24h14M24 30h14" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".6" />
        <path className="art-twinkle" d={sparkle(52, 14, 0.8)} fill="#fde047" />
      </g>
    ),
  },

  /* ---------- love & wedding ---------- */
  rose: {
    label: "Rose",
    svg: (
      <g className="art-sway">
        <path d="M32 34v28" stroke="#16a34a" strokeWidth="4" />
        <path d="M32 50q-12-2-14-10 10 0 14 10zM32 54q12-2 14-10-10 0-14 10z" fill="#22c55e" />
        <circle cx="32" cy="22" r="16" fill="#ef4444" />
        <path d="M32 22m-3 0a3 3 0 1 1 6 0 6 6 0 1 1-12 0 9 9 0 1 1 18 0" stroke="#991b1b" strokeWidth="2.500" fill="none" strokeLinecap="round" />
        <path className="art-twinkle" d={sparkle(54, 10, 0.8)} fill="#fff" />
      </g>
    ),
  },
  "love-letter": {
    label: "Love letter",
    svg: (
      <>
        <rect x="6" y="20" width="52" height="36" rx="5" fill="#fecdd3" />
        <path d="M6 24l26 19 26-19" stroke="#f472b6" strokeWidth="3" fill="none" strokeLinejoin="round" />
        <path className="art-beat" d="M32 54c-8-6-12-10-9-14 2-3 7-3 9 1 2-4 7-4 9-1 3 4-1 8-9 14z" fill="#ef4444" />
        <path className="art-bubble" d="M20 20c-3-2-5 1-3 3l3 3 3-3c2-2 0-5-3-3z" fill="#f472b6" />
        <path className="art-bubble" style={dl(0.9)} d="M44 18c-3-2-5 1-3 3l3 3 3-3c2-2 0-5-3-3z" fill="#fb7185" />
      </>
    ),
  },
  "wedding-cake": {
    label: "Wedding cake",
    svg: (
      <>
        <rect x="12" y="42" width="40" height="16" rx="3" fill="#fff" stroke="#e2e8f0" strokeWidth="1.500" />
        <rect x="18" y="29" width="28" height="14" rx="3" fill="#fef3c7" stroke="#e2e8f0" strokeWidth="1.500" />
        <rect x="24" y="18" width="16" height="12" rx="3" fill="#fff" stroke="#e2e8f0" strokeWidth="1.500" />
        <path d="M12 47q4 5 8 0t8 0 8 0 8 0 8 0M18 34q4 4 7 0t7 0 7 0 7 0" stroke="#f9a8d4" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path className="art-beat" d="M32 18c-5-4-8-7-6-10 1.500-2 4.500-2 6 .5 1.500-2.500 4.500-2.500 6-.5 2 3-1 6-6 10z" fill="#ef4444" />
        <path className="art-twinkle" d={sparkle(12, 20, 0.8)} fill="#fde047" />
        <path className="art-twinkle" style={dl(0.7)} d={sparkle(54, 26, 0.7)} fill="#fde047" />
      </>
    ),
  },

  /* ---------- achievements ---------- */
  medal: {
    label: "Medal",
    svg: (
      <g className="art-swing" style={pivot(32, 2)}>
        <path d="M16 2l12 24h8L22 2zM48 2L36 26h-8L42 2z" fill="#ef4444" />
        <path d="M22 2l6 12M42 2l-6 12" stroke="#3b82f6" strokeWidth="4" />
        <circle cx="32" cy="42" r="18" fill="#fbbf24" />
        <circle cx="32" cy="42" r="13" fill="none" stroke="#f59e0b" strokeWidth="2.500" />
        <path className="art-twinkle" d="M32 33l3 6.500 7 .8-5.200 4.800 1.500 7L32 48.500 25.700 52l1.500-7-5.200-4.800 7-.8z" fill="#fff7ed" />
      </g>
    ),
  },

  /* ---------- nature & fun ---------- */
  sun: {
    label: "Sun",
    svg: (
      <>
        <g className="art-spin-slow" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round">
          <path d="M32 3v8M32 53v8M3 32h8M53 32h8M11.500 11.500l5.600 5.600M46.900 46.900l5.600 5.600M52.500 11.500l-5.600 5.600M17.100 46.900l-5.600 5.600" />
        </g>
        <circle className="art-pulse" cx="32" cy="32" r="16" fill="#fde047" />
        <circle cx="26" cy="29" r="2" fill="#92400e" />
        <circle cx="38" cy="29" r="2" fill="#92400e" />
        <path d="M26 36q6 5 12 0" stroke="#92400e" strokeWidth="2.200" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  cloud: {
    label: "Cloud",
    svg: (
      <>
        <g className="art-wave">
          <path d="M16 46a12 12 0 0 1 2-24 16 16 0 0 1 30 4 10 10 0 0 1 0 20z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
        </g>
        <path className="art-bubble" d="M22 54v5" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
        <path className="art-bubble" style={dl(0.6)} d="M32 54v5" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
        <path className="art-bubble" style={dl(1.2)} d="M42 54v5" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  flower: {
    label: "Flower",
    svg: (
      <g className="art-sway">
        <path d="M32 34v28" stroke="#16a34a" strokeWidth="4" />
        <path d="M32 54q-12-2-14-10 10 0 14 10z" fill="#22c55e" />
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="32" cy="12" rx="7" ry="10" fill="#f472b6" transform={`rotate(${r} 32 24)`} />
        ))}
        <circle cx="32" cy="24" r="7" fill="#fde047" />
      </g>
    ),
  },
  butterfly: {
    label: "Butterfly",
    svg: (
      <g className="art-float">
        <g className="art-flap" style={pivot(32, 32)}>
          <path d="M32 30C24 10 6 10 8 26c1 10 12 12 24 6z" fill="#a78bfa" />
          <path d="M32 30C40 10 58 10 56 26c-1 10-12 12-24 6z" fill="#a78bfa" />
          <path d="M32 34C22 34 12 40 16 50c4 8 14 2 16-8z" fill="#f472b6" />
          <path d="M32 34c10 0 20 6 16 16-4 8-14 2-16-8z" fill="#f472b6" />
          <circle cx="18" cy="23" r="3.500" fill="#fff" opacity=".7" />
          <circle cx="46" cy="23" r="3.500" fill="#fff" opacity=".7" />
        </g>
        <rect x="30" y="22" width="4" height="26" rx="2" fill="#1e293b" />
        <path d="M31 22q-3-8-8-10M33 22q3-8 8-10" stroke="#1e293b" strokeWidth="1.800" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  rocket: {
    label: "Rocket",
    svg: (
      <g className="art-bob">
        <path className="art-pulse" d="M26 46q6 18 12 0z" fill="#fb923c" />
        <path className="art-pulse" style={dl(0.2)} d="M29 46q3 10 6 0z" fill="#fde047" />
        <path d="M32 4q14 12 12 34H20Q18 16 32 4z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.500" />
        <path d="M20 30l-8 14 10-2zM44 30l8 14-10-2z" className="a5" />
        <circle cx="32" cy="24" r="6" fill="#38bdf8" stroke="#64748b" strokeWidth="2" />
        <path d="M32 4q8 7 11 16H21q3-9 11-16z" className="a5" />
        <path className="art-twinkle" d={sparkle(10, 14, 0.8)} fill="#fde047" />
        <path className="art-twinkle" style={dl(0.8)} d={sparkle(54, 54, 0.8)} fill="#fff" />
      </g>
    ),
  },
  paw: {
    label: "Paw print",
    svg: (
      <g className="art-bob">
        <ellipse cx="32" cy="42" rx="14" ry="11" fill="#92400e" />
        <ellipse cx="14" cy="28" rx="5.500" ry="7.500" fill="#92400e" transform="rotate(-20 14 28)" />
        <ellipse cx="25" cy="16" rx="5.500" ry="8" fill="#92400e" transform="rotate(-8 25 16)" />
        <ellipse cx="39" cy="16" rx="5.500" ry="8" fill="#92400e" transform="rotate(8 39 16)" />
        <ellipse cx="50" cy="28" rx="5.500" ry="7.500" fill="#92400e" transform="rotate(20 50 28)" />
      </g>
    ),
  },
  cat: {
    label: "Cat",
    svg: (
      <g className="art-bob">
        <path d="M10 28L12 6l14 10zM54 28L52 6 38 16z" fill="#fbbf24" />
        <path d="M14 18l1-7 6 5zM50 18l-1-7-6 5z" fill="#fda4af" />
        <ellipse cx="32" cy="36" rx="24" ry="21" fill="#fbbf24" />
        <ellipse className="art-blink" cx="23" cy="32" rx="3" ry="4" fill="#0f172a" />
        <ellipse className="art-blink" cx="41" cy="32" rx="3" ry="4" fill="#0f172a" />
        <path d="M29 40h6l-3 4z" fill="#fb7185" />
        <path d="M32 44q-3 4-7 2M32 44q3 4 7 2" stroke="#92400e" strokeWidth="1.800" fill="none" strokeLinecap="round" />
        <path d="M8 38l11 2M8 44l11-2M56 38l-11 2M56 44l-11-2" stroke="#92400e" strokeWidth="1.500" strokeLinecap="round" />
      </g>
    ),
  },
  teddy: {
    label: "Teddy bear",
    svg: (
      <g className="art-sway">
        <circle cx="14" cy="16" r="9" fill="#b45309" />
        <circle cx="50" cy="16" r="9" fill="#b45309" />
        <circle cx="14" cy="16" r="4.500" fill="#fcd34d" />
        <circle cx="50" cy="16" r="4.500" fill="#fcd34d" />
        <circle cx="32" cy="32" r="23" fill="#b45309" />
        <ellipse cx="32" cy="40" rx="11" ry="9" fill="#fcd34d" />
        <circle cx="23" cy="28" r="3" fill="#0f172a" />
        <circle cx="41" cy="28" r="3" fill="#0f172a" />
        <ellipse cx="32" cy="37" rx="4" ry="3" fill="#0f172a" />
        <path d="M32 40v3q-3 3-6 1M32 43q3 3 6 1" stroke="#0f172a" strokeWidth="1.800" fill="none" strokeLinecap="round" />
        <path d="M24 56q8 6 16 0l-3 5H27z" fill="#ef4444" />
      </g>
    ),
  },
  fish: {
    label: "Goldfish",
    svg: (
      <>
        <g className="art-wave">
          <path d="M8 32q12-18 30-8l14-10v36L38 40Q20 50 8 32z" fill="#fb923c" />
          <path d="M38 24l14-10v36L38 40z" fill="#f97316" />
          <circle cx="18" cy="30" r="3" fill="#fff" />
          <circle cx="18.500" cy="30" r="1.500" fill="#0f172a" />
          <path d="M26 28q4 4 0 8" stroke="#ea580c" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
        <circle className="art-bubble" cx="8" cy="22" r="2.200" fill="#bae6fd" />
        <circle className="art-bubble" style={dl(0.8)} cx="12" cy="14" r="1.800" fill="#bae6fd" />
      </>
    ),
  },
  nuggets: {
    label: "Nuggets",
    svg: (
      <>
        <g className="art-bob">
          <path d="M6 32q-1-12 12-13t13 9q1 12-11 14T6 32z" fill="#f59e0b" />
          <path d="M14 44q-2-8 8-9t10 7q0 10-9 10t-9-8z" fill="#d97706" />
          <circle cx="14" cy="28" r="1.500" fill="#fde68a" />
          <circle cx="24" cy="26" r="1.500" fill="#fde68a" />
          <circle cx="24" cy="44" r="1.500" fill="#fde68a" />
        </g>
        <path d="M38 34h18l-2.500 22h-13z" fill="#ef4444" />
        <ellipse cx="47" cy="34" rx="9" ry="3" fill="#b91c1c" />
        <ellipse cx="47" cy="33.500" rx="6" ry="1.800" fill="#f59e0b" />
        {steam(14, 12)}
      </>
    ),
  },
  milkshake: {
    label: "Milkshake",
    svg: (
      <>
        <path d="M37 18l5-13h9" stroke="#ef4444" strokeWidth="3.500" strokeLinecap="round" fill="none" />
        <path d="M18 24h28l-4 34H22z" fill="#f9a8d4" />
        <path d="M19.500 36h25M20.500 46h23" stroke="#fff" strokeWidth="3" opacity=".7" />
        <g className="art-bob">
          <circle cx="24" cy="21" r="7" fill="#fff" />
          <circle cx="33" cy="17" r="8" fill="#fff" />
          <circle cx="41" cy="21" r="6" fill="#fff" />
          <circle cx="33" cy="9" r="4" fill="#ef4444" />
        </g>
      </>
    ),
  },
  "soft-serve": {
    label: "Soft serve",
    svg: (
      <>
        <path d="M20 36h24l-5 24H25z" fill="#f59e0b" />
        <path d="M24 42h16M26 49h12" stroke="#d97706" strokeWidth="2" />
        <g className="art-bob">
          <ellipse cx="32" cy="34" rx="16" ry="7" fill="#fef3c7" />
          <ellipse cx="32" cy="26" rx="12" ry="6" fill="#fff" />
          <ellipse cx="32" cy="19" rx="8" ry="5" fill="#fef3c7" />
          <path d="M32 6q5 5 0 10-5-5 0-10z" fill="#fff" />
        </g>
      </>
    ),
  },
  "rice-meal": {
    label: "Chicken & rice",
    svg: (
      <>
        <ellipse cx="32" cy="48" rx="28" ry="10" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M8 46q0-20 16-20 14 0 16 20z" fill="#fff" stroke="#e2e8f0" strokeWidth="1.500" />
        <path d="M16 34h.1M22 30h.1M28 36h.1M20 40h.1M30 42h.1" stroke="#cbd5e1" strokeWidth="2.500" strokeLinecap="round" />
        <g className="art-bob">
          <ellipse cx="46" cy="38" rx="13" ry="9" fill="#ea580c" transform="rotate(-20 46 38)" />
          <circle cx="42" cy="35" r="1.500" fill="#fbbf24" />
          <circle cx="50" cy="38" r="1.500" fill="#fbbf24" />
        </g>
        <path d="M14 44q10 6 22 0" stroke="#92400e" strokeWidth="5" strokeLinecap="round" fill="none" />
        {steam(18, 14)}
      </>
    ),
  },
  "meal-tray": {
    label: "Meal tray",
    svg: (
      <>
        <path d="M3 44h58l-5 14H8z" fill="#ef4444" />
        <g className="art-bob">
          <path d="M6 38q0-14 10-14t10 14z" fill="#f59e0b" />
          <rect x="6" y="38" width="20" height="4" rx="2" fill="#78350f" />
        </g>
        <g className="art-bob" style={dl(0.4)}>
          <rect x="30" y="22" width="3" height="14" rx="1" fill="#fde047" />
          <rect x="34" y="20" width="3" height="16" rx="1" fill="#facc15" />
          <rect x="38" y="23" width="3" height="13" rx="1" fill="#fde047" />
          <path d="M29 34h14l-1.500 10h-11z" fill="#dc2626" />
        </g>
        <path d="M47 24h12l-2 20H49z" fill="#fff" />
        <path d="M48 32h10l-.5 6h-9z" fill="#ef4444" />
        <rect x="46" y="21" width="14" height="4" rx="2" fill="#e2e8f0" />
      </>
    ),
  },
  "onion-rings": {
    label: "Onion rings",
    svg: (
      <>
        {[
          [20, 22, 0],
          [43, 22, 0.4],
          [31, 44, 0.8],
        ].map(([x, y, d], i) => (
          <g key={i} className="art-bob" style={dl(Number(d))}>
            <circle cx={x} cy={y} r="11" fill="none" stroke="#f59e0b" strokeWidth="8" />
            <circle cx={x} cy={y} r="11" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 5" />
          </g>
        ))}
      </>
    ),
  },
  sandwich: {
    label: "Sandwich",
    svg: (
      <g className="art-sway">
        <path d="M8 26q0-14 24-14t24 14z" fill="#fcd34d" />
        <path d="M8 28q4 5 8 0t8 0 8 0 8 0 8 0 8 0" stroke="#22c55e" strokeWidth="4.500" strokeLinecap="round" fill="none" />
        <rect x="9" y="31" width="46" height="5" rx="2.500" fill="#ef4444" />
        <rect x="8" y="36" width="48" height="6" rx="3" fill="#fda4af" />
        <path d="M8 44h48v4q0 8-8 8H16q-8 0-8-8z" fill="#fcd34d" />
      </g>
    ),
  },
  "chef-bee": {
    label: "Chef bee",
    svg: (
      <g className="art-float">
        <ellipse className="art-flap" style={pivot(18, 30)} cx="18" cy="30" rx="7" ry="11" fill="#bae6fd" opacity=".85" transform="rotate(-35 18 30)" />
        <ellipse className="art-flap" style={pivot(46, 30)} cx="46" cy="30" rx="7" ry="11" fill="#bae6fd" opacity=".85" transform="rotate(35 46 30)" />
        <ellipse cx="32" cy="42" rx="19" ry="17" fill="#fde047" />
        <path d="M21 31q-4 11 0 22M32 26v32M43 31q4 11 0 22" stroke="#1e293b" strokeWidth="4.500" fill="none" />
        <circle cx="25" cy="40" r="3.200" fill="#fff" />
        <circle cx="39" cy="40" r="3.200" fill="#fff" />
        <circle cx="25.500" cy="40.500" r="1.600" fill="#0f172a" />
        <circle cx="39.500" cy="40.500" r="1.600" fill="#0f172a" />
        <path d="M27 47q5 4 10 0" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="24" cy="12" r="7" fill="#fff" stroke="#e2e8f0" strokeWidth="1.500" />
        <circle cx="32" cy="8" r="8" fill="#fff" stroke="#e2e8f0" strokeWidth="1.500" />
        <circle cx="40" cy="12" r="7" fill="#fff" stroke="#e2e8f0" strokeWidth="1.500" />
        <rect x="23" y="14" width="18" height="10" rx="2.500" fill="#fff" stroke="#e2e8f0" strokeWidth="1.500" />
        <path d="M27 24v-6M32 24v-6M37 24v-6" stroke="#e2e8f0" strokeWidth="1.500" />
      </g>
    ),
  },
  pancakes: {
    label: "Pancakes",
    svg: (
      <>
        <ellipse cx="32" cy="56" rx="28" ry="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.500" />
        <rect x="10" y="42" width="44" height="12" rx="6" fill="#fbbf24" />
        <rect x="12" y="32" width="40" height="12" rx="6" fill="#fcd34d" />
        <rect x="14" y="22" width="36" height="12" rx="6" fill="#fbbf24" />
        <path d="M14 28q4 10 8 2t8 4 8-6 8 6 4-6" fill="#b45309" />
        <rect className="art-bob" x="26" y="12" width="12" height="9" rx="2.500" fill="#fde047" />
        {steam(46, 14)}
      </>
    ),
  },
  lumpia: {
    label: "Lumpia",
    svg: (
      <>
        <ellipse cx="30" cy="54" rx="26" ry="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.500" />
        {[
          [30, 18, -8, 0],
          [30, 32, 0, 0.3],
          [30, 46, 8, 0.6],
        ].map(([x, y, r, d], i) => (
          <g key={i} className="art-bob" style={dl(Number(d))}>
            <rect x={Number(x) - 22} y={Number(y) - 6} width="44" height="12" rx="6" fill="#d97706" transform={`rotate(${r} ${x} ${y})`} />
            <ellipse cx={Number(x) - 21} cy={Number(y)} rx="3" ry="5.500" fill="#fde68a" transform={`rotate(${r} ${x} ${y})`} />
          </g>
        ))}
        <path d="M48 40h12l-1.500 12h-9z" fill="#b91c1c" />
        <ellipse cx="54" cy="40" rx="6" ry="2" fill="#7f1d1d" />
      </>
    ),
  },
  "leche-flan": {
    label: "Leche flan",
    svg: (
      <>
        <ellipse cx="32" cy="54" rx="28" ry="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.500" />
        <g className="art-sway">
          <path d="M10 50q0-20 22-20t22 20z" fill="#fbbf24" />
          <ellipse cx="32" cy="32" rx="19" ry="5" fill="#b45309" />
          <path d="M14 34q2 10 4 4t4 8 4-8 4 6 4-6 4 8 4-6 4 4" fill="#b45309" opacity=".9" />
          <path d="M20 40q4-6 10-8" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".4" />
        </g>
      </>
    ),
  },
  pandesal: {
    label: "Pandesal",
    svg: (
      <>
        <g className="art-bob">
          <ellipse cx="18" cy="46" rx="14" ry="10" fill="#f59e0b" />
          <ellipse cx="46" cy="46" rx="14" ry="10" fill="#f59e0b" />
          <ellipse cx="32" cy="30" rx="15" ry="11" fill="#fbbf24" />
          <path d="M8 44q10-8 20 0M36 44q10-8 20 0M22 28q10-8 20 0" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M18 44v5M46 44v5M32 28v5" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
        </g>
        {steam(24, 12)}
      </>
    ),
  },
  sisig: {
    label: "Sizzling sisig",
    svg: (
      <>
        <rect x="4" y="50" width="56" height="9" rx="3" fill="#78350f" />
        <ellipse cx="32" cy="46" rx="27" ry="9" fill="#334155" />
        <ellipse cx="32" cy="43" rx="21" ry="8" fill="#b45309" />
        <circle cx="20" cy="42" r="2" fill="#fbbf24" />
        <circle cx="44" cy="43" r="2" fill="#fbbf24" />
        <circle cx="26" cy="47" r="1.800" fill="#92400e" />
        <circle cx="38" cy="47" r="1.800" fill="#92400e" />
        <circle cx="32" cy="38" r="9" fill="#fff" />
        <circle cx="32" cy="38" r="4.500" fill="#f59e0b" />
        <path d="M44 39q6-2 8 2" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path className="art-smoke" d="M20 34q-4-6 0-10" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path className="art-smoke" style={dl(0.6)} d="M32 30q-4-6 0-10" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path className="art-smoke" style={dl(1.2)} d="M44 34q-4-6 0-10" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" fill="none" />
      </>
    ),
  },
};

/** category → keys, in picker order (keys from ArtSvg.tsx and this file) */
export const ART_CATEGORIES: [string, string[]][] = [
  ["Party", ["cake", "balloons", "balloon", "gift", "popper", "confetti-rain", "streamers", "banner", "party-hat", "pinata", "disco-ball", "sparkles", "music", "camera", "star", "fireworks", "champagne", "clock"]],
  ["Fast food", ["chef-bee", "bee", "burger", "fries", "fried-chicken", "chicken-bucket", "nuggets", "rice-meal", "meal-tray", "spaghetti", "sandwich", "hotdog", "pizza", "taco", "onion-rings", "pie", "soda", "milkshake", "sundae", "soft-serve", "ice-cream", "popcorn"]],
  ["Filipino favorites", ["halo-halo", "lumpia", "sisig", "pandesal", "leche-flan"]],
  ["Food & drinks", ["cupcake", "cupcake2", "donut", "cookie", "lollipop", "coffee", "boba", "sushi", "bbq", "pancakes"]],
  ["Holidays", ["tree", "santa-hat", "candy-cane", "ornament", "wreath", "snowflake", "stocking", "gingerbread", "pumpkin", "ghost", "easter-egg"]],
  ["Love & wedding", ["heart", "rings", "rose", "love-letter", "wedding-cake"]],
  ["Achievements", ["trophy", "medal", "crown", "grad-cap", "podium"]],
  ["Racing", ["race-car", "checkered-flag", "start-lights", "speedometer", "steering-wheel", "tire", "helmet", "finish-line"]],
  ["Nature & animals", ["sun", "moon", "rainbow", "cloud", "flower", "butterfly", "rocket", "duck", "cat", "teddy", "paw", "fish"]],
  ["Home", ["house", "key"]],
];
