"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Textarea } from "@/components/ui";
import { ColorField, TextField } from "@/components/admin/fields";
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
const parseEmails = (raw: string) => [...new Set(raw.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];

/** The Emails menu: customise each email's layout with a live preview, send a test to yourself, and email the event link to guests. */
export default function EmailEditor({ eventId, link, eventName, published, initial }: { eventId: string; link: string; eventName: string; published: boolean; initial: Record<EmailKind, EmailTemplate> }) {
  const [kind, setKind] = useState<EmailKind>("invitation");
  const [drafts, setDrafts] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState<"" | "save" | "test" | "send">("");
  const [msg, setMsg] = useState<Msg>(null);
  const [raw, setRaw] = useState("");
  const [log, setLog] = useState<EmailLogRow[]>([]);
  const [limit, setLimit] = useState<{ sentToday: number; perDay: number } | null>(null);

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
        setLimit({ sentToday: d.sentToday, perDay: d.perDay });
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
    const emails = parseEmails(raw);
    setBusy("send");
    setMsg(null);
    if (dirty) await save();
    const res = await fetch(`/api/events/${eventId}/invitations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emails }) });
    const d = await res.json().catch(() => null);
    if (res.ok) {
      const failed = (d.results as { ok: boolean }[]).filter((r) => !r.ok).length;
      setMsg({ ok: failed === 0, text: failed ? `${d.sent} sent, ${failed} failed. See the list below.` : `${d.sent} invitation${d.sent === 1 ? "" : "s"} sent.` });
      if (!failed) setRaw("");
    } else setMsg({ ok: false, text: d?.error ?? "Could not send." });
    setBusy("");
    loadLog();
  }

  const emails = parseEmails(raw);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap gap-2">
        {EMAIL_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => {
              setKind(k);
              setMsg(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${kind === k ? "bg-accent-600 text-white" : "bg-surface-muted text-fg-muted hover:text-fg"}`}
          >
            {EMAIL_KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <p className="-mt-4 text-sm text-soft">{EMAIL_KIND_HINT[kind]}</p>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card variant="outline" padding="lg" className="grid gap-4 rounded-3xl">
          <TextField label="Subject" value={t.subject} onChange={(subject) => set({ subject })} maxLength={200} />
          <TextField label="Heading (small text on the colour band)" value={t.heading} onChange={(heading) => set({ heading })} maxLength={200} />
          <TextField label="Message" value={t.body} long onChange={(body) => set({ body })} maxLength={3000} />
          <TextField label="Button label (empty = no button)" value={t.buttonLabel} onChange={(buttonLabel) => set({ buttonLabel })} maxLength={60} />
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Band & button colour" value={t.accent} onChange={(accent) => set({ accent })} />
            <ColorField label="Background colour" value={t.background} onChange={(background) => set({ background })} />
          </div>
          <TextField label="Footer" value={t.footer} onChange={(footer) => set({ footer })} maxLength={300} />
          <p className="text-xs text-soft">
            Fill-in words: {EMAIL_PLACEHOLDERS.map((p) => <code key={p} className="mr-1.5 rounded bg-surface-muted px-1">{p}</code>)}— replaced for each guest.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button shape="pill" size="sm" loading={busy === "save"} disabled={!dirty || !!busy} onClick={save}>Save</Button>
            <Button shape="pill" size="sm" variant="outline" loading={busy === "test"} disabled={!!busy} onClick={sendTest}>Send a test to me</Button>
          </div>
          {msg && <Alert variant={msg.ok ? "success" : "error"}>{msg.text}</Alert>}
        </Card>

        <div className="grid gap-2 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-wide text-fg-muted">Preview</p>
          <p className="truncate rounded-2xl bg-surface-muted px-4 py-2 text-sm"><span className="text-soft">Subject: </span><b>{renderSubject(t, vars)}</b></p>
          <iframe title="Email preview" srcDoc={html} sandbox="" className="h-[520px] w-full rounded-3xl border border-border bg-white" />
        </div>
      </div>

      {kind === "invitation" && (
        <section className="grid gap-4 rounded-3xl border border-border bg-surface p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-extrabold">Email the link to guests</h2>
            <p className="text-sm text-soft">Paste email addresses, separated by commas, spaces or new lines. Each person gets the invitation above with a button to your event page.</p>
          </div>
          {!published && <Alert variant="warning">The event is hidden, so the link would not open. Publish it on the Replies tab first.</Alert>}
          <Textarea rows={4} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="alex@example.com, sam@example.com" />
          <div className="flex flex-wrap items-center gap-3">
            <Button shape="pill" size="sm" loading={busy === "send"} disabled={!!busy || !published || emails.length === 0 || emails.length > 25} onClick={sendInvites}>
              Send {emails.length > 0 ? `${emails.length} invitation${emails.length === 1 ? "" : "s"}` : "invitations"}
            </Button>
            <span className="text-xs text-soft">Up to 25 at a time{limit ? ` · ${limit.sentToday} of ${limit.perDay} sent in the last 24 hours` : ""}.</span>
          </div>

          {log.length > 0 && (
            <div className="grid gap-1.5 border-t border-border pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-fg-muted">Recent emails</p>
              <ul className="grid gap-1 text-sm">
                {log.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Badge variant="soft" size="xs" color={l.status === "sent" ? "emerald" : "rose"}>{l.status}</Badge>
                    <span className="min-w-0 truncate">{l.to}</span>
                    <span className="text-xs text-soft">{l.kind} · {new Date(l.sentAt).toLocaleString()}</span>
                    {l.error && <span className="text-xs text-rose-600">{l.error}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
