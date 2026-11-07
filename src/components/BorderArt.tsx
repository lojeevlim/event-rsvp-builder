import type { ReactNode } from "react";
import CurvedEdge from "@/components/BorderCurve";
import type { BorderId, Section } from "@/lib/settings-shared";

/** Illustrated border artwork. Each design is a tile that hangs down from the TOP edge; the other sides are the same tile turned. Colours follow the site accent. */
const A5 = "var(--color-accent-500)";
const A3 = "var(--color-accent-300)";
const A7 = "var(--color-accent-700)";

type Tile = { w: number; h: number; art: ReactNode };

const heart = (x: number, y: number, k: number, fill: string) => <path key={`${x}${y}`} transform={`translate(${x} ${y}) scale(${k})`} d="M0 6C-9-2-4-10 0-4 4-10 9-2 0 6z" fill={fill} />;
const star = (x: number, y: number, r: number, fill: string) => <path key={`${x}${y}`} d={`M${x} ${y - r}L${x + r * 0.3} ${y - r * 0.3}L${x + r} ${y}L${x + r * 0.3} ${y + r * 0.3}L${x} ${y + r}L${x - r * 0.3} ${y + r * 0.3}L${x - r} ${y}L${x - r * 0.3} ${y - r * 0.3}z`} fill={fill} />;

