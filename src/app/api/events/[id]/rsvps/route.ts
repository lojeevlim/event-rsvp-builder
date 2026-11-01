import { listRsvps } from "@/lib/data";
import { eventGuard } from "@/lib/api";

export async function GET(_req: Request, ctx: RouteContext<"/api/events/[id]/rsvps">) {
  const g = await eventGuard((await ctx.params).id);
  if ("response" in g) return g.response;
  return Response.json(await listRsvps(g.event.id));
}
