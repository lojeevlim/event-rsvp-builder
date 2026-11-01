import { headers } from "next/headers";

/** The site's public address, used in event links and emails: NEXT_PUBLIC_APP_URL, else the address of the current request. */
export async function appOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export const eventLink = (origin: string, slug: string) => `${origin}/e/${slug}`;