export const BORDER_TILES: Record<Exclude<BorderId, "none">, Tile> = {
  scallop: { w: 40, h: 20, art: <><circle cx="20" cy="0" r="19" fill={A5} /><circle cx="20" cy="0" r="12" fill={A3} /><circle cx="20" cy="0" r="5" fill="#fff" opacity=".7" /></> },
  bunting: {
    w: 72, h: 46,
    art: (
      <>
        <path d="M0 3Q36 12 72 3" fill="none" stroke={A7} strokeWidth="1.5" />
        <path d="M4 5.500L32 8.500L18 38z" fill={A5} /><path d="M40 8.500L68 5.500L54 38z" fill="#fde047" />
        <path d="M18 14l0 .1" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".6" /><path d="M54 14l0 .1" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      </>
    ),
  },
  balloons: {
    w: 84, h: 74,
    art: (
      <>
        <path d="M16 30Q18 52 22 70M42 24Q40 48 44 70M68 32Q70 54 64 70" fill="none" stroke="#9ca3af" strokeWidth="1" />
        <ellipse cx="16" cy="18" rx="12" ry="15" fill={A5} /><ellipse cx="42" cy="14" rx="12" ry="15" fill="#f472b6" /><ellipse cx="68" cy="20" rx="12" ry="15" fill="#fde047" />
        <ellipse cx="11" cy="12" rx="3" ry="5" fill="#fff" opacity=".5" /><ellipse cx="37" cy="8" rx="3" ry="5" fill="#fff" opacity=".5" /><ellipse cx="63" cy="14" rx="3" ry="5" fill="#fff" opacity=".5" />
      </>
    ),
  },
  hearts: { w: 40, h: 28, art: <>{heart(10, 8, 1.2, A5)}{heart(28, 14, 1.8, "#f472b6")}{heart(20, 4, 0.7, A3)}{heart(36, 3, 0.6, A5)}</> },
  stars: { w: 44, h: 32, art: <>{star(10, 10, 8, "#fbbf24")}{star(30, 20, 6, A5)}{star(40, 6, 3.5, "#fde047")}{star(22, 5, 3, A3)}</> },
  vine: {
    w: 60, h: 36,
    art: (
      <>
        <path d="M0 6Q15 14 30 6T60 6" fill="none" stroke="#15803d" strokeWidth="2" />
        <ellipse cx="14" cy="17" rx="4.500" ry="9" transform="rotate(-25 14 17)" fill="#22c55e" /><ellipse cx="30" cy="20" rx="4.500" ry="10" fill="#16a34a" />
        <ellipse cx="46" cy="17" rx="4.500" ry="9" transform="rotate(25 46 17)" fill="#22c55e" /><circle cx="22" cy="12" r="2.500" fill="#f472b6" /><circle cx="38" cy="12" r="2.500" fill="#fde047" />
      </>
    ),
  },
  snow: {
    w: 48, h: 38,
    art: (
      <>
        {[[12, 12, 8], [34, 22, 6]].map(([x, y, r]) => (
          <g key={x} stroke="#60a5fa" strokeWidth="1.500" strokeLinecap="round"><path d={`M${x - r} ${y}H${x + r}M${x} ${y - r}V${y + r}M${x - r * 0.7} ${y - r * 0.7}L${x + r * 0.7} ${y + r * 0.7}M${x + r * 0.7} ${y - r * 0.7}L${x - r * 0.7} ${y + r * 0.7}`} /></g>
        ))}
        <circle cx="26" cy="6" r="2.500" fill="#bfdbfe" /><circle cx="44" cy="8" r="2" fill="#93c5fd" /><circle cx="4" cy="30" r="2" fill="#bfdbfe" />
      </>
    ),
  },
  confetti: { w: 52, h: 30, art: <><rect x="4" y="4" width="7" height="4" rx="1" transform="rotate(30 7 6)" fill="#f472b6" /><circle cx="20" cy="12" r="3" fill="#fde047" /><rect x="30" y="3" width="4" height="9" rx="1" transform="rotate(-25 32 7)" fill={A5} /><circle cx="44" cy="18" r="3" fill="#34d399" /><rect x="10" y="20" width="8" height="3.500" rx="1" transform="rotate(-20 14 22)" fill="#60a5fa" /><circle cx="34" cy="25" r="2" fill="#fb923c" /></> },
  waves: { w: 48, h: 24, art: <><path d="M0 0V8Q12 20 24 8T48 8V0z" fill={A3} /><path d="M0 0V4Q12 14 24 4T48 4V0z" fill={A5} /></> },
  lights: {
    w: 52, h: 46,
    art: (
      <>
        <path d="M0 3Q26 14 52 3" fill="none" stroke="#374151" strokeWidth="1.200" />
        {[[13, 9, "#ef4444"], [26, 11, "#fde047"], [39, 9, "#22c55e"]].map(([x, y, c]) => (
          <g key={x as number}><circle cx={x as number} cy={(y as number) + 12} r="9" fill={c as string} opacity=".25" /><rect x={(x as number) - 2} y={y as number} width="4" height="5" fill="#374151" /><ellipse cx={x as number} cy={(y as number) + 12} rx="4.500" ry="6.500" fill={c as string} /></g>
        ))}
      </>
    ),
  },
  zigzag: { w: 32, h: 16, art: <><path d="M0 0L16 16L32 0z" fill={A7} /><path d="M8 0L16 8L24 0z" fill={A3} /></> },
  flowers: {
    w: 64, h: 34,
    art: (
      <>
        <path d="M0 4H64" stroke="#15803d" strokeWidth="2" />
        {[[16, 16, "#f472b6"], [46, 18, "#fb923c"]].map(([x, y, c]) => (
          <g key={x as number}>{[0, 72, 144, 216, 288].map((r) => <circle key={r} cx={x as number} cy={(y as number) - 7} r="5" fill={c as string} transform={`rotate(${r} ${x} ${y})`} />)}<circle cx={x as number} cy={y as number} r="3.500" fill="#fde047" /></g>
        ))}
        <ellipse cx="31" cy="12" rx="3" ry="6" transform="rotate(-20 31 12)" fill="#22c55e" />
      </>
    ),
  },
  gold: { w: 40, h: 16, art: <><path d="M0 3H40M0 7H40" stroke="#d4a017" strokeWidth="1" /><path d="M20 0L26 7L20 14L14 7z" fill="#d4a017" /><path d="M20 3L23 7L20 11L17 7z" fill="#fef3c7" /><circle cx="4" cy="7" r="1.500" fill="#d4a017" /><circle cx="36" cy="7" r="1.500" fill="#d4a017" /></> },
  clouds: { w: 72, h: 34, art: <><g fill="#fff" stroke="#bae6fd" strokeWidth="1.500"><circle cx="14" cy="6" r="12" /><circle cx="32" cy="6" r="14" /><circle cx="50" cy="6" r="12" /><circle cx="66" cy="4" r="9" /></g><circle cx="22" cy="24" r="2" fill="#bae6fd" /><circle cx="44" cy="26" r="2" fill="#bae6fd" /></> },
  road: { w: 64, h: 24, art: <><rect width="64" height="20" fill="#374151" /><rect y="20" width="64" height="4" fill="#fbbf24" /><path d="M4 11H20M28 11H44M52 11H64" stroke="#fff" strokeWidth="2.500" strokeLinecap="round" /></> },
  spikes: { w: 36, h: 26, art: <><path d="M0 0L9 24L18 0L27 24L36 0z" fill="#65a30d" /><path d="M5 0L9 14L13 0zM23 0L27 14L31 0z" fill="#a3e635" /></> },
  planets: { w: 76, h: 44, art: <><circle cx="14" cy="14" r="9" fill={A5} /><ellipse cx="14" cy="14" rx="15" ry="4" fill="none" stroke="#fde047" strokeWidth="2" transform="rotate(-20 14 14)" /><circle cx="46" cy="30" r="6" fill="#38bdf8" /><circle cx="64" cy="12" r="4" fill="#fb923c" />{star(34, 8, 4, "#fde047")}{star(70, 36, 3, "#fff")}{star(8, 38, 3, "#fff")}</> },
  paws: { w: 46, h: 32, art: <>{[[12, 14, -15], [34, 22, 15]].map(([x, y, r]) => (<g key={x} transform={`rotate(${r} ${x} ${y})`} fill={A7}><ellipse cx={x} cy={y + 3} rx="6" ry="5" /><circle cx={x - 7} cy={y - 4} r="2.500" /><circle cx={x - 2.500} cy={y - 8} r="2.500" /><circle cx={x + 2.500} cy={y - 8} r="2.500" /><circle cx={x + 7} cy={y - 4} r="2.500" /></g>))}</> },
  bubbles: { w: 50, h: 40, art: <>{[[10, 10, 8], [32, 22, 11], [44, 6, 5], [16, 32, 4]].map(([x, y, r]) => (<g key={x}><circle cx={x} cy={y} r={r} fill="#bae6fd" opacity=".55" stroke="#38bdf8" strokeWidth="1.500" /><circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.22} fill="#fff" /></g>))}</> },
  checker: { w: 32, h: 16, art: <><rect width="32" height="16" fill="#fff" /><path d="M0 0H8V8H0zM16 0H24V8H16zM8 8H16V16H8zM24 8H32V16H24z" fill="#18181b" /></> },
};


