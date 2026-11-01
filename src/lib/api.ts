import { revalidateTag } from "next/cache";
import { apiUser } from "./auth";
import { getEvent, type AppUser, type EventRow } from "./data";

type Guard = { user: AppUser; event: EventRow } | { response: Response };

/** For routes under /api/events/[id]: the signed-in user and the event. Hosts only see their own events; a super admin can read any, but only the owner may change the design, emails or guests. */
export async function eventGuard(id: string, opts: { write?: boolean } = {}): Promise<Guard> {
  const a = await apiUser();
  if ("response" in a) return a;
  const { user } = a;
  const owned = await getEvent(id, user.id);
  if (owned) return { user, event: owned };
  if (user.role === "super_admin" && !opts.write) {
    const any = await getEvent(id);
    if (any) return { user, event: any };
  }
  return { response: Response.json({ error: "Event not found." }, { status: 404 }) };
}

/** Refresh the cached public page of an event. */
export const refreshEventPage = (slug: string) => revalidateTag(`event:${slug}`, { expire: 0 });

export const readJson = (req: Request) => req.json().catch(() => null);
