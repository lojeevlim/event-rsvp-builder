"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog, Button, Switch } from "@/components/ui";

/** Publish or hide the event, or delete it. */
export default function EventDangerZone({ eventId, title, published }: { eventId: string; title: string; published: boolean }) {
  const router = useRouter();
  const [live, setLive] = useState(published);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function setPublished(next: boolean) {
    setLive(next);
    const res = await fetch(`/api/events/${eventId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: next }) });
    if (!res.ok) setLive(!next);
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard");
    else setBusy(false);
  }

  return (
    <section className="grid gap-4 rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-extrabold">Event settings</h2>
      <Switch label="Event page is live (guests can open the link and reply)" checked={live} onChange={(e) => setPublished(e.target.checked)} />
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
