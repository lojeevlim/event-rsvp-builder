import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, PencilRuler } from "lucide-react";
import BackLink from "@/components/BackLink";
import EventTabs from "@/components/EventTabs";
import { linkButton } from "@/components/link-button";
import { EventHeaderSkeleton } from "@/components/skeletons";
import { requireUser } from "@/lib/auth";
import { getEventSummary } from "@/lib/data";

// These pages read the signed-in user at request time, so they can't be prerendered into the static shell: let navigation wait here (a loading screen shows meanwhile).
export const instant = false;

/** Title, buttons and tabs. It loads on its own (with a placeholder of the same size) so the page body can show its loading screen at once. */
async function EventHeader({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const event = await getEventSummary(id);
  // hosts only open their own events; a super admin can look at any
  if (!event || (event.ownerId !== user.id && user.role !== "super_admin")) notFound();
  const mine = event.ownerId === user.id;

  return (
    <div className="grid gap-6">
      <div>
        <BackLink href={mine ? "/dashboard" : "/super"}>{mine ? "My events" : "Super admin"}</BackLink>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="min-w-0 truncate text-2xl font-extrabold tracking-tight sm:text-3xl">{event.title}</h1>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${event.published ? "bg-emerald-100 text-emerald-700" : "bg-surface-muted text-soft"}`}>{event.published ? "Live" : "Hidden"}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {mine && <Link href={`/editor/${event.id}`} className={linkButton("primary", "sm")}><PencilRuler size={14} /> Edit design</Link>}
            <a href={`/e/${event.slug}`} target="_blank" rel="noopener noreferrer" className={linkButton("outline", "sm")}><ExternalLink size={14} /> Preview</a>
          </div>
        </div>
      </div>
      <EventTabs base={`/event/${event.id}`} showEmails={mine} />
    </div>
  );
}

export default function EventLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  return (
    <div className="grid gap-6">
      <Suspense fallback={<EventHeaderSkeleton />}>
        <EventHeader params={params} />
      </Suspense>
      {children}
    </div>
  );
}
