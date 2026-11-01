import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { createEvent, listEventsForOwner } from "@/lib/data";
import { applyPreset } from "@/lib/presets";
import { readJson } from "@/lib/api";
import { defaultSettings, EVENT_TYPES } from "@/lib/settings-shared";

const MAX_EVENTS = Number(process.env.MAX_EVENTS_PER_HOST ?? 20);

const body = z.object({ title: z.string().trim().min(1).max(60), type: z.enum(EVENT_TYPES).default("general") });

export async function GET() {
  const a = await apiUser();
  if ("response" in a) return a.response;
  return Response.json(await listEventsForOwner(a.user.id));
}

export async function POST(req: Request) {
  const a = await apiUser();
  if ("response" in a) return a.response;
  const parsed = body.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Give the event a name (up to 60 characters)." }, { status: 400 });
  if ((await listEventsForOwner(a.user.id)).length >= MAX_EVENTS) return Response.json({ error: `You can have up to ${MAX_EVENTS} events.` }, { status: 400 });

  const { title, type } = parsed.data;
  const settings = { ...applyPreset(defaultSettings(), type), name: title, eventType: type };
  const event = await createEvent(a.user.id, title, settings);
  return Response.json(event, { status: 201 });
}
