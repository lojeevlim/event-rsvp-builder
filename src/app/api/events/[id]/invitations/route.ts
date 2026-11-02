import { z } from "zod";
import { eventGuard, readJson } from "@/lib/api";
import { invitesSentToday, listEmailLog } from "@/lib/data";
import { appOrigin, eventLink } from "@/lib/event-url";
import { sendEventEmail } from "@/lib/send-event-email";
import { emailProviderInfo } from "@/lib/mailer";

const PER_REQUEST = 25;
const PER_DAY = Number(process.env.MAX_INVITES_PER_DAY ?? 200);

const body = z.object({ emails: z.array(z.email().max(120)).min(1).max(PER_REQUEST) });

export async function GET(_req: Request, ctx: RouteContext<"/api/events/[id]/invitations">) {
  const g = await eventGuard((await ctx.params).id);
  if ("response" in g) return g.response;
  const info = emailProviderInfo();
  return Response.json({ log: await listEmailLog(g.event.id), sentToday: await invitesSentToday(g.event.id), perDay: PER_DAY, provider: info.label, providerWarning: info.warning ?? null });
}

/** Emails the event's public link to the people the host lists. Capped per request and per day so it cannot be used to spam. */
export async function POST(req: Request, ctx: RouteContext<"/api/events/[id]/invitations">) {
  const g = await eventGuard((await ctx.params).id, { write: true });
  if ("response" in g) return g.response;
  if (!g.event.published) return Response.json({ error: "Publish the event first: the link would not open." }, { status: 400 });
  const parsed = body.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: `Enter between 1 and ${PER_REQUEST} valid email addresses.` }, { status: 400 });

  const emails = [...new Set(parsed.data.emails.map((e) => e.toLowerCase()))];
  const left = PER_DAY - (await invitesSentToday(g.event.id));
  if (emails.length > left) return Response.json({ error: left > 0 ? `Only ${left} more invitations can be sent today.` : "Today's invitation limit is reached." }, { status: 429 });

  const link = eventLink(await appOrigin(), g.event.slug);
  const results: { email: string; ok: boolean; error?: string }[] = [];
  for (const to of emails) {
    const guest = to.split("@")[0];
    const r = await sendEventEmail({ event: g.event, kind: "invitation", to, guest, link, replyTo: g.user.email });
    results.push({ email: to, ok: r.ok, error: r.ok ? undefined : r.error });
  }
  return Response.json({ results, sent: results.filter((r) => r.ok).length });
}
