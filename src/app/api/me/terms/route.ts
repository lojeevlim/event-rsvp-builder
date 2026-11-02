import { apiUser } from "@/lib/auth";
import { acceptTerms } from "@/lib/data";

/** The signed-in user agreed to the terms and conditions. */
export async function POST() {
  const a = await apiUser();
  if ("response" in a) return a.response;
  await acceptTerms(a.user.id);
  return Response.json({ ok: true });
}
