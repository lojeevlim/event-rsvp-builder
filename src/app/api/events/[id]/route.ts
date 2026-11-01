import { z } from "zod";
import { deleteEvent, getEventSettings, setEventPublished } from "@/lib/data";
import { eventGuard, readJson, refreshEventPage } from "@/lib/api";
import { imageUrls } from "@/lib/settings-shared";
import { deleteImage } from "@/lib/storage";

export async function PATCH(req: Request, ctx: RouteContext<"/api/events/[id]">) {
  const g = await eventGuard((await ctx.params).id);
  if ("response" in g) return g.response;
  const parsed = z.object({ published: z.boolean() }).safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const event = await setEventPublished(g.event.id, parsed.data.published);
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
  if (settings) for (const url of imageUrls(settings)) await deleteImage(url.split("/").pop() ?? "");
  return Response.json({ ok: true });
}
