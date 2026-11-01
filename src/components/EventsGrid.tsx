"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GridView } from "@/components/ui";
import { NewEventDialog } from "@/components/NewEventButton";

export type EventCard = { id: string; slug: string; title: string; published: boolean; createdAt: string; replies: number; attending: number; notAttending: number; people: number };

/** The host's events as a lojee-ui GridView: search, sort, grid / list switch, a menu on each card and a "New event" button. */
export default function EventsGrid({ events }: { events: EventCard[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const byId = new Map(events.map((e) => [String(e.id), e]));

  return (
    <>
      <GridView
        transition="fade"
        searchPlaceholder="Search events"
        createLabel="New event"
        emptyMessage="No events match your search."
        minItemWidth={300}
        sortOptions={[
          { key: "title", label: "Name" },
          { key: "People", label: "People coming" },
          { key: "Created", label: "Newest" },
        ]}
        actions={[
          { label: "Open", value: "open", icon: "folder" },
          { label: "Edit design", value: "design", icon: "pencil" },
          { label: "Preview", value: "view", icon: "globe" },
        ]}
        items={events.map((e) => ({
          id: e.id,
          title: e.title,
          subtitle: `/e/${e.slug}`,
          tag: { label: e.published ? "Live" : "Hidden", color: e.published ? "emerald" : "slate" },
          stats: [
            { label: "Can attend", value: e.attending },
            { label: "Can't attend", value: e.notAttending },
          ],
          fields: [
            { label: "People", value: e.people },
            { label: "Replies", value: e.replies },
            { label: "Created", value: e.createdAt.slice(0, 10) },
          ],
        }))}
        onItemClick={(item) => router.push(`/dashboard/events/${item.id}`)}
        onAction={({ action, item }) => {
          const ev = byId.get(String(item.id));
          if (!ev) return;
          if (action.value === "open") router.push(`/dashboard/events/${ev.id}`);
          else if (action.value === "design") router.push(`/editor/${ev.id}`);
          else if (action.value === "view") window.open(`/e/${ev.slug}`, "_blank", "noopener,noreferrer");
        }}
        onCreate={() => setCreating(true)}
      />
      <NewEventDialog open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
