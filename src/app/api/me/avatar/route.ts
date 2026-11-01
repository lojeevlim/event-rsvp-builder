import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { setUserImage } from "@/lib/data";
import { readJson } from "@/lib/api";

const body = z.object({ imageUrl: z.union([z.literal(""), z.url().max(500).refine((u) => u.startsWith("https://"), "https only")]) });

/** The signed-in user's profile photo changed in Clerk: remember its address so the account menu can show it from the first paint. */
export async function PATCH(req: Request) {
  const a = await apiUser();
  if ("response" in a) return a.response;
  const parsed = body.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  await setUserImage(a.user.id, parsed.data.imageUrl);
  return Response.json({ ok: true });
}
