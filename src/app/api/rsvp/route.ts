import { z } from "zod";
import { createRsvp, emailExists, markCardSent } from "@/lib/notion";
import { sendCard } from "@/lib/mailer";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().max(120).transform((e) => e.toLowerCase()),
  attending: z.boolean(),
  guests: z.number().int().min(1).max(10).default(1),
  message: z.string().max(500).optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check the form." }, { status: 400 });
  const { website, ...data } = parsed.data;
  if (website) return Response.json({ ok: true }); // bot: pretend success

  try {
    if (await emailExists(data.email)) {
      return Response.json({ error: "This email has already RSVP'd." }, { status: 409 });
    }
    const page = await createRsvp(data);
    if (data.attending) {
      await sendCard(data.email, data.name, data.guests);
      await markCardSent(page.id);
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("RSVP failed", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
