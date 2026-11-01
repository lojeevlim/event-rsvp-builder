import type { Metadata } from "next";
import SuperTables from "@/components/SuperTables";
import { Stat } from "@/components/ui";
import { requireSuperAdmin } from "@/lib/auth";
import { listAllEvents, listUsersWithStats, platformStats } from "@/lib/data";

// These pages read the signed-in user at request time, so they can't be prerendered into the static shell: let navigation wait here (a loading screen shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Super admin", robots: { index: false, follow: false } };

export default async function SuperPage() {
  const me = await requireSuperAdmin();
  const [stats, users, events] = await Promise.all([platformStats(), listUsersWithStats(), listAllEvents()]);
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Super admin</h1>
        <p className="text-sm text-soft">Everyone who has registered, every event, and the totals across the platform.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Users" value={stats.users} icon="users" change={`${stats.activeUsers} active · ${stats.disabledUsers} disabled`} countUp />
        <Stat label="Events" value={stats.events} icon="calendar-days" change={`${stats.publishedEvents} live`} countUp />
        <Stat label="Replies" value={stats.replies} icon="inbox" countUp />
        <Stat label="Can attend" value={stats.attending} icon="circle-check" color="emerald" countUp />
        <Stat label="Can't attend" value={stats.notAttending} icon="x" color="rose" countUp />
        <Stat label="People coming" value={stats.people} icon="user" countUp />
      </div>
      <SuperTables meId={me.id} users={users} events={events} />
    </div>
  );
}
