"use client";

import { useEffect, useState } from "react";
import type { RsvpRow } from "@/lib/data";
import { Alert, Badge, EmptyState, Stat, Table } from "@/components/ui";
import { RsvpListSkeleton } from "@/components/skeletons";

export default function RsvpList({ eventId }: { eventId: string }) {
  const [rows, setRows] = useState<RsvpRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/events/${eventId}/rsvps`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setRows(d);
      })
      .catch((e) => setError(e.message || "Could not load RSVPs."));
  }, [eventId]);

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!rows) return <RsvpListSkeleton />;

  const yes = rows.filter((r) => r.attending);
  const seats = yes.reduce((n, r) => n + r.guests, 0);

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Replies" value={rows.length} icon="users" countUp />
        <Stat label="Can attend" value={yes.length} icon="circle-check" color="emerald" countUp />
        <Stat label="Can't attend" value={rows.length - yes.length} icon="x" color="rose" countUp />
        <Stat label="People coming" value={seats} icon="user" countUp />
      </div>
      {rows.length === 0 ? (
        <EmptyState icon="inbox" title="No RSVPs yet">Replies will appear here as guests submit the form.</EmptyState>
      ) : (
        <Table
          rowKey="id"
          striped
          hoverable
          data={rows}
          columns={[
            { key: "name", header: "Name", render: (r: RsvpRow) => <b>{r.name}</b> },
            { key: "email", header: "Email" },
            {
              key: "attending",
              header: "Status",
              render: (r: RsvpRow) => (
                <Badge variant="soft" color={r.attending ? "emerald" : "slate"}>{r.attending ? "Can attend" : "Can't attend"}</Badge>
              ),
            },
            { key: "guests", header: "Guests", render: (r: RsvpRow) => (r.attending ? r.guests : "–") },
            { key: "message", header: "Message" },
            { key: "createdAt", header: "Date", render: (r: RsvpRow) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "") },
          ]}
        />
      )}
    </div>
  );
}
