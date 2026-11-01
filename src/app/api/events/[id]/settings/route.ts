import { getEventSettings, updateEventSettings } from "@/lib/data";
import { eventGuard, readJson, refreshEventPage } from "@/lib/api";
import { imageUrls, settingsSchema } from "@/lib/settings-shared";
import { deleteImage } from "@/lib/storage";

export async function GET(_req: Request, ctx: RouteContext<"/api/events/[id]/settings">) {
  const g = await eventGuard((await ctx.params).id);
  if ("response" in g) return g.response;
  return Response.json(await getEventSettings(g.event.id));
}

export async function PUT(req: Request, ctx: RouteContext<"/api/events/[id]/settings">) {
  const g = await eventGuard((await ctx.params).id, { write: true });
  if ("response" in g) return g.response;
  const parsed = settingsSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return Response.json({ error: `${issue.path.join(".")}: ${issue.message}` }, { status: 400 });
  }
  const before = await getEventSettings(g.event.id);
  await updateEventSettings(g.event.id, parsed.data);
  refreshEventPage(g.event.slug);

  // delete uploads that are no longer used anywhere on the page
  if (before) {
    const keep = new Set(imageUrls(parsed.data));
    for (const url of imageUrls(before)) if (!keep.has(url)) await deleteImage(url.split("/").pop() ?? "");
  }
  return Response.json(parsed.data);
}
