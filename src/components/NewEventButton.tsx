"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Alert, Button, Modal } from "@/components/ui";
import { SelectField, TextField } from "@/components/admin/fields";
import { EVENT_TYPE_OPTIONS } from "@/lib/presets";

/** The "Create an event" dialog: asks for a name and a type, creates the event and opens its design editor. */
export function NewEventDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<(typeof EVENT_TYPE_OPTIONS)[number][0]>("general");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, type }) });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "Could not create the event.");
      setBusy(false);
      return;
    }
    router.push(`/editor/${data.id}`);
  }

  return (
    <Modal open onClose={() => !busy && onClose()} title="Create an event" className="max-w-md">
      {/* tall enough that the open Type list (10 options) is not cut off by the dialog */}
      <form onSubmit={create} className="grid min-h-[22rem] content-start gap-4">
        <TextField label="Event name" value={title} onChange={setTitle} maxLength={60} placeholder="e.g. Mia's 30th Birthday" />
        <SelectField label="Type" value={type} options={EVENT_TYPE_OPTIONS} onChange={setType} />
        <p className="text-xs text-soft">The type fills in ready-made text. You can change everything in the editor.</p>
        {error && <Alert variant="error">{error}</Alert>}
        <Button type="submit" shape="pill" loading={busy} disabled={!title.trim() || busy} className="w-full font-semibold">
          Create and design
        </Button>
      </form>
    </Modal>
  );
}

/** "New event" button with its dialog. */
export default function NewEventButton({ big }: { big?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button shape="pill" size={big ? "lg" : "md"} className="font-semibold" onClick={() => setOpen(true)}>
        <Plus size={16} className="mr-1.5" /> New event
      </Button>
      <NewEventDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
