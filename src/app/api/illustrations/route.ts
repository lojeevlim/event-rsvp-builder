import { apiUser } from "@/lib/auth";
import { ICONIFY, ILLUSTRATION_PREFIXES } from "@/lib/illustrations";

/** Search the free illustration sets. Returns ids like "noto:racing-car"; the pictures themselves are only copied in when one is chosen (see ./import). */
export async function GET(req: Request) {
  const a = await apiUser();
  if ("response" in a) return a.response;
  const params = new URL(req.url).searchParams;
  const q = params.get("q")?.trim().slice(0, 40) ?? "";
  if (!q) return Response.json({ icons: [] });
  // one set, or all of them
  const set = params.get("set") ?? "all";
  const prefixes = ILLUSTRATION_PREFIXES.includes(set) ? [set] : ILLUSTRATION_PREFIXES;
  try {
    const res = await fetch(`${ICONIFY}/search?query=${encodeURIComponent(q)}&prefixes=${prefixes.join(",")}&limit=96`, { signal: AbortSignal.timeout(8000), next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Iconify ${res.status}`);
    const data = (await res.json()) as { icons?: string[] };
    // skin-tone variants only crowd the results
    const icons = (data.icons ?? []).filter((id) => !id.includes("skin-tone")).slice(0, 60);
    return Response.json({ icons });
  } catch (err) {
    console.error("Illustration search failed", err);
    return Response.json({ error: "The illustration library is not reachable right now." }, { status: 502 });
  }
}
