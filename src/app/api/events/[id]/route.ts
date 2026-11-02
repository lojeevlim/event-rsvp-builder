import { z } from "zod";
import { deleteEvent, getEventSettings, setEventNotifyHost, setEventPublished } from "@/lib/data";
import { eventGuard, readJson, refreshEventPage } from "@/lib/api";
import { imageUrls } from "@/lib/settings-shared";
import { deleteImage, imageKey } from "@/lib/storage";

export async function PATCH(req: Request, ctx: RouteContext<"/api/events/[id]">) {
  const g = await eventGuard((await ctx.params).id);
  if ("response" in g) return g.response;
  const parsed = z.object({ published: z.boolean().optional(), notifyHost: z.boolean().optional() }).safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  let event = g.event;
  if (parsed.data.published !== undefined) event = (await setEventPublished(g.event.id, parsed.data.published)) ?? event;
  if (parsed.data.notifyHost !== undefined) event = (await setEventNotifyHost(g.event.id, parsed.data.notifyHost)) ?? event;
  refreshEventPage(g.event.slug);
  return Response.json(event);
}

/** The owner or a super admin can delete an event; its replies and emails go with it. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/events/[id]">) {
  const g = await eventGuard((await ctx.params).id);
  if ("response" in g) return g.response;
  const settings = await getEventSettings(g.event.id);
  await deleteEvent(g.event.id);
  refreshEventPage(g.event.slug);
  if (settings) for (const url of imageUrls(settings)) await deleteImage(imageKey(url));
  return Response.json({ ok: true });
}
