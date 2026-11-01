import type { Metadata } from "next";
import ProfileClerk from "@/components/ProfileClerk";
import { Stat } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { listEventsForOwner } from "@/lib/data";

// These pages read the signed-in user at request time, so they can't be prerendered into the static shell: let navigation wait here (a loading screen shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Profile" };

const dateFmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

export default async function ProfilePage() {
  const user = await requireUser();
  const events = await listEventsForOwner(user.id);
  const replies = events.reduce((n, e) => n + e.replies, 0);
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-600 text-2xl font-extrabold text-white">{(user.name || user.email)[0].toUpperCase()}</span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold tracking-tight">{user.name || user.email}</h1>
          <p className="truncate text-sm text-soft">{user.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Role" value={user.role === "super_admin" ? "Super admin" : "Host"} icon="shield-check" />
        <Stat label="Member since" value={dateFmt(user.createdAt)} icon="calendar" />
        <Stat label="Events" value={events.length} icon="calendar-days" countUp />
        <Stat label="Replies received" value={replies} icon="inbox" countUp />
      </div>
      <section className="grid gap-3">
        <h2 className="text-lg font-extrabold">Account settings</h2>
        <p className="text-sm text-soft">Change your name, photo, email, password and sign-in methods.</p>
        <ProfileClerk />
      </section>
    </div>
  );
}
