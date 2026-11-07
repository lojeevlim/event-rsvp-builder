import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EmailEditor from "@/components/EmailEditor";
import { requireUser } from "@/lib/auth";
import { getEvent, getEventSettings, getTemplate } from "@/lib/data";
import { appOrigin, eventLink } from "@/lib/event-url";

// These pages read the signed-in user at request time, so they can't be prerendered into the static shell: let navigation wait here (a loading screen shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Emails" };

export default async function EmailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const event = await getEvent(id, user.id); // only the owner edits the emails
  if (!event) notFound();
  const [invitation, confirmation, settings] = await Promise.all([getTemplate(id, "invitation"), getTemplate(id, "confirmation"), getEventSettings(id)]);
  return (
    <EmailEditor
      eventId={event.id}
      link={eventLink(await appOrigin(), event.slug)}
      eventName={settings?.name.trim() || event.title}
      published={event.published}
      initial={{ invitation, confirmation }}
    />
  );
}
