"use client";

import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Lock, Mail, Minus, PartyPopper, Plus, Users, X } from "lucide-react";
import { Alert, Button, Input, Label, Textarea } from "@/components/ui";
import { resolveRsvpParts, RSVP_DEFAULTS, type RsvpPart, type RsvpPartKey } from "@/lib/settings-shared";

type Result = { attending: boolean; guests: number; name: string; email: string } | null;

// how each piece sits in the form's two-column grid, and how its size and alignment are applied
const WIDTH = { half: "col-span-2 sm:col-span-1", full: "col-span-2", fit: "col-span-2 w-fit" } as const;
const FIT_ALIGN = { left: "justify-self-start", center: "justify-self-center", right: "justify-self-end" } as const;
const TEXT_ALIGN = { left: "text-left", center: "text-center", right: "text-right" } as const;
const ZOOM = { sm: 0.88, md: 1, lg: 1.15, xl: 1.3 } as const;

const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.18em] text-soft";

/** − n + counter */
function Counter({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const step =
    "flex h-9 w-9 items-center justify-center rounded-full bg-surface text-fg shadow-sm ring-1 ring-border transition hover:ring-fg active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:ring-border";
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold leading-tight">{label}</p>
        <p className="text-xs text-soft">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} className={step} disabled={value <= min} onClick={() => onChange(value - 1)}>
          <Minus size={15} />
        </button>
        <span className="font-display w-6 text-center text-xl font-bold tabular-nums">{value}</span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} className={step} disabled={value >= max} onClick={() => onChange(value + 1)}>
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

