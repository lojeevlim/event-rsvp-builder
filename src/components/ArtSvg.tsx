import type { CSSProperties, ReactNode } from "react";

/** Animated SVG illustrations for stickers. Colours follow the site accent; animation classes live in globals.css. */
const dl = (s: number): CSSProperties => ({ animationDelay: `${s}s` });
const pivot = (x: number, y: number): CSSProperties => ({ transformBox: "view-box", transformOrigin: `${x}px ${y}px` });
const sparkle = (x: number, y: number, k = 1) => `M${x} ${y - 7 * k}Q${x} ${y} ${x + 7 * k} ${y}Q${x} ${y} ${x} ${y + 7 * k}Q${x} ${y} ${x - 7 * k} ${y}Q${x} ${y} ${x} ${y - 7 * k}z`;

// confetti fired by the party popper: [dx, dy, rotation, colour, shape]
const POP: [number, number, number, string, "c" | "r" | "l"][] = [
  [12, -26, 200, "#fde047", "c"],
  [22, -20, 260, "#f472b6", "r"],
  [6, -32, 160, "#60a5fa", "l"],
  [26, -8, 300, "#34d399", "r"],
  [16, -34, 220, "#fb923c", "c"],
  [30, -22, 180, "#a78bfa", "l"],
  [2, -22, 240, "#f472b6", "r"],
  [20, -2, 280, "#fde047", "c"],
  [10, -14, 320, "#34d399", "l"],
  [28, -30, 140, "#60a5fa", "r"],
];

// paper falling from above: [x, sway, rotation, colour, shape, duration, delay]
const RAIN: [number, number, number, string, "c" | "r" | "l", number, number][] = [
  [6, 6, 220, "#f472b6", "r", 3.4, 0],
  [14, -5, 300, "#fde047", "c", 3.8, 0.9],
  [22, 7, 180, "#60a5fa", "l", 3.2, 1.7],
  [30, -6, 260, "#34d399", "r", 4.0, 0.4],
  [38, 5, 340, "#fb923c", "c", 3.5, 2.1],
  [46, -7, 200, "#a78bfa", "l", 3.9, 1.2],
  [54, 6, 280, "#f472b6", "r", 3.3, 2.6],
  [10, 4, 320, "#34d399", "c", 4.1, 2.9],
  [26, -4, 240, "#fde047", "r", 3.6, 3.3],
  [42, 6, 190, "#60a5fa", "c", 3.7, 0.6],
  [58, -5, 270, "#fb923c", "l", 3.4, 1.5],
  [18, 3, 210, "#a78bfa", "r", 3.8, 3.8],
  [34, -3, 330, "#f472b6", "c", 4.2, 2.3],
  [50, 4, 250, "#34d399", "r", 3.5, 3.1],
];

type Art = { label: string; svg: ReactNode };

