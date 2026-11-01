import { getTemplate, saveTemplate } from "@/lib/data";
import { eventGuard, readJson } from "@/lib/api";
import { EMAIL_KINDS, normalizeTemplate, type EmailKind } from "@/lib/email-template";

const kindOf = (k: string) => (EMAIL_KINDS as readonly string[]).includes(k) ? (k as EmailKind) : null;

export async function GET(_req: Request, ctx: RouteContext<"/api/events/[id]/emails/[kind]">) {
  const { id, kind: k } = await ctx.params;
  const kind = kindOf(k);
  const g = await eventGuard(id);
  if ("response" in g) return g.response;
  if (!kind) return Response.json({ error: "Unknown email." }, { status: 404 });
  return Response.json(await getTemplate(g.event.id, kind));
}

export async function PUT(req: Request, ctx: RouteContext<"/api/events/[id]/emails/[kind]">) {
  const { id, kind: k } = await ctx.params;
  const kind = kindOf(k);
  const g = await eventGuard(id, { write: true });
  if ("response" in g) return g.response;
  if (!kind) return Response.json({ error: "Unknown email." }, { status: 404 });
  const template = normalizeTemplate(kind, await readJson(req));
  if (!template.subject.trim()) return Response.json({ error: "The email needs a subject." }, { status: 400 });
  await saveTemplate(g.event.id, kind, template);
  return Response.json(template);
}
