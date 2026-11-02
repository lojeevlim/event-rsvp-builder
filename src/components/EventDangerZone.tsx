"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog, Button, Switch } from "@/components/ui";
import { startNavProgress } from "@/lib/nav-progress";

/** Publish or hide the event, or delete it. */
export default function EventDangerZone({ eventId, title, published, notifyHost, notifyEmail }: { eventId: string; title: string; published: boolean; notifyHost: boolean; notifyEmail: string }) {
  const router = useRouter();
  const [live, setLive] = useState(published);
  const [notify, setNotify] = useState(notifyHost);
  const [email, setEmail] = useState(notifyEmail);
  const [savedEmail, setSavedEmail] = useState(notifyEmail);
  const [emailMsg, setEmailMsg] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function setPublished(next: boolean) {
    setLive(next);
    const res = await fetch(`/api/events/${eventId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: next }) });
    if (!res.ok) setLive(!next);
    router.refresh();
  }

  async function setNotifyHost(next: boolean) {
    setNotify(next);
    const res = await fetch(`/api/events/${eventId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notifyHost: next }) });
    if (!res.ok) setNotify(!next);
  }

  async function saveEmail() {
    const next = email.trim();
    if (next === savedEmail) return;
    const res = await fetch(`/api/events/${eventId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notifyEmail: next }) });
    if (res.ok) {
      setSavedEmail(next);
      setEmail(next);
      setEmailMsg("Saved");
    } else setEmailMsg("Enter a valid email address");
  }

  async function remove() {
    setBusy(true);
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      startNavProgress();
      router.push("/dashboard");
    }
    else setBusy(false);
  }

  return (
    <section className="grid gap-4 rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-extrabold">Event settings</h2>
      <Switch label="Event page is live (guests can open the link and reply)" checked={live} onChange={(e) => setPublished(e.target.checked)} />
      <Switch label="Email me when someone replies" checked={notify} onChange={(e) => setNotifyHost(e.target.checked)} />
      {notify && (
        <div>
          <label className="text-sm font-bold" htmlFor="notify-email">Send reply emails to</label>
          <input
            id="notify-email"
            type="email"
            value={email}
            placeholder="Leave empty to use your sign-in email"
            onChange={(e) => { setEmail(e.target.value); setEmailMsg(""); }}
            onBlur={saveEmail}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/15"
          />
          {emailMsg && <p className={`mt-1 text-xs ${emailMsg === "Saved" ? "text-emerald-600" : "text-red-600"}`}>{emailMsg}</p>}
        </div>
      )}
      <div className="border-t border-border pt-4">
        <Button variant="destructive-outline" size="sm" shape="pill" icon="trash-2" onClick={() => setConfirm(true)}>Delete event</Button>
        <p className="mt-2 text-xs text-soft">Deleting removes the page and every reply. This can&apos;t be undone.</p>
      </div>
      {confirm && (
        <AlertDialog
          open
          onClose={() => !busy && setConfirm(false)}
          variant="destructive"
          title={`Delete “${title}”?`}
          description="The page, its design and all replies will be removed for good."
          confirmLabel={busy ? "Deleting…" : "Delete event"}
          onConfirm={remove}
        />
      )}
    </section>
  );
}
