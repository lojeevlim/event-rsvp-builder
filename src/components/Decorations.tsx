import type { CSSProperties, HTMLAttributes } from "react";
import { decorPath, type Decoration } from "@/lib/settings-shared";
import ArtSvg from "@/components/ArtSvg";

const mask = (path: string): CSSProperties => {
  const url = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='${path}'/></svg>`)}")`;
  return { WebkitMaskImage: url, maskImage: url, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskPosition: "center", maskPosition: "center" };
};

/** how a picture sticker is cropped */
function shapeStyle(shape: Decoration["shape"]): { className: string; style?: CSSProperties } {
  const box = "block h-[1.5em] w-[1.5em] object-cover";
  switch (shape) {
    case "rounded": return { className: "block h-[1.5em] w-auto max-w-[3em] rounded-[0.35em] object-contain" };
    case "circle": return { className: `${box} rounded-full` };
    case "square": return { className: box };
    case "hexagon": return { className: box, style: { clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)" } };
    case "heart": return { className: box, style: mask("M12 21s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.4-9 12-9 12z") };
    case "star": return { className: box, style: mask("M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z") };
    default: return { className: "block h-[1.5em] w-auto max-w-[3em] object-contain" };
  }
}

type Props = { d: Decoration; selected?: boolean; handles?: React.ReactNode; noPath?: boolean; noDelay?: boolean } & HTMLAttributes<HTMLDivElement>;

export function DecorItem({ d, selected, handles, noPath, noDelay, className = "", style, ...rest }: Props) {
  const shape = shapeStyle(d.shape ?? "original");
  // path motion: it travels along the path, fades out at the end, pauses (optional), then repeats.
  // The keyframes are generated per sticker so the pause can sit inside one cycle.
  const pts = d.path?.on && !noPath ? decorPath(d) : null;
  let frames = "";
  let animation: string | undefined;
  if (pts) {
    const pause = noDelay ? 0 : d.path.delay;
    const total = d.path.duration + pause;
    const f = (d.path.duration / total) * 100;
    const at = (pct: number, [x, y]: [number, number], op?: number) =>
      `${pct.toFixed(2)}%{left:${x.toFixed(2)}%;top:${y.toFixed(2)}%${op === undefined ? "" : `;opacity:${op}`}}`;
    const name = `dpath-${d.id.replace(/[^a-z0-9]/gi, "")}`;
    frames =
      `@keyframes ${name}{` +
      at(0, pts[0], 0) +
      `${(f * 0.08).toFixed(2)}%{opacity:1}` +
      at(f * 0.25, pts[1]) +
      at(f * 0.5, pts[2]) +
      at(f * 0.75, pts[3], 1) +
      at(f, pts[4], 0) +
      at(100, pts[4], 0) +
      "}";
    animation = `${name} ${total}s linear infinite`;
  }
  return (
    <div
      {...rest}
      data-decor={d.id}
      className={`decor decor-${d.kind} fx-${d.effect} ${pts ? "decor-moves" : ""} ${selected && !handles ? "outline-2 outline-dashed outline-offset-4 outline-brand" : ""} ${className}`}
      style={{ left: `${d.x}%`, top: `${d.y}%`, color: d.color, "--s": d.size, "--r": `${d.rotate}deg`, "--sx": d.sx ?? 1, "--sy": d.sy ?? 1, ...(animation ? { animation } : {}), ...style } as CSSProperties}
    >
      {frames && <style>{frames}</style>}
      <span>
        {selected && handles && <span className="pointer-events-none absolute -inset-1.5 border-2 border-dashed border-brand">{handles}</span>}
        <span className="block" style={{ ...(d.flip ? { transform: "scaleX(-1)" } : {}), ...((d.opacity ?? 100) < 100 ? { opacity: d.opacity / 100 } : {}) }}>
          {d.kind === "art" ? (
            <ArtSvg name={d.content} />
          ) : d.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.content} alt="" draggable={false} className={shape.className} style={shape.style} />
          ) : (
            d.content
          )}
        </span>
      </span>
    </div>
  );
}

export default function Decorations({ items }: { items: Decoration[] }) {
  if (items.length === 0) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {items.map((d) => (
        <DecorItem key={d.id} d={d} />
      ))}
    </div>
  );
}
