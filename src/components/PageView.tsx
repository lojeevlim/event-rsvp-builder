import ScrollIn, { type ScrollInKind } from "@/components/ScrollIn";
import EnvelopeIntro from "@/components/EnvelopeIntro";
import TapCard from "@/components/TapCard";
import ScreensMode from "@/components/ScreensMode";
import SectionBorder from "@/components/BorderArt";
import type { ReactNode } from "react";
import RsvpForm from "@/components/RsvpForm";
import LinkButton from "@/components/LinkButton";
import MapBlock from "@/components/MapBlock";
import { parseLatLng } from "@/lib/map";
import { Badge, Card, Divider, Image } from "@/components/ui";
import { BlockIcon } from "@/components/icons";
import SectionEffect from "@/components/SectionEffect";
import Countdown from "@/components/Countdown";
import Decorations, { DecorItem } from "@/components/Decorations";
import { EditBlock, EditSection, type EditActions } from "@/components/edit-ui";
import { DEFAULT_PATH, MAX_DECORATIONS, type Block, type Section, type Settings } from "@/lib/settings-shared";

export type EditProps = {
  selected: { section: string | null; block: string | null };
  /** elements picked together (shift / ctrl / cmd + click) to be grouped into a row or column */
  multi: string[];
  /** draggable sticker layer for a section (admin preview only) */
  layer: (sectionId: string) => ReactNode;
  actions: EditActions;
  /** rotate / resize / remove handles for a selected illustration that is part of the layout */
  illoHandles?: (b: Block) => ReactNode;
  /** the selected sticker, so its section's illustration popover can offer mirror / rotate / scale */
  sticker?: { section: string; flip: boolean; rotate: number; size: number } | null;
};