/** a large selectable answer */
function Choice({ active, onClick, icon, title, hint }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; hint: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
        active ? "border-accent-600 bg-accent-500/[0.07]" : "border-transparent bg-surface-muted hover:border-border"
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${active ? "bg-accent-600 text-white" : "bg-surface text-soft ring-1 ring-border"}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-bold leading-tight">{title}</span>
        <span className="block text-xs text-soft">{hint}</span>
      </span>
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-white"
          >
            <Check size={12} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function RsvpForm({ title, subtitle, labels = {}, parts: partsProp, endpoint }: { title: string; subtitle: string; labels?: Record<string, string>; parts?: RsvpPart[]; /** where the reply is sent (the public event page sets it) */ endpoint?: string }) {
  /** the text for a key: what the editor set, else the default */
  const L = (key: string) => labels[key]?.trim() || RSVP_DEFAULTS[key];
  const [attending, setAttending] = useState(true);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [noteLength, setNoteLength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Result>(null);
  const total = adults + kids;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const guests = attending ? Math.min(10, Math.max(1, total)) : 1;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint ?? "", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          message: f.get("message") || undefined,
          website: f.get("website"),
          attending,
          guests,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setDone({ attending, guests, name: String(f.get("name") ?? ""), email: String(f.get("email") ?? "") });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid justify-items-center gap-5 py-8 text-center">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-600 text-white shadow-lg"
        >
          {done.attending ? <PartyPopper size={28} /> : <Mail size={26} />}
        </motion.span>
        <div className="grid gap-2">
          <h3 className="font-display text-3xl font-bold">{done.attending ? L("doneYesTitle") : L("doneNoTitle")}</h3>
          <p className="mx-auto max-w-sm text-sm text-soft">
            {done.attending ? L("doneYesText") : L("doneNoText")}
          </p>
        </div>
        <dl className="grid w-full max-w-sm gap-px overflow-hidden rounded-2xl bg-border text-left text-sm ring-1 ring-border">
          {[
            ["Name", done.name],
            ["Reply", done.attending ? "Attending" : "Not attending"],
            ...(done.attending ? [["Guests", String(done.guests)]] : []),
            ["Confirmation to", done.email],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 bg-surface px-4 py-3">
              <dt className="text-soft">{k}</dt>
              <dd className="truncate font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    );
  }

  const parts = resolveRsvpParts(partsProp);

  const content: Record<RsvpPartKey, (p: RsvpPart) => React.ReactNode> = {
    name: () => (
      <div className="grid gap-2">
        <Label htmlFor="name" required className={eyebrow}>{L("nameLabel")}</Label>
        <Input id="name" name="name" variant="filled" size="lg" leadingIcon="user" placeholder={L("namePlaceholder")} required maxLength={80} autoComplete="name" />
      </div>
    ),
    email: () => (
      <div className="grid gap-2">
        <Label htmlFor="email" required className={eyebrow}>{L("emailLabel")}</Label>
        <Input id="email" name="email" type="email" variant="filled" size="lg" leadingIcon="mail" placeholder={L("emailPlaceholder")} required autoComplete="email" />
      </div>
    ),
    attend: () => (
      <div className="grid gap-3">
        <span className={eyebrow}>{L("attendLabel")}</span>
        <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label={L("attendLabel")}>
          <Choice active={attending} onClick={() => setAttending(true)} icon={<Check size={20} />} title={L("yesTitle")} hint={L("yesHint")} />
          <Choice active={!attending} onClick={() => setAttending(false)} icon={<X size={20} />} title={L("noTitle")} hint={L("noHint")} />
        </div>
      </div>
    ),
    guests: () => (
      <AnimatePresence initial={false}>
        {attending && (
          <motion.div
            key="guests"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className={eyebrow}>{L("whoLabel")}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-2.5 py-1 text-xs font-semibold text-accent-700 dark:text-accent-300">
                  <Users size={13} />
                  {Math.min(total, 10)} {Math.min(total, 10) === 1 ? L("guestOne") : L("guestMany")}
                </span>
              </div>
              <div className="grid gap-4 rounded-2xl bg-surface-muted p-4 sm:grid-cols-2 sm:gap-8 sm:p-5">
                <Counter label={L("adultsLabel")} hint={L("adultsHint")} value={adults} min={1} max={9} onChange={setAdults} />
                <Counter label={L("kidsLabel")} hint={L("kidsHint")} value={kids} min={0} max={9} onChange={setKids} />
              </div>
              {total > 10 && <p className="text-xs text-soft">We can take up to 10 guests per reply — the first 10 will be counted.</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    notes: () => (
      <div className="grid gap-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="message" className={eyebrow}>{L("notesLabel")}</Label>
          <span className="text-[11px] tabular-nums text-soft">{noteLength}/500</span>
        </div>
        <Textarea id="message" name="message" variant="filled" rows={3} maxLength={500} placeholder={L("notesPlaceholder")} onChange={(e) => setNoteLength(e.target.value.length)} />
      </div>
    ),
    submit: (p) => (
      <Button type="submit" size="lg" shape="pill" loading={loading} className={`font-semibold ${p.width === "fit" ? "" : "w-full"}`}>
        {loading ? L("sending") : (<>{attending ? L("submitYes") : L("submitNo")} <ArrowRight size={17} className="ml-1" /></>)}
      </Button>
    ),
    privacy: (p) => (
      <p className={`flex items-center gap-1.5 text-xs text-soft ${p.align === "center" ? "justify-center" : p.align === "right" ? "justify-end" : ""}`}>
        <Lock size={12} /> {L("privacy")}
      </p>
    ),
  };

  return (
    <div className="px-1 py-1 sm:px-3">
      <div className="mb-9 text-center">
        <h2 className="text-3xl font-extrabold text-ink md:text-4xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-soft">{subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-x-5 gap-y-7">
        {parts
          .filter((p) => !p.hidden)
          .map((p) => (
            <Fragment key={p.key}>
              {p.key === "submit" && error && (
                <div className="col-span-2">
                  <Alert variant="error" closable onClose={() => setError(null)}>{error}</Alert>
                </div>
              )}
              <div
                data-rsvp-part={p.key}
                className={`${WIDTH[p.width]} ${p.width === "fit" ? FIT_ALIGN[p.align] : ""} ${TEXT_ALIGN[p.align]}`}
                style={{ zoom: ZOOM[p.size] }}
              >
                {content[p.key](p)}
              </div>
            </Fragment>
          ))}

        {/* honeypot — hidden from humans */}
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      </form>
    </div>
  );
}
