import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPanel from "@/components/admin/AdminPanel";
import { requireUser } from "@/lib/auth";
import { getEvent, getEventSettings } from "@/lib/data";

// These pages read the signed-in user at request time, so they can't be prerendered into the static shell: let navigation wait here (a loading screen shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Design editor", robots: { index: false, follow: false } };

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const event = await getEvent(id, user.id); // only the owner designs the page
  const settings = event ? await getEventSettings(event.id) : null;
  if (!event || !settings) notFound();
  return (
    <main className="h-screen overflow-hidden bg-cream">
      <AdminPanel initial={settings} eventId={event.id} eventTitle={event.title} account={{ email: user.email, name: user.name, imageUrl: user.imageUrl }} />
    </main>
  );
}
