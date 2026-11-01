import type { Metadata } from "next";
import CopyLink from "@/components/CopyLink";
import EventDangerZone from "@/components/EventDangerZone";
import RsvpList from "@/components/admin/RsvpList";
import { requireUser } from "@/lib/auth";
import { getEventSummary } from "@/lib/data";
import { appOrigin, eventLink } from "@/lib/event-url";
import { notFound } from "next/navigation";

// These pages read the signed-in user at request time, so they can't be prerendered into the static shell: let navigation wait here (a loading screen shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Event" };

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const event = await getEventSummary(id);
  if (!event || (event.ownerId !== user.id && user.role !== "super_admin")) notFound();
  const mine = event.ownerId === user.id;
  const link = eventLink(await appOrigin(), event.slug);

  return (
    <div className="grid gap-8">
      <section className="grid gap-3 rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-extrabold">Share this event</h2>
          <p className="text-sm text-soft">Anyone with this link can see the page and reply. Send it in a chat, or email it from the Emails tab.</p>
        </div>
        <CopyLink url={link} />
        {!event.published && <p className="rounded-2xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">This event is hidden, so the link shows “not available”. Publish it below.</p>}
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-extrabold">Replies</h2>
        <RsvpList eventId={event.id} />
      </section>

      {mine && <EventDangerZone eventId={event.id} title={event.title} published={event.published} />}
    </div>
  );
}
