import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventTheme from "@/components/EventTheme";
import { PublicEventSkeleton } from "@/components/skeletons";
import PageView from "@/components/PageView";
import { getCachedPublicEvent } from "@/lib/public-event";
import { applyName } from "@/lib/settings-shared";

// An invitation is for the people who got the link: keep it out of search results.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const found = await getCachedPublicEvent((await params).slug);
  if (!found) return { title: "Event not found", robots: { index: false } };
  const name = found.settings.name.trim() || found.event.title;
  return { title: `${name} — RSVP`, description: `You're invited: RSVP for ${name}`, robots: { index: false, follow: false } };
}

export default function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<PublicEventSkeleton />}>
      <PublicEvent params={params} />
    </Suspense>
  );
}

async function PublicEvent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getCachedPublicEvent(slug);
  if (!found) notFound();
  return (
    <EventTheme theme={found.settings.theme}>
      <PageView s={applyName(found.settings)} rsvpEndpoint={`/api/e/${slug}/rsvp`} />
    </EventTheme>
  );
}