const ART: Record<string, Art> = {
  /* ---------- featured ---------- */
  cake: {
    label: "Cake",
    svg: (
      <>
        <ellipse cx="32" cy="58" rx="24" ry="3" fill="#0000001a" />
        <rect x="10" y="38" width="44" height="18" rx="4" fill="#f9a8d4" />
        <rect x="16" y="26" width="32" height="14" rx="4" fill="#fde68a" />
        <path d="M10 42q4 6 8 0t8 0 8 0 8 0 8 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <path d="M16 30q4 5 8 0t8 0 8 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <circle className="art-blink" cx="20" cy="47" r="1.200" fill="#ef4444" />
        <circle className="art-blink" style={dl(0.5)} cx="34" cy="49" r="1.200" fill="#60a5fa" />
        <circle className="art-blink" style={dl(1)} cx="47" cy="47" r="1.200" fill="#fbbf24" />
        <rect x="30" y="16" width="4" height="11" rx="1" className="a5" />
        <circle className="art-glow" cx="32" cy="10" r="10" fill="#fde047" />
        <g className="art-candle">
          <path d="M32 3c3.500 4 4.500 6.500 0 10-4.500-3.500-3.500-6 0-10z" fill="#fb923c" />
          <path d="M32 7.500c1.500 2 2 3.200 0 5-2-1.800-1.500-3 0-5z" fill="#fde047" />
        </g>
      </>
    ),
  },
  balloons: {
    label: "Balloon bunch",
    svg: (
      <g className="art-float">
        <g className="art-sway" style={dl(0.3)}>
          <path d="M20 38q-4 12 12 24" fill="none" stroke="#94a3b8" strokeWidth="1.200" />
          <ellipse cx="19" cy="25" rx="11" ry="13" fill="#60a5fa" />
          <ellipse cx="15" cy="20" rx="2.500" ry="4.500" fill="#fff" opacity=".4" />
        </g>
        <g className="art-sway">
          <path d="M32 36v26" fill="none" stroke="#94a3b8" strokeWidth="1.200" />
          <ellipse cx="32" cy="22" rx="12" ry="14" className="a5" />
          <ellipse cx="28" cy="17" rx="2.500" ry="4.500" fill="#fff" opacity=".4" />
        </g>
        <g className="art-sway" style={dl(0.6)}>
          <path d="M45 38q4 12 -13 24" fill="none" stroke="#94a3b8" strokeWidth="1.200" />
          <ellipse cx="45" cy="25" rx="11" ry="13" fill="#fbbf24" />
          <ellipse cx="41" cy="20" rx="2.500" ry="4.500" fill="#fff" opacity=".45" />
        </g>
      </g>
    ),
  },
  gift: {
    label: "Gift",
    svg: (
      <>
        <rect x="12" y="30" width="40" height="26" rx="3" className="a5" />
        <rect x="29" y="30" width="6" height="26" fill="#fde68a" />
        <g className="art-lid">
          <rect x="10" y="22" width="44" height="10" rx="3" className="a7" />
          <rect x="29" y="22" width="6" height="10" fill="#fde68a" />
          <path d="M32 22C22 8 12 18 24 22zM32 22C42 8 52 18 40 22z" fill="#fde68a" />
        </g>
        <path className="art-twinkle" style={dl(0.2)} d={sparkle(14, 12, 0.8)} fill="#fde047" />
        <path className="art-twinkle" style={dl(0.9)} d={sparkle(52, 8, 0.7)} fill="#fff" />
      </>
    ),
  },
  popper: {
    label: "Party popper",
    svg: (
      <>
        <g className="art-recoil">
          <path d="M8 58L22 24l18 18z" className="a5" />
          <path d="M8 58L22 24l5 5z" className="a7" />
          <path d="M14 46l12 -6M11 53l16 -8" stroke="#fff" strokeWidth="2" opacity=".55" strokeLinecap="round" />
        </g>
        <path className="art-bang" d="M31 33l3-9 3 9 9 3-9 3-3 9-3-9-9-3z" fill="#fde047" />
        {POP.map(([dx, dy, rot, color, shape], i) => (
          <g key={i} className="art-shoot" style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, ["--rot" as string]: `${rot}deg`, animationDelay: `${i * 0.02}s` } as CSSProperties}>
            {shape === "c" ? <circle cx="31" cy="33" r="2" fill={color} /> : shape === "r" ? <rect x="29" y="31" width="4.500" height="3" rx=".5" fill={color} /> : <path d="M28 33q3-3 6 0" stroke={color} strokeWidth="1.800" fill="none" strokeLinecap="round" />}
          </g>
        ))}
      </>
    ),
  },
  star: {
    label: "Star",
    svg: (
      <>
        <g className="art-spin-slow" opacity=".55" stroke="#fde047" strokeWidth="2.500" strokeLinecap="round">
          <path d="M32 2v6M32 56v6M2 32h6M56 32h6M10 10l4 4M50 50l4 4M54 10l-4 4M14 50l-4 4" />
        </g>
        <path className="art-twinkle" d="M32 9l6.500 16.500 17.500 1.500-13.500 11.500 4.500 17L32 45l-15 10.500 4.500-17L8 27l17.500-1.500z" fill="#fbbf24" />
        <path d="M32 9l6.500 16.500L32 30z" fill="#fde68a" opacity=".7" />
        <path className="art-twinkle" style={dl(0.6)} d={sparkle(52, 10, 0.9)} fill="#fff" />
      </>
    ),
  },
  tree: {
    label: "Christmas tree",
    svg: (
      <>
        <rect x="28" y="50" width="8" height="9" rx="1" fill="#92400e" />
        <path d="M32 14L48 34H16z" fill="#16a34a" />
        <path d="M32 24L52 46H12z" fill="#15803d" />
        <path d="M32 34L56 54H8z" fill="#166534" />
        <g style={pivot(32, 9)}>
          <g className="art-spin-slow" style={pivot(32, 9)} stroke="#fde047" strokeWidth="1.800" strokeLinecap="round" opacity=".9">
            <path d="M32 -2v6M32 14v6M21 9h6M37 9h6M24 1l4 4M40 17l-4-4M40 1l-4 4M24 17l4-4" />
          </g>
          <path className="art-shine" d="M32 2l2.800 6 6.500.6-5 4.200 1.600 6.400-5.900-3.500-5.900 3.500 1.600-6.400-5-4.200 6.500-.6z" fill="#fde047" />
        </g>
        <circle className="art-blink" cx="28" cy="30" r="2.200" fill="#ef4444" />
        <circle className="art-blink" style={dl(0.4)} cx="38" cy="38" r="2.200" fill="#60a5fa" />
        <circle className="art-blink" style={dl(0.8)} cx="24" cy="46" r="2.200" fill="#fde047" />
        <circle className="art-blink" style={dl(1.2)} cx="42" cy="49" r="2.200" fill="#f472b6" />
        <circle className="art-blink" style={dl(0.2)} cx="32" cy="42" r="2" fill="#fff" />
      </>
    ),
  },
  fireworks: {
    label: "Fireworks",
    svg: (
      <>
        <g className="art-burst" stroke="#fbbf24" strokeWidth="2.800" strokeLinecap="round">
          <path d="M20 6v9M20 33v9M3 24h9M28 24h9M8 12l6 6M26 30l6 6M32 12l-6 6M14 30l-6 6" />
        </g>
        <g className="art-burst" style={dl(0.8)} stroke="#f472b6" strokeWidth="2.600" strokeLinecap="round">
          <path d="M46 28v8M46 52v8M34 44h8M50 44h8M38 36l5 5M49 47l5 5M54 36l-5 5M43 47l-5 5" />
        </g>
        <g className="art-burst" style={dl(1.5)} stroke="#60a5fa" strokeWidth="2.200" strokeLinecap="round">
          <path d="M50 4v6M50 22v6M41 16h6M53 16h6" />
        </g>
        <circle className="art-pulse" cx="20" cy="24" r="2.500" fill="#fff" />
      </>
    ),
  },
  champagne: {
    label: "Champagne",
    svg: (
      <>
        <g className="art-clink-l" style={pivot(20, 54)}>
          <path d="M12 12h16l-3 22q-5 4 -10 0z" fill="#ffffff55" stroke="#64748b" strokeWidth="2" strokeLinejoin="round" />
          <path d="M13.500 20h13l-1.500 14q-5 4 -10 0z" fill="#fbbf24" />
          <path d="M20 36v14M13 52h14" stroke="#64748b" strokeWidth="2.500" strokeLinecap="round" />
        </g>
        <g className="art-clink-r" style={pivot(44, 54)}>
          <path d="M36 12h16l-3 22q-5 4 -10 0z" fill="#ffffff55" stroke="#64748b" strokeWidth="2" strokeLinejoin="round" />
          <path d="M37.500 20h13l-1.500 14q-5 4 -10 0z" fill="#fbbf24" />
          <path d="M44 36v14M37 52h14" stroke="#64748b" strokeWidth="2.500" strokeLinecap="round" />
        </g>
        <path className="art-twinkle" style={dl(0.3)} d={sparkle(32, 12, 0.9)} fill="#fff" />
        <circle className="art-bubble" cx="18" cy="26" r="1.400" fill="#fde68a" />
        <circle className="art-bubble" style={dl(0.7)} cx="44" cy="26" r="1.400" fill="#fde68a" />
        <circle className="art-bubble" style={dl(1.2)} cx="22" cy="22" r="1.100" fill="#fff" />
        <circle className="art-bubble" style={dl(0.4)} cx="40" cy="22" r="1.100" fill="#fff" />
      </>
    ),
  },


  "confetti-rain": {
    label: "Confetti rain",
    svg: (
      <>
        {RAIN.map(([x, sway, rot, color, shape, dur, delay], i) => (
          <g key={i} className="art-fall" style={{ ["--dx" as string]: `${sway}px`, ["--rot" as string]: `${rot}deg`, animationDuration: `${dur}s`, animationDelay: `${delay}s` } as CSSProperties}>
            {shape === "c" ? <circle cx={x} cy="3" r="2.200" fill={color} /> : shape === "r" ? <rect x={x - 2.500} y="1.500" width="5" height="3.200" rx=".5" fill={color} /> : <path d={`M${x - 3} 3q3-3.500 6 0`} stroke={color} strokeWidth="1.900" fill="none" strokeLinecap="round" />}
          </g>
        ))}
      </>
    ),
  },
  streamers: {
    label: "Streamers",
    svg: (
      <>
        {[
          ["M8 0c-6 10 6 14 0 24s6 14 0 24 6 12 0 16", "#f472b6", 0],
          ["M22 0c6 10-6 14 0 24s-6 14 0 24-6 12 0 16", "#fde047", 0.5],
          ["M36 0c-6 10 6 14 0 24s6 14 0 24 6 12 0 16", "#60a5fa", 1],
          ["M50 0c6 10-6 14 0 24s-6 14 0 24-6 12 0 16", "#34d399", 1.5],
          ["M58 0c-5 10 5 14 0 24s5 14 0 24 5 12 0 16", "#fb923c", 2],
        ].map(([d, c, delay]) => (
          <path key={String(d)} className="art-unroll" pathLength="1" strokeDasharray="1" d={String(d)} stroke={String(c)} strokeWidth="4" strokeLinecap="round" fill="none" style={dl(Number(delay))} />
        ))}
      </>
    ),
  },
  banner: {
    label: "Birthday banner",
    svg: (
      <>
        <path d="M2 8Q32 22 62 8" stroke="#94a3b8" strokeWidth="1.800" fill="none" />
        {[
          [11, 11.6, "var(--color-accent-500)", 0],
          [20, 13.9, "#fde047", 0.3],
          [32, 15, "#f472b6", 0.6],
          [44, 13.9, "#60a5fa", 0.9],
          [53, 11.6, "#34d399", 1.2],
        ].map(([x, y, c, delay], i) => (
          <g key={i} className="art-swing" style={{ ...pivot(Number(x), Number(y)), ...dl(Number(delay)) }}>
            <path d={`M${Number(x) - 6.500} ${y}H${Number(x) + 6.500}L${x} ${Number(y) + 18}z`} fill={String(c)} />
            <path d={`M${Number(x) - 3} ${Number(y) + 3}H${Number(x) + 3}`} stroke="#fff" strokeWidth="1.600" strokeLinecap="round" opacity=".6" />
          </g>
        ))}
      </>
    ),
  },


  /* ---------- racing ---------- */
  "race-car": {
    label: "Race car",
    svg: (
      <>
        <g stroke="#94a3b8" strokeWidth="2.200" strokeLinecap="round">
          <path className="art-speed" d="M2 34h9" />
          <path className="art-speed" style={dl(0.25)} d="M0 41h8" />
          <path className="art-speed" style={dl(0.5)} d="M3 48h8" />
        </g>
        <g className="art-rumble">
          <path d="M10 42l3-9q3-6 12-6h9q8 0 14 6l9 3q4 2 4 7v3H10z" className="a5" />
          <path d="M22 29h12q5 0 9 4H20z" fill="#bae6fd" />
          <path d="M13 41h46" stroke="#fff" strokeWidth="2" opacity=".55" />
          <circle cx="31" cy="38" r="4.500" fill="#fff" />
          <path d="M30 36l1.500-1v7" stroke="#0f172a" strokeWidth="1.500" fill="none" strokeLinecap="round" />
          <rect x="9" y="28" width="9" height="3" rx="1" fill="#334155" />
          <path d="M12 31v5" stroke="#334155" strokeWidth="2" />
          <g className="art-spin-fast" style={pivot(20, 47)}>
            <circle cx="20" cy="47" r="7" fill="#1e293b" />
            <circle cx="20" cy="47" r="3.500" fill="#cbd5e1" />
            <path d="M20 41v12M14 47h12" stroke="#64748b" strokeWidth="1.500" />
          </g>
          <g className="art-spin-fast" style={pivot(48, 47)}>
            <circle cx="48" cy="47" r="7" fill="#1e293b" />
            <circle cx="48" cy="47" r="3.500" fill="#cbd5e1" />
            <path d="M48 41v12M42 47h12" stroke="#64748b" strokeWidth="1.500" />
          </g>
        </g>
      </>
    ),
  },
  "checkered-flag": {
    label: "Chequered flag",
    svg: (
      <>
        <rect x="9" y="5" width="3.500" height="56" rx="1.500" fill="#64748b" />
        <circle cx="10.750" cy="5" r="3" fill="#fbbf24" />
        <g className="art-flag">
          {Array.from({ length: 4 }, (_, row) =>
            Array.from({ length: 5 }, (_, col) => (
              <rect key={`${row}-${col}`} x={13 + col * 9} y={10 + row * 8} width="9" height="8" fill={(row + col) % 2 ? "#fff" : "#0f172a"} stroke="#0f172a" strokeWidth=".5" />
            )),
          )}
        </g>
      </>
    ),
  },
  "start-lights": {
    label: "Start lights",
    svg: (
      <>
        <rect x="14" y="40" width="4" height="20" fill="#475569" />
        <rect x="46" y="40" width="4" height="20" fill="#475569" />
        <rect x="4" y="12" width="56" height="30" rx="7" fill="#1e293b" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <circle cx={12 + i * 10} cy="22" r="4" fill="#7f1d1d" />
            <circle className="art-light" style={dl(i * 0.45)} cx={12 + i * 10} cy="22" r="4" fill="#ef4444" />
            <circle cx={12 + i * 10} cy="33" r="4" fill="#7f1d1d" />
            <circle className="art-light" style={dl(i * 0.45)} cx={12 + i * 10} cy="33" r="4" fill="#ef4444" />
          </g>
        ))}
      </>
    ),
  },
  speedometer: {
    label: "Speedometer",
    svg: (
      <>
        <path d="M6 44a26 26 0 0 1 52 0z" fill="#1e293b" />
        <path d="M10 44a22 22 0 0 1 14-20.500" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
        <path d="M27 22.500a22 22 0 0 1 14 0" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
        <path d="M44 24a22 22 0 0 1 10 20" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        <g stroke="#cbd5e1" strokeWidth="1.500" strokeLinecap="round">
          <path d="M32 20v4M18 26l3 3M46 26l-3 3M12 38h4M48 38h4" />
        </g>
        <g className="art-needle" style={pivot(32, 44)}>
          <path d="M32 44L32 22" stroke="#f8fafc" strokeWidth="2.500" strokeLinecap="round" />
          <path d="M32 22l-2.500 8h5z" fill="#ef4444" />
        </g>
        <circle cx="32" cy="44" r="4" fill="#94a3b8" />
        <rect x="6" y="44" width="52" height="6" rx="3" fill="#334155" />
      </>
    ),
  },
  "steering-wheel": {
    label: "Steering wheel",
    svg: (
      <g className="art-steer" style={pivot(32, 32)}>
        <circle cx="32" cy="32" r="22" fill="none" stroke="#334155" strokeWidth="6" />
        <path d="M10 34h14M54 34H40M32 40v16" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
        <circle cx="32" cy="34" r="8" className="a5" />
        <rect x="29.500" y="8" width="5" height="6" rx="1" fill="#ef4444" />
        <path d="M28 34h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      </g>
    ),
  },
  tire: {
    label: "Tyre",
    svg: (
      <g className="art-spin-fast" style={pivot(32, 32)}>
        <circle cx="32" cy="32" r="26" fill="#1e293b" />
        <circle cx="32" cy="32" r="24" fill="none" stroke="#334155" strokeWidth="4" strokeDasharray="5 4" />
        <circle cx="32" cy="32" r="14" fill="#cbd5e1" />
        <circle cx="32" cy="32" r="14" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <path d="M32 20v24M20 32h24M23.500 23.500l17 17M40.500 23.500l-17 17" stroke="#94a3b8" strokeWidth="2.500" strokeLinecap="round" />
        <circle cx="32" cy="32" r="4.500" className="a5" />
      </g>
    ),
  },
  helmet: {
    label: "Racing helmet",
    svg: (
      <>
        <defs>
          <clipPath id="art-visor-clip">
            <path d="M27 27h27v11H29q-4-5-2-11z" />
          </clipPath>
        </defs>
        <path d="M8 42Q8 10 34 10q24 0 24 26v12H26Q8 48 8 42z" className="a5" />
        <path d="M10 28Q30 14 54 22" fill="none" stroke="#fff" strokeWidth="3.500" strokeLinecap="round" opacity=".85" />
        <path d="M27 27h27v11H29q-4-5-2-11z" fill="#0f172a" />
        <g clipPath="url(#art-visor-clip)">
          <rect className="art-visor" x="20" y="22" width="7" height="22" fill="#fff" opacity=".5" transform="rotate(20 24 33)" />
        </g>
        <path d="M30 48v8q0 3 3 3h13q3 0 3-3v-8z" fill="#334155" />
        <circle cx="38" cy="17" r="3" fill="#fbbf24" />
      </>
    ),
  },
  podium: {
    label: "Podium",
    svg: (
      <>
        <rect x="4" y="40" width="18" height="18" fill="#cbd5e1" />
        <rect x="23" y="30" width="18" height="28" fill="#fbbf24" />
        <rect x="42" y="46" width="18" height="12" fill="#d97706" />
        <text x="13" y="54" textAnchor="middle" fontSize="12" fontWeight="800" fill="#475569">2</text>
        <text x="32" y="50" textAnchor="middle" fontSize="16" fontWeight="800" fill="#92400e">1</text>
        <text x="51" y="56" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">3</text>
        <path className="art-bob art-twinkle" d="M32 8l3 7.500 8 .8-6 5 1.800 8L32 25l-6.800 4.300 1.800-8-6-5 8-.8z" fill="#fde047" />
      </>
    ),
  },
  "finish-line": {
    label: "Finish line",
    svg: (
      <>
        <rect x="6" y="12" width="4" height="48" fill="#64748b" />
        <rect x="54" y="12" width="4" height="48" fill="#64748b" />
        <g className="art-banner">
          {Array.from({ length: 2 }, (_, row) =>
            Array.from({ length: 12 }, (_, col) => (
              <rect key={`${row}-${col}`} x={8 + col * 4} y={10 + row * 5} width="4" height="5" fill={(row + col) % 2 ? "#fff" : "#0f172a"} stroke="#0f172a" strokeWidth=".4" />
            )),
          )}
        </g>
        <path className="art-wave" d="M10 44Q32 54 54 44" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <path className="art-twinkle" d={sparkle(32, 30, 0.9)} fill="#fde047" />
      </>
    ),
  },

  /* ---------- more ---------- */
  balloon: {
    label: "Balloon",
    svg: (
      <g className="art-float">
        <g className="art-sway">
          <path d="M32 47q-7 8 0 16" fill="none" stroke="#94a3b8" strokeWidth="1.500" />
          <ellipse cx="32" cy="24" rx="15" ry="18" className="a5" />
          <path d="M32 42l-3 5h6z" className="a7" />
          <ellipse cx="25.500" cy="16" rx="3.500" ry="6" fill="#fff" opacity=".35" transform="rotate(25 25.500 16)" />
        </g>
      </g>
    ),
  },
  "party-hat": {
    label: "Party hat",
    svg: (
      <g className="art-sway">
        <path d="M32 8L50 56H14z" className="a5" />
        <path d="M26 28H38M22 38H42M19 48H45" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        <circle cx="32" cy="8" r="5" fill="#fde68a" className="art-pulse" />
        <path className="art-twinkle" style={dl(0.4)} d={sparkle(50, 16, 0.8)} fill="#fde047" />
      </g>
    ),
  },
  heart: {
    label: "Heart",
    svg: (
      <>
        <path className="a5 art-beat" d="M32 57C8 41 6 23 18 16c8-4 12 2 14 6 2-4 6-10 14-6 12 7 10 25-14 41z" />
        <path d="M18 22q-4 6 2 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".45" />
      </>
    ),
  },
  cupcake: {
    label: "Cupcake",
    svg: (
      <>
        <path d="M14 34h36l-5 22H19z" className="a5" />
        <path d="M22 34l2 22M32 34v22M42 34l-2 22" stroke="#fff" strokeWidth="1.500" opacity=".5" />
        <path d="M12 36c0-8 6-10 10-12 0-8 20-8 20 0 4 2 10 4 10 12z" fill="#f9a8d4" />
        <path d="M20 30q4 3 8 0M32 28q4 3 8 0" stroke="#fff" strokeWidth="2.500" strokeLinecap="round" fill="none" opacity=".7" />
        <circle className="art-bob" cx="32" cy="12" r="5" fill="#ef4444" />
        <path d="M32 7q3-4 7-3" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle className="art-blink" cx="24" cy="26" r="1.200" fill="#60a5fa" />
        <circle className="art-blink" style={dl(0.6)} cx="40" cy="27" r="1.200" fill="#fde047" />
      </>
    ),
  },
  "disco-ball": {
    label: "Disco ball",
    svg: (
      <>
        <path d="M32 2v14" stroke="#94a3b8" strokeWidth="2" />
        <circle cx="32" cy="34" r="18" fill="#94a3b8" />
        <g stroke="#e2e8f0" strokeWidth="1.200" fill="none">
          <ellipse cx="32" cy="34" rx="18" ry="6" />
          <ellipse cx="32" cy="34" rx="18" ry="12" />
          <path d="M32 16v36M21 19q-7 15 0 30M43 19q7 15 0 30" />
        </g>
        <rect className="art-blink" x="22" y="24" width="5" height="5" fill="#fff" />
        <rect className="art-blink" style={dl(0.4)} x="36" y="30" width="5" height="5" fill="#fff" />
        <rect className="art-blink" style={dl(0.8)} x="26" y="40" width="5" height="5" fill="#fff" />
        <rect className="art-blink" style={dl(1.1)} x="38" y="42" width="4" height="4" fill="#fff" />
        <path className="art-twinkle" d={sparkle(10, 14, 1)} fill="#fde047" />
        <path className="art-twinkle" style={dl(0.7)} d={sparkle(56, 20, 0.8)} fill="#f472b6" />
        <path className="art-twinkle" style={dl(1.2)} d={sparkle(52, 54, 0.7)} fill="#60a5fa" />
      </>
    ),
  },
  snowflake: {
    label: "Snowflake",
    svg: (
      <g className="art-spin-slow">
        <g stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M32 5v54M8.600 18.500l46.800 27M8.600 45.500l46.800-27" />
          <path d="M32 14l-6-5M32 14l6-5M32 50l-6 5M32 50l6 5M13.500 24l8 0M10 30l0 0" />
          <path d="M18 18l1 8M46 46l-1-8M46 18l-1 8M18 46l1-8" strokeWidth="2.200" />
        </g>
        <circle cx="32" cy="32" r="4" fill="#e0f2fe" />
      </g>
    ),
  },
  "santa-hat": {
    label: "Santa hat",
    svg: (
      <>
        <path d="M12 46Q14 14 40 14Q52 14 53 30L52 46z" fill="#ef4444" />
        <path d="M18 24Q26 18 38 20" stroke="#fff" strokeWidth="2.500" opacity=".3" fill="none" strokeLinecap="round" />
        <rect x="8" y="44" width="48" height="11" rx="5.500" fill="#fff" />
        <circle className="art-swing" style={pivot(50, 26)} cx="52" cy="30" r="6.500" fill="#fff" />
      </>
    ),
  },
  "candy-cane": {
    label: "Candy cane",
    svg: (
      <g className="art-sway">
        <path d="M24 60V22a10 10 0 0 1 20 0" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
        <path d="M24 60V22a10 10 0 0 1 20 0" fill="none" stroke="#ef4444" strokeWidth="9" strokeLinecap="round" strokeDasharray="6 7" />
        <path className="art-twinkle" style={dl(0.3)} d={sparkle(50, 10, 0.8)} fill="#fde047" />
      </g>
    ),
  },
  ornament: {
    label: "Ornament",
    svg: (
      <g className="art-swing" style={pivot(32, 4)}>
        <path d="M32 2v10" stroke="#94a3b8" strokeWidth="2" />
        <rect x="27" y="10" width="10" height="6" rx="1.500" fill="#fbbf24" />
        <circle cx="32" cy="38" r="20" className="a5" />
        <path d="M14 34q9 6 18 0t18 0" stroke="#fde68a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M16 44q8 6 16 0t16 0" stroke="#fde68a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="24" cy="28" rx="4" ry="7" fill="#fff" opacity=".35" transform="rotate(25 24 28)" />
      </g>
    ),
  },
  wreath: {
    label: "Wreath",
    svg: (
      <>
        <circle cx="32" cy="32" r="19" fill="none" stroke="#15803d" strokeWidth="12" />
        <circle cx="32" cy="32" r="19" fill="none" stroke="#16a34a" strokeWidth="6" strokeDasharray="4 5" />
        <circle cx="18" cy="22" r="2.500" fill="#ef4444" />
        <circle cx="46" cy="26" r="2.500" fill="#ef4444" />
        <circle cx="26" cy="49" r="2.500" fill="#ef4444" />
        <circle className="art-blink" cx="45" cy="44" r="2" fill="#fde047" />
        <circle className="art-blink" style={dl(0.5)} cx="20" cy="40" r="2" fill="#60a5fa" />
        <circle className="art-blink" style={dl(1)} cx="34" cy="14" r="2" fill="#fde047" />
        <g className="art-bob">
          <path d="M32 50l-9 6 4-9zM32 50l9 6-4-9z" fill="#ef4444" />
          <circle cx="32" cy="50" r="3" fill="#dc2626" />
        </g>
      </>
    ),
  },
  rings: {
    label: "Wedding rings",
    svg: (
      <>
        <g className="art-sway">
          <circle cx="24" cy="40" r="13" fill="none" stroke="#fbbf24" strokeWidth="5" />
          <circle cx="40" cy="40" r="13" fill="none" stroke="#f59e0b" strokeWidth="5" />
        </g>
        <path d="M32 6l6 7-6 9-6-9z" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1.500" strokeLinejoin="round" />
        <path className="art-twinkle" d={sparkle(46, 10, 1)} fill="#fff" />
        <path className="art-twinkle" style={dl(0.8)} d={sparkle(16, 16, 0.8)} fill="#fde047" />
      </>
    ),
  },
  duck: {
    label: "Rubber duck",
    svg: (
      <>
        <g className="art-bob">
          <path d="M10 40c0-10 8-14 16-14 0-8 4-14 12-14s12 6 8 14c2 2 4 5 4 8 4 0 8 2 8 6 0 8-10 12-24 12S10 48 10 40z" fill="#fde047" />
          <path d="M44 22l12 2-11 5z" fill="#fb923c" />
          <circle cx="40" cy="19" r="2" fill="#0f172a" />
          <path d="M20 40q8 8 18 0" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
        <path className="art-wave" d="M4 56q6-5 12 0t12 0 12 0 12 0 12 0" stroke="#38bdf8" strokeWidth="3.500" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  "grad-cap": {
    label: "Graduation cap",
    svg: (
      <g className="art-toss">
        <path d="M32 12L60 26 32 40 4 26z" fill="#1e293b" />
        <path d="M16 33v10q16 9 32 0V33l-16 8z" fill="#334155" />
        <path d="M54 28v14" stroke="#fbbf24" strokeWidth="2" />
        <g className="art-swing" style={pivot(54, 28)}>
          <path d="M54 28v14" stroke="#fbbf24" strokeWidth="2" />
          <path d="M51 42h6l-1 8h-4z" fill="#fbbf24" />
        </g>
        <circle cx="32" cy="26" r="2.500" fill="#fbbf24" />
      </g>
    ),
  },
  trophy: {
    label: "Trophy",
    svg: (
      <>
        <defs>
          <clipPath id="art-trophy-clip">
            <path d="M20 8h24v16a12 12 0 0 1-24 0z" />
          </clipPath>
        </defs>
        <path d="M20 8h24v16a12 12 0 0 1-24 0z" fill="#fbbf24" />
        <path d="M20 12H10q0 14 12 16M44 12h10q0 14-12 16" fill="none" stroke="#f59e0b" strokeWidth="4" />
        <rect x="29" y="36" width="6" height="10" fill="#f59e0b" />
        <rect x="20" y="46" width="24" height="8" rx="2" fill="#92400e" />
        <rect x="18" y="52" width="28" height="6" rx="2" fill="#78350f" />
        <g clipPath="url(#art-trophy-clip)">
          <rect className="art-sweep" x="-6" y="0" width="9" height="40" fill="#fff" opacity=".6" transform="rotate(20 0 20)" />
        </g>
        <path className="art-twinkle" style={dl(0.4)} d={sparkle(52, 8, 0.9)} fill="#fde047" />
        <path className="art-twinkle" style={dl(1)} d={sparkle(10, 42, 0.7)} fill="#fff" />
      </>
    ),
  },
  sparkles: {
    label: "Sparkles",
    svg: (
      <>
        <path className="art-twinkle" d={sparkle(24, 36, 3.200)} fill="#fbbf24" />
        <path className="art-twinkle" style={dl(0.5)} d={sparkle(46, 18, 2.200)} fill="#f472b6" />
        <path className="art-twinkle" style={dl(1)} d={sparkle(48, 50, 1.600)} fill="#60a5fa" />
        <path className="art-twinkle" style={dl(0.25)} d={sparkle(12, 12, 1.200)} fill="#fff" />
      </>
    ),
  },
  clock: {
    label: "Midnight clock",
    svg: (
      <>
        <circle cx="32" cy="32" r="26" fill="#fff" stroke="#475569" strokeWidth="4" />
        <g stroke="#475569" strokeWidth="2.500" strokeLinecap="round">
          <path d="M32 10v5M32 49v5M10 32h5M49 32h5" />
        </g>
        <path d="M32 32V16" stroke="#0f172a" strokeWidth="3.500" strokeLinecap="round" />
        <path className="art-tick" style={pivot(32, 32)} d="M32 32V12" stroke="#ef4444" strokeWidth="2.500" strokeLinecap="round" />
        <circle cx="32" cy="32" r="3" fill="#0f172a" />
        <path className="art-twinkle" d={sparkle(56, 8, 0.9)} fill="#fde047" />
      </>
    ),
  },
  music: {
    label: "Music notes",
    svg: (
      <>
        <g className="art-bob">
          <ellipse cx="18" cy="48" rx="8" ry="6" className="a5" />
          <path d="M25 48V16" stroke="currentColor" strokeWidth="3" className="art-stem" />
        </g>
        <g className="art-bob" style={dl(0.5)}>
          <ellipse cx="44" cy="42" rx="8" ry="6" className="a5" />
          <path d="M51 42V10" stroke="currentColor" strokeWidth="3" className="art-stem" />
        </g>
        <path className="a7" d="M25 16l26-6v8l-26 6z" />
      </>
    ),
  },
  camera: {
    label: "Camera",
    svg: (
      <>
        <rect x="6" y="20" width="52" height="34" rx="6" fill="#334155" />
        <rect x="20" y="14" width="16" height="8" rx="2" fill="#475569" />
        <circle cx="32" cy="37" r="12" fill="#1e293b" />
        <circle cx="32" cy="37" r="8" fill="#38bdf8" />
        <ellipse cx="29" cy="34" rx="2.500" ry="3.500" fill="#fff" opacity=".6" />
        <circle cx="50" cy="28" r="2.200" fill="#fbbf24" />
        <g className="art-burst" style={{ transformOrigin: "50px 28px" }}>
          <path d="M50 12v6M58 20h-6M56 14l-4 4" stroke="#fde047" strokeWidth="2.500" strokeLinecap="round" />
        </g>
      </>
    ),
  },
  crown: {
    label: "Crown",
    svg: (
      <g className="art-bob">
        <path d="M8 48L6 18l16 14 10-20 10 20 16-14-2 30z" fill="#fbbf24" />
        <rect x="8" y="46" width="48" height="8" rx="2" fill="#f59e0b" />
        <circle className="art-blink" cx="32" cy="22" r="3" fill="#ef4444" />
        <circle className="art-blink" style={dl(0.5)} cx="12" cy="26" r="2.200" fill="#60a5fa" />
        <circle className="art-blink" style={dl(1)} cx="52" cy="26" r="2.200" fill="#34d399" />
        <path className="art-twinkle" d={sparkle(52, 8, 0.8)} fill="#fff" />
      </g>
    ),
  },
  rainbow: {
    label: "Rainbow",
    svg: (
      <>
        <g fill="none" strokeWidth="5" strokeLinecap="round">
          <path className="art-fade" d="M8 50a24 24 0 0 1 48 0" stroke="#ef4444" />
          <path className="art-fade" style={dl(0.25)} d="M14 50a18 18 0 0 1 36 0" stroke="#fbbf24" />
          <path className="art-fade" style={dl(0.5)} d="M20 50a12 12 0 0 1 24 0" stroke="#22c55e" />
          <path className="art-fade" style={dl(0.75)} d="M26 50a6 6 0 0 1 12 0" stroke="#3b82f6" />
        </g>
        <g className="art-bob" fill="#fff">
          <circle cx="8" cy="52" r="6" />
          <circle cx="15" cy="54" r="5" />
          <circle cx="56" cy="52" r="6" />
          <circle cx="49" cy="54" r="5" />
        </g>
      </>
    ),
  },
  moon: {
    label: "Moon & stars",
    svg: (
      <>
        <path className="art-sway" style={pivot(32, 32)} d="M42 6a26 26 0 1 0 14 38A22 22 0 0 1 42 6z" fill="#fde68a" />
        <path className="art-twinkle" d={sparkle(48, 20, 1.100)} fill="#fff" />
        <path className="art-twinkle" style={dl(0.6)} d={sparkle(54, 40, 0.8)} fill="#fde047" />
        <path className="art-twinkle" style={dl(1.1)} d={sparkle(38, 52, 0.7)} fill="#fff" />
      </>
    ),
  },
  key: {
    label: "House key",
    svg: (
      <g className="art-swing" style={pivot(32, 8)}>
        <circle cx="32" cy="14" r="9" fill="none" stroke="#fbbf24" strokeWidth="5" />
        <path d="M32 23v34M32 40h9M32 50h7" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
        <path className="art-twinkle" d={sparkle(48, 14, 0.8)} fill="#fff" />
      </g>
    ),
  },
  house: {
    label: "Home",
    svg: (
      <>
        <rect x="38" y="10" width="7" height="14" fill="#94a3b8" />
        <circle className="art-smoke" cx="41" cy="8" r="3" fill="#cbd5e1" />
        <circle className="art-smoke" style={dl(0.9)} cx="41" cy="8" r="2.500" fill="#e2e8f0" />
        <path d="M6 30L32 8l26 22z" className="a7" />
        <rect x="12" y="30" width="40" height="26" fill="#fde68a" />
        <rect x="26" y="40" width="12" height="16" rx="2" className="a5" />
        <rect x="16" y="35" width="8" height="8" rx="1" fill="#bae6fd" />
        <rect x="40" y="35" width="8" height="8" rx="1" fill="#bae6fd" />
        <path className="art-beat" d="M32 22c-3-4-8-1-5 3 1.500 2 5 4 5 4s3.500-2 5-4c3-4-2-7-5-3z" fill="#ef4444" />
      </>
    ),
  },
};

export const ART_OPTIONS = Object.entries(ART).map(([k, v]) => [k, v.label] as const);

/** shown up front in the picker; everything else sits behind "More" */
export const ART_FEATURED = ["cake", "balloons", "gift", "popper", "confetti-rain", "streamers", "banner", "star", "tree", "fireworks", "champagne", "heart"];

export default function ArtSvg({ name }: { name: string }) {
  const art = ART[name] ?? ART.cake;
  return (
    <svg viewBox="0 0 64 64" className="art" width="1.5em" height="1.5em" aria-hidden role="img">
      {art.svg}
    </svg>
  );
}
