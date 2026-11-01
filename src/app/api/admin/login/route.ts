import { cookies } from "next/headers";
import { adminEnabled, checkPassword, COOKIE, sessionValue } from "@/lib/admin-auth";

const attempts = new Map<string, { n: number; reset: number }>();

export async function POST(req: Request) {
  if (!adminEnabled()) return Response.json({ error: "Set ADMIN_PASSWORD in .env to enable the admin panel." }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && a.reset > now && a.n >= 5) return Response.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!checkPassword(typeof body?.password === "string" ? body.password : "")) {
    attempts.set(ip, a && a.reset > now ? { n: a.n + 1, reset: a.reset } : { n: 1, reset: now + 60_000 });
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }
  attempts.delete(ip);
  (await cookies()).set(COOKIE, sessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return Response.json({ ok: true });
}
