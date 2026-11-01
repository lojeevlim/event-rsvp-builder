import type { ReactNode } from "react";
import RsvpForm from "@/components/RsvpForm";
import LinkButton from "@/components/LinkButton";
import MapBlock from "@/components/MapBlock";
import { parseLatLng } from "@/lib/map";
import { Badge, Card, Divider, Image } from "@/components/ui";
import { BlockIcon } from "@/components/icons";
import SectionEffect from "@/components/SectionEffect";
import Countdown from "@/components/Countdown";
import Decorations from "@/components/Decorations";
import { EditBlock, EditSection, type EditActions } from "@/components/edit-ui";
import { MAX_DECORATIONS, type Block, type Section, type Settings } from "@/lib/settings-shared";

export type EditProps = {
  selected: { section: string | null; block: string | null };
  /** draggable sticker layer for a section (admin preview only) */
  layer: (sectionId: string) => ReactNode;
  actions: EditActions;
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


const external = (url: string) => (/^https?:\/\//i.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {});

function BlockView({ b, edit }: { b: Block; edit: boolean }) {
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
      // text2 holds the lojee-ui animation ("" = glow, "none" = static)
      return <LinkButton href={b.url || "#rsvp"} animation={b.text2 === "none" ? undefined : b.text2 || "glow"}>{b.text}</LinkButton>;
    case "image":
      return b.url ? (
        <Image src={b.url} alt={b.text} ratio="4/3" fit="cover" rounded="xl" loading="lazy" className={`w-full ${IMAGE_W[b.size]}`} />
      ) : edit ? (
        <p className="w-full max-w-md rounded-3xl border-2 border-dashed border-line py-16 text-sm text-soft">Image — choose one in the toolbox</p>
      ) : null;
    case "gallery":
      return b.images.length ? (
        <div className={`grid w-full gap-4 ${GALLERY[b.size]}`}>
          {b.images.map((img) => (
            <Image key={img.url} src={img.url} alt={img.alt} ratio="1/1" fit="cover" rounded="xl" loading="lazy" />
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
      return <Countdown target={b.text2} label={b.text} light={b.tone === "white"} />;
    case "rsvp":
      return (
        <div id="rsvp" className="w-full max-w-2xl scroll-mt-4 text-left">
          <Card variant="outline" padding="lg" className="rounded-[28px] border border-border p-4 shadow-none sm:p-10">
            <RsvpForm title={b.text} subtitle={b.text2} labels={b.labels} parts={b.parts} />
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
  }
}

/** Consecutive steps form one timeline, consecutive cards one column. */
function runsOf(blocks: Block[]) {
  const runs: { kind: "step" | "card" | "single"; items: { b: Block; i: number }[] }[] = [];
  blocks.forEach((b, i) => {
    const kind = b.type === "step" ? "step" : b.type === "card" ? "card" : "single";
    const last = runs[runs.length - 1];
    if (kind !== "single" && last?.kind === kind) last.items.push({ b, i });
    else runs.push({ kind, items: [{ b, i }] });
  });
  return runs;
}

function SectionBody({ sec, edit }: { sec: Section; edit?: EditProps }) {
  const node = (b: Block, i: number) => {
    const view = <BlockView b={b} edit={!!edit} />;
    return edit ? (
      <EditBlock key={b.id} block={b} sectionId={sec.id} index={i} selected={edit.selected.block === b.id} actions={edit.actions}>
        {view}
      </EditBlock>
    ) : (
      <div key={b.id} className="flex w-full flex-col items-center">{view}</div>
    );
  };
  return (
    <section
      className={`relative ${BG[sec.bg]} ${PAD[sec.pad]} px-4 ${sec.card ? "rounded-[inherit]" : ""} ${sec.blocks.length === 0 && edit ? "min-h-40" : ""}`}
      style={
        {
          ...(sec.bgColor ? { backgroundColor: sec.bgColor, color: onColor(sec.bgColor) } : {}),
          "--on-bg": sec.bgColor ? onColor(sec.bgColor) : sec.bg === "brand" || sec.bg === "ink" ? "#ffffff" : "var(--color-fg)",
        } as React.CSSProperties
      }
    >
      <SectionEffect kind={sec.effect} />
      <div className={`group/sec relative z-10 mx-auto flex flex-col items-center gap-4 text-center md:gap-5 ${sec.wide ? "max-w-6xl" : "max-w-3xl"}`} data-wide={sec.wide}>
        {runsOf(sec.blocks).map((run) =>
          run.kind === "single" ? (
            node(run.items[0].b, run.items[0].i)
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
    </section>
  );
}

/** The whole public page. `s` must already have {name} applied. In the admin it is rendered with `edit` as a live, drag-and-drop preview. */
export default function PageView({ s, edit }: { s: Settings; edit?: EditProps }) {
  return (
    <main className="flow-root">
      {s.sections.map((sec, index) => {
        if (sec.hidden && !edit) return null;
        const body = <SectionBody sec={sec} edit={edit} />;
        if (edit) {
          return (
            <EditSection key={sec.id} section={sec} index={index} count={s.sections.length} sticker={edit.sticker?.section === sec.id ? edit.sticker : null} limits={{ rsvp: s.sections.some((x) => x.blocks.some((b) => b.type === "rsvp")), stickers: s.decorations.length >= MAX_DECORATIONS, textCount: s.decorations.filter((d) => d.kind === "text").length, graffitiCount: s.decorations.filter((d) => d.kind === "graffiti").length }} selected={edit.selected.section === sec.id} actions={edit.actions} layer={edit.layer(sec.id)}>
              {body}
            </EditSection>
          );
        }
        return (
          <div key={sec.id} data-section={sec.id} className={`decor-host relative ${sec.card ? "mx-auto my-5 w-[calc(100%-1rem)] md:my-8 md:w-[calc(100%-1.5rem)] max-w-7xl rounded-[32px] border md:rounded-[64px] border-border shadow-[0_10px_28px_-18px_rgba(0,0,0,0.25)] overflow-hidden" : ""}`}>
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
