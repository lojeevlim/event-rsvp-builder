"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleCheck, Inbox, Mail, Palette, PenLine, Send, Sparkles } from "lucide-react";
import { Alert, Button, Textarea } from "@/components/ui";
import { ColorField, Field, TextField } from "@/components/admin/fields";
import {
  EMAIL_KIND_HINT,
  EMAIL_KIND_LABEL,
  EMAIL_KINDS,
  EMAIL_PLACEHOLDERS,
  renderEmailHtml,
  renderSubject,
  type EmailKind,
  type EmailTemplate,
} from "@/lib/email-template";
import type { EmailLogRow } from "@/lib/data";

type Msg = { ok: boolean; text: string } | null;

const KIND_ICON = { invitation: Mail, confirmation: CircleCheck } as const;
const SWATCHES = ["#18181b", "#0f172a", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#22c55e", "#0ea5e9"];
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const parseEmails = (raw: string) => [...new Set(raw.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];

const card = "rounded-3xl border border-border bg-surface shadow-sm";
const sectionTitle = "flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-soft";

/** The Emails menu: customise each email's layout with a live preview, send a test to yourself, and email the event link to guests. */
export default function EmailEditor({ eventId, link, eventName, published, initial }: { eventId: string; link: string; eventName: string; published: boolean; initial: Record<EmailKind, EmailTemplate> }) {
  const [kind, setKind] = useState<EmailKind>("invitation");
  const [drafts, setDrafts] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState<"" | "save" | "test" | "send">("");
  const [msg, setMsg] = useState<Msg>(null);
  const [inviteMsg, setInviteMsg] = useState<Msg>(null); // shown inside the "Email the link" section, next to its button
  const [raw, setRaw] = useState("");
  const [log, setLog] = useState<EmailLogRow[]>([]);
  const [limit, setLimit] = useState<{ sentToday: number; perDay: number; provider: string; warning: string | null } | null>(null);

  const t = drafts[kind];
  const dirty = JSON.stringify(drafts[kind]) !== JSON.stringify(saved[kind]);
  const set = (patch: Partial<EmailTemplate>) => setDrafts((d) => ({ ...d, [kind]: { ...d[kind], ...patch } }));

  const vars = { guest: "Alex", event: eventName, link, guests: 2 };
  const html = useMemo(() => renderEmailHtml(t, vars), [t, eventName, link]); // eslint-disable-line react-hooks/exhaustive-deps

  const [logTick, setLogTick] = useState(0);
  const loadLog = () => setLogTick((n) => n + 1);
  useEffect(() => {
    let live = true;
    fetch(`/api/events/${eventId}/invitations`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!live || !d) return;
        setLog(d.log);
        setLimit({ sentToday: d.sentToday, perDay: d.perDay, provider: d.provider, warning: d.providerWarning });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [eventId, logTick]);

  async function save() {
    setBusy("save");
    setMsg(null);
    const res = await fetch(`/api/events/${eventId}/emails/${kind}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) });
    const d = await res.json().catch(() => null);
    if (res.ok) {
      setDrafts((x) => ({ ...x, [kind]: d }));
      setSaved((x) => ({ ...x, [kind]: d }));
      setMsg({ ok: true, text: "Saved." });
    } else setMsg({ ok: false, text: d?.error ?? "Could not save." });
    setBusy("");
  }

  async function sendTest() {
    setBusy("test");
    setMsg(null);
    if (dirty) await save();
    const res = await fetch(`/api/events/${eventId}/emails/${kind}/test`, { method: "POST" });
    const d = await res.json().catch(() => null);
    setMsg(res.ok ? { ok: true, text: `Test sent to ${d.to}.` } : { ok: false, text: d?.error ?? "Could not send." });
    setBusy("");
  }

  async function sendInvites() {
    const emails = parseEmails(raw).filter((e) => EMAIL_OK.test(e));
    setBusy("send");
    setInviteMsg(null);
    if (dirty) await save();
    const res = await fetch(`/api/events/${eventId}/invitations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emails }) });
    const d = await res.json().catch(() => null);
    if (res.ok) {
      const failed = (d.results as { ok: boolean }[]).filter((r) => !r.ok).length;
      const firstError = (d.results as { ok: boolean; error?: string }[]).find((r) => !r.ok)?.error;
      setInviteMsg({ ok: failed === 0, text: failed ? `${d.sent} sent, ${failed} failed. ${firstError ?? ""}` : `${d.sent} invitation${d.sent === 1 ? "" : "s"} sent.` });
      if (!failed) setRaw("");
    } else setInviteMsg({ ok: false, text: d?.error ?? "Could not send." });
    setBusy("");
    loadLog();
  }

  const emails = parseEmails(raw);
  const valid = emails.filter((e) => EMAIL_OK.test(e));
  const invalid = emails.length - valid.length;
  const used = limit ? Math.min(100, Math.round((limit.sentToday / limit.perDay) * 100)) : 0;
  const insertWord = (word: string) => set({ body: `${t.body}${t.body && !/\s$/.test(t.body) ? " " : ""}${word}` });
  const Icon = KIND_ICON[kind];

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8">
      {/* which email, and its actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <div className="inline-flex w-fit rounded-2xl border border-border bg-surface-muted p-1" role="tablist" aria-label="Email type">
            {EMAIL_KINDS.map((k) => {
              const KIcon = KIND_ICON[k];
              const active = kind === k;
              return (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setKind(k);
                    setMsg(null);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-surface text-fg shadow-sm ring-1 ring-border" : "text-soft hover:text-fg"}`}
                >
                  <KIcon size={16} className={active ? "text-accent-600" : ""} />
                  {EMAIL_KIND_LABEL[k]}
                </button>
              );
            })}
          </div>
          <p className="flex items-center gap-1.5 text-sm text-soft">
            <Icon size={14} className="shrink-0" /> {EMAIL_KIND_HINT[kind]}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {dirty && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Unsaved changes
            </span>
          )}
          <Button shape="pill" size="sm" variant="outline" loading={busy === "test"} disabled={!!busy} onClick={sendTest}>
            <Send size={14} className="mr-1.5" /> Send a test to me
          </Button>
          <Button shape="pill" size="sm" loading={busy === "save"} disabled={!dirty || !!busy} onClick={save} className="font-semibold">
            Save changes
          </Button>
        </div>
      </div>
      {msg && <Alert variant={msg.ok ? "success" : "error"}>{msg.text}</Alert>}

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* the editor */}
        <div className={`${card} divide-y divide-border`}>
          <section className="grid gap-5 p-5 sm:p-7">
            <h3 className={sectionTitle}><PenLine size={14} /> Content</h3>
            <TextField label="Subject" value={t.subject} onChange={(subject) => set({ subject })} maxLength={200} />
            <TextField label="Heading — small text on the colour band" value={t.heading} onChange={(heading) => set({ heading })} maxLength={200} />
            <Field label="Message">
              <Textarea rows={6} value={t.body} maxLength={3000} onChange={(e) => set({ body: e.target.value })} />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-soft"><Sparkles size={12} /> Add a fill-in word:</span>
              {EMAIL_PLACEHOLDERS.map((p) => (
                <button key={p} type="button" onClick={() => insertWord(p)} title={`Add ${p} to the message`} className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 font-mono text-xs text-fg-muted transition hover:border-accent-500 hover:text-fg">
                  {p}
                </button>
              ))}
            </div>
            <TextField label="Button label (empty = no button)" value={t.buttonLabel} onChange={(buttonLabel) => set({ buttonLabel })} maxLength={60} />
          </section>
          <section className="grid gap-5 p-5 sm:p-7">
            <h3 className={sectionTitle}><Palette size={14} /> Style</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <ColorField label="Band & button colour" value={t.accent} presets={SWATCHES} onChange={(accent) => set({ accent })} />
              <ColorField label="Background colour" value={t.background} presets={["#f4f4f5", "#ffffff", "#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#ede9fe", "#fee2e2", "#e2e8f0"]} onChange={(background) => set({ background })} />
            </div>
            <TextField label="Footer" value={t.footer} onChange={(footer) => set({ footer })} maxLength={300} />
          </section>
        </div>

        {/* the preview, framed like an email client */}
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 lg:sticky lg:top-24">
          <p className={sectionTitle}><Inbox size={14} /> Live preview</p>
          <div className="min-w-0 rounded-3xl border border-border bg-surface-muted p-3 shadow-sm sm:p-4">
            <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
              <div className="flex items-center gap-1.5 border-b border-border bg-surface-muted px-4 py-2.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="ml-3 text-[11px] font-medium text-soft">Inbox</span>
              </div>
              <div className="flex min-w-0 items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: t.accent }}>
                  {(eventName || "E")[0].toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-fg">{renderSubject(t, vars)}</p>
                  <p className="truncate text-xs text-soft">
                    <span className="font-semibold text-fg-muted">{eventName}</span> to Alex · just now
                  </p>
                </div>
              </div>
              <iframe title="Email preview" srcDoc={html} sandbox="" className="h-[560px] w-full bg-white sm:h-[470px]" />
            </div>
          </div>
        </div>
      </div>

      {kind === "invitation" && (
        <section className={`${card} grid grid-cols-[minmax(0,1fr)] gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]`}>
          <div className="grid content-start gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold"><Send size={18} className="text-accent-600" /> Email the link to guests</h2>
              <p className="mt-1 text-sm text-soft">Paste email addresses, separated by commas, spaces or new lines. Each person gets the invitation above with a button to your event page.</p>
            </div>
            {!published && <Alert variant="warning">The event is hidden, so the link would not open. Publish it on the Replies tab first.</Alert>}
            <Textarea rows={4} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="alex@example.com, sam@example.com" />
            {emails.length > 0 && (
              <div className="flex flex-wrap gap-1.5" aria-label="Addresses to send to">
                {emails.slice(0, 12).map((e) => (
                  <span key={e} className={`max-w-full break-all rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${EMAIL_OK.test(e) ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200"}`}>
                    {e}
                  </span>
                ))}
                {emails.length > 12 && <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-soft">+{emails.length - 12} more</span>}
              </div>
            )}
            {inviteMsg && <Alert variant={inviteMsg.ok ? "success" : "error"}>{inviteMsg.text}</Alert>}
            <div className="flex flex-wrap items-center gap-3">
              <Button shape="pill" size="sm" loading={busy === "send"} disabled={!!busy || !published || valid.length === 0 || valid.length > 25} onClick={sendInvites} className="font-semibold">
                <Send size={14} className="mr-1.5" /> Send {valid.length > 0 ? `${valid.length} invitation${valid.length === 1 ? "" : "s"}` : "invitations"}
              </Button>
              <span className="text-xs text-soft">
                Up to 25 at a time{invalid > 0 ? ` · ${invalid} address${invalid === 1 ? "" : "es"} look wrong and will be skipped` : ""}.
              </span>
            </div>
          </div>

          <div className="grid content-start gap-5 lg:border-l lg:border-border lg:pl-8">
            {limit && (
              <div className="grid gap-2">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold">Sent in the last 24 hours</span>
                  <span className="tabular-nums text-soft">{limit.sentToday} / {limit.perDay}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={limit.sentToday} aria-valuemin={0} aria-valuemax={limit.perDay}>
                  <div className="h-full rounded-full bg-accent-600 transition-all" style={{ width: `${used}%` }} />
                </div>
              </div>
            )}
            {limit && (
              <p className="flex items-start gap-2 rounded-2xl bg-surface-muted px-3.5 py-2.5 text-xs text-soft">
                <Mail size={14} className="mt-0.5 shrink-0" />
                <span>
                  Sending with <b className="text-fg-muted">{limit.provider}</b>.{limit.warning ? <span className="text-amber-700"> {limit.warning}</span> : null}
                </span>
              </p>
            )}
            <div className="grid gap-2">
              <p className={sectionTitle}>Recent emails</p>
              {log.length === 0 ? (
                <p className="rounded-2xl bg-surface-muted px-4 py-5 text-center text-sm text-soft">Nothing sent yet.</p>
              ) : (
                <ul className="grid max-h-72 gap-1 overflow-y-auto pr-1">
                  {log.map((l) => (
                    <li key={l.id} className="flex min-w-0 items-start gap-3 rounded-xl px-2 py-2 hover:bg-surface-muted">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${l.status === "sent" ? "bg-emerald-500" : "bg-rose-500"}`} aria-label={l.status} />
                      <div className="min-w-0 [overflow-wrap:anywhere]">
                        <p className="text-sm font-medium">{l.to}</p>
                        <p className="text-xs text-soft">{l.kind} · {new Date(l.sentAt).toLocaleString()}</p>
                        {l.error && <p className="text-xs text-rose-600">{l.error}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