export const BORDER_OPTIONS: (readonly [BorderId, string])[] = [
  ["none", "None"], ["scallop", "Scallops"], ["bunting", "Bunting flags"], ["balloons", "Balloons"], ["hearts", "Hearts"], ["stars", "Stars"], ["vine", "Vine & leaves"], ["snow", "Snowflakes"],
  ["confetti", "Confetti"], ["waves", "Waves"], ["lights", "String lights"], ["zigzag", "Zigzag"], ["flowers", "Flowers"], ["gold", "Gold ornament"], ["clouds", "Clouds"], ["road", "Road"], ["spikes", "Dino ridge"], ["planets", "Planets"], ["paws", "Paw prints"], ["bubbles", "Bubbles"], ["checker", "Checkered flag"],
];

/** a small picture of one border design, for pickers */
export function BorderThumb({ id }: { id: BorderId }) {
  if (id === "none") return <span className="text-[10px] font-semibold text-soft">None</span>;
  const { w, h, art } = BORDER_TILES[id];
  const n = Math.ceil(80 / w) + 1;
  return (
    <svg aria-hidden width="100%" height="100%" viewBox={`0 0 ${w * 2} ${h}`} preserveAspectRatio="xMidYMin slice" overflow="hidden">
      {Array.from({ length: n }, (_, i) => <g key={i} transform={`translate(${i * w} 0)`}>{art}</g>)}
    </svg>
  );
}

const SCALE = { sm: 0.7, md: 1, lg: 1.5, xl: 2.2 };
type Side = "top" | "bottom" | "left" | "right";

/** One edge: the tile repeated along it, turned so it always points into the section. */
function Edge({ side, id, size, curve, wave, uid }: { side: Side; id: Exclude<BorderId, "none">; size: Section["border"]["size"]; curve: number; wave: number; uid: string }) {
  const { w, h, art } = BORDER_TILES[id];
  const k = SCALE[size];
  if (curve || wave) return <CurvedEdge side={side} w={w} h={h} k={k} curve={curve} wave={wave} art={art} />;
  const thick = h * k;
  const horizontal = side === "top" || side === "bottom";
  const turn = { top: "", bottom: `translate(0 ${thick}) rotate(180)`, left: "rotate(-90)", right: `translate(${thick} 0) rotate(90)` }[side];
  const pid = `${uid}-${side}`;
    const style = { top: { top: 0, left: 0, right: 0, height: thick }, bottom: { bottom: 0, left: 0, right: 0, height: thick }, left: { left: 0, top: 0, bottom: 0, width: thick }, right: { right: 0, top: 0, bottom: 0, width: thick } }[side];
  return (
    <svg aria-hidden className="pointer-events-none absolute" style={style} width={horizontal ? "100%" : thick} height={horizontal ? thick : "100%"}>
      <defs>
        <pattern id={pid} width={w * k} height={h * k} patternUnits="userSpaceOnUse" patternTransform={turn}>
          <g transform={`scale(${k})`}>{art}</g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/** The four illustrated borders of a section, drawn over its background and under its content. */
export default function SectionBorder({ border, id }: { border: Section["border"]; id: string }) {
  const sides = (["top", "bottom", "left", "right"] as const).filter((s) => border[s] !== "none");
  if (!sides.length) return null;
  const uid = `bd${id.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {sides.map((s) => <Edge key={s} side={s} id={border[s] as Exclude<BorderId, "none">} size={border.size} curve={border.curve ?? 0} wave={border.wave ?? 0} uid={uid} />)}
    </div>
  );
}
