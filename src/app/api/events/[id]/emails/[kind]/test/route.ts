import { eventGuard } from "@/lib/api";
import { appOrigin, eventLink } from "@/lib/event-url";
import { EMAIL_KINDS, type EmailKind } from "@/lib/email-template";
import { sendEventEmail } from "@/lib/send-event-email";

/** Sends the current template to the host's own address so they can see it in a real inbox. */
export async function POST(_req: Request, ctx: RouteContext<"/api/events/[id]/emails/[kind]/test">) {
  const { id, kind } = await ctx.params;
  const g = await eventGuard(id, { write: true });
  if ("response" in g) return g.response;
  if (!(EMAIL_KINDS as readonly string[]).includes(kind)) return Response.json({ error: "Unknown email." }, { status: 404 });
  const link = eventLink(await appOrigin(), g.event.slug);
  const r = await sendEventEmail({ event: g.event, kind: kind as EmailKind, to: g.user.email, guest: g.user.name || "there", guests: 2, link, log: false });
  return r.ok ? Response.json({ ok: true, to: g.user.email }) : Response.json({ error: r.error }, { status: 502 });
}