const BG = { white: "bg-surface", cream: "bg-cream", brand: "bg-brand text-white", ink: "bg-accent-900 text-white", plain: "" };
const PAD = { sm: "py-10 md:py-12", md: "py-12 md:py-16", lg: "py-16 md:py-20" };
const HEAD = { sm: "text-2xl", md: "text-2xl sm:text-3xl md:text-4xl", lg: "text-3xl sm:text-4xl md:text-5xl", xl: "text-4xl sm:text-5xl md:text-7xl" };
const TEXT = { sm: "text-sm", md: "text-base", lg: "text-lg", xl: "text-xl" };
const EMOJI = { sm: "text-3xl", md: "text-5xl", lg: "text-6xl", xl: "text-8xl" };
// gallery: how many pictures per row (small = many small ones … extra large = one big one)
const GALLERY = { sm: "grid-cols-3 md:grid-cols-5", md: "grid-cols-2 md:grid-cols-3", lg: "grid-cols-1 sm:grid-cols-2", xl: "grid-cols-1" };
// single image: the widest it may get
const IMAGE_W = { sm: "max-w-xs", md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" };
const SPACE = { sm: "h-4", md: "h-8", lg: "h-16", xl: "h-24" };
// "white" tone = contrast colour: it follows the section background (--on-bg), so it stays readable on any colour
const TONE = { ink: "text-ink", brand: "text-brand", soft: "text-soft", white: "text-[color:var(--on-bg,#fff)]" };

/** readable text colour (light or dark) for a custom background */
function onColor(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? "#0f172a" : "#ffffff";
}


/** readable text colour for a two-colour gradient: judged on the average of both ends */
function onGradient(from: string, to: string) {
  const mid = [1, 3, 5].map((i) => Math.round((parseInt(from.slice(i, i + 2), 16) + parseInt(to.slice(i, i + 2), 16)) / 2).toString(16).padStart(2, "0")).join("");
  return onColor(`#${mid}`);
}

const external = (url: string) => (/^https?:\/\//i.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {});

/** A picture frame: a checkered racing border, a film strip, a polaroid, or an elegant double line. */
function Framed({ frame, className = "", children }: { frame: Block["frame"]; className?: string; children: ReactNode }) {
  switch (frame) {
    case "checker":
      return <div className={className} style={{ padding: 10, borderRadius: 22, background: "conic-gradient(#18181b 25%, #fff 0 50%, #18181b 0 75%, #fff 0) 0 0 / 20px 20px", boxShadow: "0 10px 22px -12px rgba(0,0,0,0.45)" }}><div className="overflow-hidden rounded-[14px]">{children}</div></div>;
    case "film":
      return (
        <div className={`relative ${className}`} style={{ padding: "14px 26px", borderRadius: 8, background: "#141416", boxShadow: "0 10px 22px -12px rgba(0,0,0,0.55)" }}>
          {(["left-2", "right-2"] as const).map((side) => (
            <span key={side} aria-hidden className={`absolute inset-y-3 ${side} w-2.5 rounded-sm`} style={{ backgroundImage: "repeating-linear-gradient(to bottom, #f5f5f4 0 9px, transparent 9px 19px)" }} />
          ))}
          <div className="overflow-hidden rounded-sm">{children}</div>
        </div>
      );
    case "polaroid":
      return <div className={className} style={{ padding: "12px 12px 46px", background: "#fff", borderRadius: 4, transform: "rotate(-1.5deg)", boxShadow: "0 14px 26px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.06)" }}><div className="overflow-hidden">{children}</div></div>;
    case "double":
      return <div className={className} style={{ padding: 9, borderRadius: 22, border: "3px solid var(--color-accent-600)", background: "var(--color-surface)", boxShadow: "inset 0 0 0 1px var(--color-accent-300)" }}><div className="overflow-hidden rounded-[14px]">{children}</div></div>;
    default:
      return <div className={className}>{children}</div>;
  }
}

function BlockView({ b, edit, rsvpEndpoint, handles }: { b: Block; edit: boolean; rsvpEndpoint?: string; handles?: ReactNode }) {
  switch (b.type) {
    case "badge":
      return <Badge variant="outline" size="lg" className="rounded-full bg-surface px-5 font-bold uppercase tracking-widest text-brand">{b.text}</Badge>;
    case "heading": {
      const Tag = b.size === "xl" ? "h1" : "h2";
      return <Tag className={`${HEAD[b.size]} ${TONE[b.tone]} font-extrabold leading-[1.05] ${b.caps ? "uppercase" : ""} text-balance break-words`}>{b.text}</Tag>;
    }
    case "text":
      return <p className={`${TEXT[b.size]} ${TONE[b.tone]} max-w-2xl break-words whitespace-pre-line group-data-[wide=true]/sec:max-w-5xl`}>{b.text}</p>;
    case "script":
      return <p className="font-comic text-2xl tracking-wide text-amber-500">{b.text}</p>;
    case "button":
      // text2 holds the lojee-ui animation ("" or "none" = static, the default)
      return <LinkButton href={b.url || "#rsvp"} animation={b.text2 && b.text2 !== "none" ? b.text2 : undefined}>{b.text}</LinkButton>;
    case "image":
      return b.url ? (
        b.frame === "none" ? (
          <Image src={b.url} alt={b.text} ratio="4/3" fit="cover" rounded="xl" loading="lazy" className={`w-full ${IMAGE_W[b.size]}`} />
        ) : (
          <Framed frame={b.frame} className={`w-full ${IMAGE_W[b.size]}`}><Image src={b.url} alt={b.text} ratio="4/3" fit="cover" rounded="xl" loading="lazy" className="w-full" /></Framed>
        )
      ) : edit ? (
        <p className="w-full max-w-md rounded-3xl border-2 border-dashed border-line py-16 text-sm text-soft">Image — choose one in the toolbox</p>
      ) : null;
    case "gallery":
      return b.images.length ? (
        <div className={`grid w-full gap-4 ${GALLERY[b.size]}`}>
          {b.images.map((img) => (
            <Framed key={img.url} frame={b.frame}><Image src={img.url} alt={img.alt} ratio="1/1" fit="cover" rounded="xl" loading="lazy" /></Framed>
          ))}
        </div>
      ) : edit ? (
        <p className="w-full rounded-3xl border-2 border-dashed border-line py-16 text-sm text-soft">Gallery — upload images in the toolbox</p>
      ) : null;
    case "emoji":
      return <span className={EMOJI[b.size]}>{b.text}</span>;
    case "card": {
      const inner = (
        <Card variant="outline" padding="lg" hoverable={!!b.url} className={`w-full rounded-[28px] !p-5 sm:!p-8 text-center ${b.url ? "border-brand" : ""}`}>
          <div className="flex justify-center"><BlockIcon name={b.icon} size={40} /></div>
          <h3 className="mt-3 text-xl font-extrabold text-ink sm:text-2xl">{b.text}</h3>
          <p className="mt-3 text-lg font-bold text-ink">{b.text2}</p>
          {b.text3 && <p className="text-soft">{b.text3}</p>}
        </Card>
      );
      if (b.tap !== "none" && !edit) return <TapCard mode={b.tap} back={b.back}>{inner}</TapCard>;
      return b.url ? (
        <a href={b.url} {...external(b.url)} className="block w-full">{inner}</a>
      ) : (
        inner
      );
    }
    case "step":
      return (
        <Card variant="outline" padding="md" className="relative w-full rounded-3xl text-left">
          <span className="absolute -left-[2.25rem] top-6 sm:-left-[3.25rem] h-5 w-5 rounded-full bg-brand ring-4 ring-cream" />
          <Badge variant="soft" size="sm" className="font-bold">{b.text}</Badge>
          <h3 className="mt-2 text-xl font-extrabold text-ink">{b.text2}</h3>
          <p className="mt-1 text-soft">{b.text3}</p>
        </Card>
      );
    case "countdown":
      return <Countdown target={b.text2} label={b.text} light={b.tone === "white"} endHeading={b.text3} fx={b.fxBg} />;
    case "rsvp":
      return (
        <div id="rsvp" className="w-full max-w-2xl scroll-mt-4 text-left">
          <Card variant="outline" padding="lg" className="rounded-[28px] border border-border p-4 shadow-none sm:p-10">
            <RsvpForm title={b.text} subtitle={b.text2} labels={b.labels} parts={b.parts} endpoint={rsvpEndpoint} />
          </Card>
        </div>
      );
    case "map": {
      const pos = parseLatLng(b.text3);
      if (!pos) {
        return edit ? <p className="w-full rounded-3xl border-2 border-dashed border-line py-16 text-sm text-soft">Map — search for a location in the toolbox</p> : null;
      }
      return <MapBlock title={b.text} location={b.text3} zoom={b.icon} size={b.size} interactive={!edit} avatar={b.url} />;
    }
    case "divider":
      return <Divider label={b.text || undefined} className="w-full max-w-xl" />;
    case "spacer":
      return <div className={`${SPACE[b.size]} w-full`} />;
    case "illustration":
      // an illustration that is part of the layout (not floating): it takes up room, so other elements move around it
      return b.deco ? <DecorItem d={{ id: b.id, section: "", x: 50, y: 50, path: DEFAULT_PATH, layer: "front", ...b.deco }} noPath selected={!!handles} handles={handles} className="decor-flow !static !transform-none mx-auto inline-block" style={{ left: "auto", top: "auto" }} /> : null;
  }
}

/** Consecutive steps form one timeline, consecutive cards one column, and elements of one group a row or column. */
function runsOf(blocks: Block[]) {
  const runs: { kind: "step" | "card" | "group" | "single"; group?: string; items: { b: Block; i: number }[] }[] = [];
  blocks.forEach((b, i) => {
    const kind = b.group ? "group" : b.type === "step" ? "step" : b.type === "card" ? "card" : "single";
    const last = runs[runs.length - 1];
    if (kind === "group" && last?.kind === "group" && last.group === b.group) last.items.push({ b, i });
    else if (kind === "group") runs.push({ kind, group: b.group, items: [{ b, i }] });
    else if (kind !== "single" && last?.kind === kind) last.items.push({ b, i });
    else runs.push({ kind, items: [{ b, i }] });
  });
  return runs;
}

/** how each kind of block arrives as the page is scrolled */
function scrollKind(b: Block, i: number, page: Settings["page"], screens: boolean): ScrollInKind {
  // screen-by-screen pages use one transition for everything on a screen
  if (screens) return page.transition === "slide" ? (i % 2 ? "right" : "left") : page.transition === "zoom" ? "zoom" : page.transition === "fade" ? "fade" : "rise";
  switch (b.type) {
    case "image": case "gallery": case "map": case "countdown": case "rsvp": return "zoom";
    case "card": return i % 2 ? "right" : "left";
    case "step": return "left";
    case "heading": case "badge": return "drop";
    default: return "rise";
  }
}

const WAVY = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='M3 2Q0 12 3 22T3 42T3 62T3 82T3 98H97Q100 88 97 78T97 58T97 38T97 18T97 2Z' fill='black'/></svg>")}")`;
const TICKET = "radial-gradient(circle 16px at 0 50%, #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(circle 16px at 100% 50%, #0000 97%, #000) right / 51% 100% no-repeat";

/** The panel behind a section's content: an organic blob, an arch, a wavy-sided card or a ticket with notches. (In the editor, masked shapes are shown rounded so the editing handles stay visible.) */
function panelStyle(panel: Section["panel"], edit: boolean): React.CSSProperties {
  const base: React.CSSProperties = { background: "var(--color-surface)", color: "var(--color-fg)", ["--on-bg" as string]: "var(--color-fg)" };
  switch (panel) {
    case "blob": return { ...base, borderRadius: "46px 96px 52px 90px / 70px 48px 88px 44px" };
    case "arch": return { ...base, borderRadius: "50% 50% 32px 32px / 16% 16% 32px 32px" };
    case "wavy": return edit ? { ...base, borderRadius: 32 } : { ...base, WebkitMask: WAVY + " 0 0 / 100% 100% no-repeat", mask: WAVY + " 0 0 / 100% 100% no-repeat" };
    case "ticket": return edit ? { ...base, borderRadius: 18 } : { ...base, WebkitMask: TICKET, mask: TICKET };
    default: return {};
  }
}

function SectionBody({ sec, edit, rsvpEndpoint, page, screens }: { sec: Section; edit?: EditProps; rsvpEndpoint?: string; page: Settings["page"]; screens: boolean }) {
  const node = (b: Block, i: number) => {
    const view = <BlockView b={b} edit={!!edit} rsvpEndpoint={rsvpEndpoint} handles={edit && b.type === "illustration" && edit.selected.block === b.id ? edit.illoHandles?.(b) : undefined} />;
    return edit ? (
      <EditBlock key={b.id} block={b} sectionId={sec.id} index={i} selected={edit.selected.block === b.id} pickedNo={edit.multi.indexOf(b.id) + 1} actions={edit.actions}>
        {view}
      </EditBlock>
    ) : (
      <div key={b.id} className="relative w-full" style={b.x || b.y ? (b.overlap ? { left: `${b.x}%`, top: b.y, zIndex: 2 } : { left: `${b.x}%`, marginTop: b.y }) : undefined}>
        <ScrollIn kind={scrollKind(b, i, page, screens)} once={!screens} delay={(i % 4) * 0.1} className="flex w-full flex-col items-center">{view}</ScrollIn>
      </div>
    );
  };
  return (
    <section
      className={`relative overflow-hidden ${BG[sec.bg]} ${PAD[sec.pad]} px-4 ${screens ? (sec.card ? "grid min-h-[calc(100dvh-5rem)] content-center" : "grid min-h-dvh content-center") : ""} ${sec.card ? "rounded-[inherit]" : ""} ${sec.blocks.length === 0 && edit ? "min-h-40" : ""}`}
      style={
        {
          ...(sec.bgColor ? { backgroundColor: sec.bgColor, color: onColor(sec.bgColor) } : {}),
          ...(sec.gradient.on ? { backgroundImage: `linear-gradient(${sec.gradient.angle}deg, ${sec.gradient.from}, ${sec.gradient.to})`, color: onGradient(sec.gradient.from, sec.gradient.to) } : {}),
          "--on-bg": sec.gradient.on ? onGradient(sec.gradient.from, sec.gradient.to) : sec.bgColor ? onColor(sec.bgColor) : sec.bg === "brand" || sec.bg === "ink" ? "#ffffff" : "var(--color-fg)",
        } as React.CSSProperties
      }
    >
      <SectionEffect kind={sec.effect} />
      <SectionBorder border={sec.border} id={sec.id} />
      <div className={`relative z-10 mx-auto w-full ${sec.wide ? "max-w-6xl" : "max-w-3xl"}`} style={{ ...(sec.panel === "none" ? {} : { filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.16))" }), marginBottom: sec.grow || undefined }}>
      <div className={`group/sec relative flex flex-col items-center gap-4 text-center md:gap-5 ${sec.panel === "none" ? "" : "px-6 py-10 sm:px-12 sm:py-14"}`} style={panelStyle(sec.panel, !!edit)} data-wide={sec.wide} data-sec-body>
        {runsOf(sec.blocks).map((run) =>
          run.kind === "single" ? (
            node(run.items[0].b, run.items[0].i)
          ) : run.kind === "group" ? (
            <div
              key={run.items[0].b.id}
              data-group={run.group}
              className={`flex w-full items-center justify-center gap-4 md:gap-6 ${run.items[0].b.groupDir === "row" ? "flex-row flex-wrap [&>*]:!w-auto [&>*]:max-w-full" : "flex-col"}`}
            >
              {run.items.map(({ b, i }) => node(b, i))}
            </div>
          ) : (
            <div
              key={run.items[0].b.id}
              className={run.kind === "step" ? "relative mt-4 flex w-full flex-col gap-5 border-l border-dashed border-line pl-6 sm:pl-10 md:gap-6" : "mt-2 flex w-full flex-col gap-6"}
            >
              {run.items.map(({ b, i }) => node(b, i))}
            </div>
          ),
        )}
      </div>
      </div>
    </section>
  );
}

/** The whole public page. `s` must already have {name} applied. In the admin it is rendered with `edit` as a live, drag-and-drop preview. */
export default function PageView({ s, edit, rsvpEndpoint, introTop }: { s: Settings; edit?: EditProps; rsvpEndpoint?: string; /** where the envelope intro starts, when the page sits under a header (the editor's preview) */ introTop?: number }) {
  // the editor canvas always scrolls normally, so editing stays easy; visitors and the preview get the chosen style
  const screens = !edit && s.page.mode === "screens";
  return (
    <main className={`flow-root ${edit ? "pl-12" : ""}`}>
      {!edit && s.page.intro.on && <EnvelopeIntro intro={s.page.intro} top={introTop} />}
      {screens && <ScreensMode />}
      {s.sections.map((sec, index) => {
        if (sec.hidden && !edit) return null;
        const body = <SectionBody sec={sec} edit={edit} rsvpEndpoint={rsvpEndpoint} page={s.page} screens={screens} />;
        if (edit) {
          return (
            <EditSection key={sec.id} section={sec} index={index} count={s.sections.length} sticker={edit.sticker?.section === sec.id ? edit.sticker : null} limits={{ rsvp: s.sections.some((x) => x.blocks.some((b) => b.type === "rsvp")), stickers: s.decorations.length >= MAX_DECORATIONS, textCount: s.decorations.filter((d) => d.kind === "text").length, graffitiCount: s.decorations.filter((d) => d.kind === "graffiti").length }} selected={edit.selected.section === sec.id} actions={edit.actions} layer={edit.layer(sec.id)}>
              {body}
            </EditSection>
          );
        }
        return (
          <div key={sec.id} data-section={sec.id} className={`decor-host relative ${screens ? "snap-start snap-always" : ""} ${sec.card ? "mx-auto my-5 w-[calc(100%-1rem)] md:my-8 md:w-[calc(100%-1.5rem)] max-w-7xl rounded-[32px] border md:rounded-[64px] border-border shadow-[0_10px_28px_-18px_rgba(0,0,0,0.25)] overflow-hidden" : ""}`}>
            {body}
            <Decorations items={s.decorations.filter((d) => d.section === sec.id)} />
          </div>
        );
      })}
      {edit && (
        <button type="button" data-action onClick={() => edit.actions.addSection(s.sections.length)} className="mx-auto my-6 block rounded-full border-2 border-dashed border-brand/50 px-8 py-3 font-bold text-brand">
          + Add section
        </button>
      )}
    </main>
  );
}
