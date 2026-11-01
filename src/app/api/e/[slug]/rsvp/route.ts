import { z } from "zod";
import { createRsvp, emailExists, markCardSent } from "@/lib/data";
import { getCachedPublicEvent } from "@/lib/public-event";
import { appOrigin, eventLink } from "@/lib/event-url";
import { sendEventEmail } from "@/lib/send-event-email";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().max(120).transform((e) => e.toLowerCase()),
  attending: z.boolean(),
  guests: z.number().int().min(1).max(10).default(1),
  message: z.string().max(500).optional(),
  website: z.string().optional(), // honeypot
});

/** A guest's reply to a public event page. */
export async function POST(req: Request, ctx: RouteContext<"/api/e/[slug]/rsvp">) {
  const { slug } = await ctx.params;
  const found = await getCachedPublicEvent(slug);
  if (!found) return Response.json({ error: "This event is not available." }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check the form." }, { status: 400 });
  const { website, ...data } = parsed.data;
  if (website) return Response.json({ ok: true }); // bot: pretend success

  try {
    if (await emailExists(found.event.id, data.email)) return Response.json({ error: "This email has already RSVP'd." }, { status: 409 });
    const row = await createRsvp(found.event.id, data);
    if (!row) return Response.json({ error: "This email has already RSVP'd." }, { status: 409 });
    if (data.attending) {
      const link = eventLink(await appOrigin(), slug);
      const sent = await sendEventEmail({ event: found.event, kind: "confirmation", to: data.email, guest: data.name, guests: data.guests, link, replyTo: found.hostEmail });
      if (sent.ok) await markCardSent(row.id);
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("RSVP failed", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
