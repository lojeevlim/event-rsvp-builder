import { randomUUID } from "crypto";
import { apiUser } from "@/lib/auth";
import { ICONIFY, parseIllustrationId } from "@/lib/illustrations";
import { parsePackId } from "@/lib/illustration-packs";
import { putImage, userFolder } from "@/lib/storage";

const MAX_SVG_BYTES = 600 * 1024;
// an SVG may start with an XML line, comments and a doctype before the <svg> tag
const SVG_START = /^\s*(<\?xml[^>]*\?>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>[]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/;

// pictures already fetched (the free library limits how often one server may ask)
const cache = new Map<string, Buffer>();

/** The SVG at a web address; on a rate limit it waits a moment and tries once more. */
async function fetchSvg(url: string): Promise<{ svg: Buffer } | { status: number; retryAfter?: number }> {
  const hit = cache.get(url);
  if (hit) return { svg: hit };
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const svg = Buffer.from(await res.arrayBuffer());
      if (cache.size > 200) cache.delete(cache.keys().next().value!);
      cache.set(url, svg);
      return { svg };
    }
    const retryAfter = Number(res.headers.get("retry-after")) || undefined;
    if (res.status === 429 && attempt === 0 && retryAfter && retryAfter <= 3) {
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }
    return { status: res.status, retryAfter };
  }
  return { status: 503 };
}

/** Copies one free illustration into the user's own storage (as an SVG), so the page never depends on the library being online. Only allow-listed sets are fetched, and anything that could run code is refused. */
export async function POST(req: Request) {
  const a = await apiUser();
  if ("response" in a) return a.response;
  const body = (await req.json().catch(() => null)) as { id?: unknown } | null;
  const pack = parsePackId(body?.id);
  const ill = pack ? null : parseIllustrationId(body?.id);
  if (!pack && !ill) return Response.json({ error: "Unknown illustration." }, { status: 400 });

  let svg: Buffer;
  try {
    // a bundled pack picture is read from our own /illustrations folder; the others come from the allow-listed open sets
    const from = pack ? new URL(`/illustrations/${pack.pack}/${pack.file}.svg`, req.url).toString() : `${ICONIFY}/${ill!.prefix}/${ill!.name}.svg?width=512&height=512`;
    const got = await fetchSvg(from);
    if ("status" in got) {
      if (got.status === 404) return Response.json({ error: "That illustration was not found." }, { status: 404 });
      // 429: the free library is limiting how fast we ask; anything else: it is down
      const wait = got.retryAfter ? ` Try again in about ${got.retryAfter} seconds.` : " Try again in a moment.";
      return Response.json({ error: got.status === 429 ? `The illustration library is busy right now.${wait}` : "The illustration library is not reachable right now." }, { status: 503 });
    }
    svg = got.svg;
    if (svg.byteLength > MAX_SVG_BYTES) return Response.json({ error: "That illustration is too large." }, { status: 400 });
    const text = svg.toString("utf8");
    if (!SVG_START.test(text) || /<script|<foreignObject|<iframe|<!ENTITY|javascript:|\son\w+\s*=/i.test(text)) {
      return Response.json({ error: "That illustration can't be imported." }, { status: 400 });
    }
  } catch (err) {
    console.error("Illustration import failed", err);
    return Response.json({ error: "Could not import that illustration. Try again." }, { status: 502 });
  }

  const name = `${userFolder(a.user)}/${randomUUID()}.svg`;
  try {
    await putImage(name, svg, "image/svg+xml");
  } catch (err) {
    console.error("Saving illustration failed", err);
    return Response.json({ error: "Could not save the image. Try again." }, { status: 500 });
  }
  return Response.json({ url: `/api/img/${name}` });
}
