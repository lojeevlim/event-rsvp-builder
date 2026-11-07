"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Alert, AlertDialog, Badge, Button, Switch } from "@/components/ui";
import type { AdminEventSummary, UserWithStats } from "@/lib/data";

const date = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

/** The super admin's two tables: all registered users (enable / disable, role) and all events (show / hide, delete). */
export default function SuperTables({ meId, users, events }: { meId: string; users: UserWithStats[]; events: AdminEventSummary[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [del, setDel] = useState<AdminEventSummary | null>(null);
  const [q, setQ] = useState("");

  async function call(key: string, url: string, init: RequestInit) {
    setBusy(key);
    setError("");
    const res = await fetch(url, init);
    if (!res.ok) setError((await res.json().catch(() => null))?.error ?? "That did not work.");
    setBusy("");
    router.refresh();
  }
  const patch = (key: string, url: string, body: object) => call(key, url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  const term = q.trim().toLowerCase();
  const shownUsers = term ? users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(term)) : users;

  return (
    <div className="grid gap-10">
      {error && <Alert variant="error" closable onClose={() => setError("")}>{error}</Alert>}

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">Registered users <span className="font-normal text-soft">({users.length})</span></h2>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" aria-label="Search users" className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-accent-500 sm:w-72" />
        </div>
        <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-soft">
              <tr>
                <th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3 text-right">Events</th><th className="px-4 py-3 text-right">Replies</th>
                <th className="px-4 py-3">Joined</th><th className="px-4 py-3">Last seen</th><th className="px-4 py-3">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {shownUsers.map((u) => {
                const me = u.id === meId;
                return (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3"><p className="font-semibold">{u.name || "—"}</p><p className="text-xs text-soft">{u.email}</p></td>
                    <td className="px-4 py-3">
                      <Badge variant="soft" size="xs" color={u.role === "super_admin" ? "violet" : "slate"}>{u.role === "super_admin" ? "Super admin" : "Host"}</Badge>
                      {!me && (
                        <button type="button" disabled={!!busy} onClick={() => patch(`role-${u.id}`, `/api/super/users/${u.id}`, { role: u.role === "super_admin" ? "host" : "super_admin" })} className="ml-2 text-xs text-soft underline hover:text-fg disabled:opacity-40">
                          {u.role === "super_admin" ? "Make host" : "Make super admin"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{u.events}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{u.replies}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{date(u.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{date(u.lastSeenAt)}</td>
                    <td className="px-4 py-3">
                      <Switch aria-label={`${u.active ? "Disable" : "Enable"} ${u.email}`} checked={u.active} disabled={me || busy === `active-${u.id}`} onChange={(e) => patch(`active-${u.id}`, `/api/super/users/${u.id}`, { active: e.target.checked })} />
                    </td>
                  </tr>
                );
              })}
              {shownUsers.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-soft">No users match.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-soft">Disabling a user signs them out of the app and hides all their event pages. Enabling brings everything back.</p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-extrabold">All events <span className="font-normal text-soft">({events.length})</span></h2>
        <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-soft">
              <tr>
                <th className="px-4 py-3">Event</th><th className="px-4 py-3">Host</th><th className="px-4 py-3 text-right">Can attend</th><th className="px-4 py-3 text-right">Can&apos;t</th>
                <th className="px-4 py-3 text-right">People</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Visible</th><th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold">
                    <Link href={`/event/${e.id}`} className="hover:text-accent-600">{e.title}</Link>
                    {!e.ownerActive && <Badge variant="soft" size="xs" color="rose" className="ml-2">host disabled</Badge>}
                  </td>
                  <td className="px-4 py-3"><p>{e.ownerName || "—"}</p><p className="text-xs text-soft">{e.ownerEmail}</p></td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.attending}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.notAttending}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{e.people}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{date(e.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Switch aria-label={`${e.published ? "Hide" : "Show"} ${e.title}`} checked={e.published} disabled={busy === `pub-${e.id}`} onChange={(x) => patch(`pub-${e.id}`, `/api/events/${e.id}`, { published: x.target.checked })} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/e/${e.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Open ${e.title}`} className="text-soft hover:text-fg"><ExternalLink size={15} /></a>
                      <Button variant="destructive-outline" size="sm" onClick={() => setDel(e)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-soft">No events yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {del && (
        <AlertDialog
          open
          onClose={() => setDel(null)}
          variant="destructive"
          title={`Delete “${del.title}”?`}
          description={`This removes the event and its ${del.replies} repl${del.replies === 1 ? "y" : "ies"} for good. The host (${del.ownerEmail}) will lose it.`}
          confirmLabel="Delete event"
          onConfirm={() => {
            const id = del.id;
            setDel(null);
            void call(`del-${id}`, `/api/events/${id}`, { method: "DELETE" });
          }}
        />
      )}
    </div>
  );
}
