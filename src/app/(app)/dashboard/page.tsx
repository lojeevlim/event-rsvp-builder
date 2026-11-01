import type { Metadata } from "next";
import { CalendarHeart } from "lucide-react";
import EventsGrid from "@/components/EventsGrid";
import NewEventButton from "@/components/NewEventButton";
import { requireUser } from "@/lib/auth";
import { listEventsForOwner } from "@/lib/data";

// These pages read the signed-in user at request time, so they can't be prerendered into the static shell: let navigation wait here (a loading screen shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "My events" };

export default async function DashboardPage() {
  const user = await requireUser();
  const events = await listEventsForOwner(user.id);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">My events</h1>
        <p className="text-sm text-soft">Hi {user.name || user.email}. Each event has its own design, link and guest replies.</p>
      </div>

      {events.length === 0 ? (
        <div className="grid justify-items-center gap-4 rounded-3xl border-2 border-dashed border-border bg-surface px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600"><CalendarHeart size={26} /></span>
          <div>
            <h2 className="text-lg font-extrabold">Create your first event</h2>
            <p className="mt-1 text-sm text-soft">Pick a type, design the page, then share the link.</p>
          </div>
          <NewEventButton big />
        </div>
      ) : (
        <EventsGrid events={events.map(({ id, slug, title, published, createdAt, replies, attending, notAttending, people }) => ({ id, slug, title, published, createdAt, replies, attending, notAttending, people }))} />
      )}
    </div>
  );
}
