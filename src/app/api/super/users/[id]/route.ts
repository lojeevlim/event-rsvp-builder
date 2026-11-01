import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { getUserById, setUserActive, setUserRole, slugsForOwner } from "@/lib/data";
import { readJson, refreshEventPage } from "@/lib/api";

const body = z.object({ active: z.boolean().optional(), role: z.enum(["super_admin", "host"]).optional() });

/** A super admin enables or disables an account, or changes its role. Their own account is protected. */
export async function PATCH(req: Request, ctx: RouteContext<"/api/super/users/[id]">) {
  const a = await apiUser("super_admin");
  if ("response" in a) return a.response;
  const { id } = await ctx.params;
  const parsed = body.safeParse(await readJson(req));
  if (!parsed.success || (parsed.data.active === undefined && parsed.data.role === undefined)) return Response.json({ error: "Bad request." }, { status: 400 });
  const target = /^[0-9a-f-]{36}$/i.test(id) ? await getUserById(id) : null;
  if (!target) return Response.json({ error: "User not found." }, { status: 404 });
  if (target.id === a.user.id) return Response.json({ error: "You can't change your own account." }, { status: 400 });

  let user = target;
  if (parsed.data.role !== undefined) user = (await setUserRole(id, parsed.data.role)) ?? user;
  if (parsed.data.active !== undefined) {
    user = (await setUserActive(id, parsed.data.active)) ?? user;
    for (const slug of await slugsForOwner(id)) refreshEventPage(slug); // their public pages appear or disappear now
  }
  return Response.json(user);
}
