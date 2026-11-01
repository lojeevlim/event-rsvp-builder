"use client";

import { useEffect, useState } from "react";
import type { RsvpRow } from "@/lib/notion";
import { Alert, Badge, EmptyState, Spinner, Stat, Table } from "@/components/ui";

export default function RsvpList() {
  const [rows, setRows] = useState<RsvpRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/rsvps")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setRows(d);
      })
      .catch((e) => setError(e.message || "Could not load RSVPs."));
  }, []);

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!rows) return <div className="flex justify-center p-10"><Spinner /></div>;

  const yes = rows.filter((r) => r.attending);
  const seats = yes.reduce((n, r) => n + r.guests, 0);

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Replies" value={rows.length} icon="users" countUp />
        <Stat label="Attending" value={yes.length} icon="circle-check" color="emerald" countUp />
        <Stat label="Total guests" value={seats} icon="user" countUp />
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
                <Badge variant="soft" color={r.attending ? "emerald" : "slate"}>{r.attending ? "Attending" : "Declined"}</Badge>
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
