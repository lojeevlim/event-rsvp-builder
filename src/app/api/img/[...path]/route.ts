import { getImage } from "@/lib/storage";

const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml" };

export async function GET(_req: Request, ctx: RouteContext<"/api/img/[...path]">) {
  const name = (await ctx.params).path.join("/");
  const m = /^([\w-]+\/)?[\w-]+\.(png|jpg|webp|gif|svg)$/.exec(name);
  if (!m) return new Response("Not found", { status: 404 });
  const buf = await getImage(name);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), { headers: {
      "Content-Type": MIME[m[2]],
      "Cache-Control": "public, max-age=31536000, immutable",
      // an SVG can hold scripts: it may only be shown as a picture, never run if someone opens its address
      ...(m[2] === "svg" ? { "Content-Security-Policy": "sandbox; default-src 'none'; style-src 'unsafe-inline'", "X-Content-Type-Options": "nosniff" } : {}),
    },
  });
}
