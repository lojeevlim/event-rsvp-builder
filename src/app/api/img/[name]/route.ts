import { getImage } from "@/lib/storage";

const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif" };

export async function GET(_req: Request, ctx: RouteContext<"/api/img/[name]">) {
  const { name } = await ctx.params;
  const m = /^[\w-]+\.(png|jpg|webp|gif)$/.exec(name);
  if (!m) return new Response("Not found", { status: 404 });
  const buf = await getImage(name);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": MIME[m[1]], "Cache-Control": "public, max-age=31536000, immutable" } });
}
