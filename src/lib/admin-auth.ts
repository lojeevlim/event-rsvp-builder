import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "admin_session";

function token(password: string) {
  return createHmac("sha256", password).update("birthday-rsvp-admin").digest("hex");
}

function safeEqual(a: string, b: string) {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export const adminEnabled = () => !!process.env.ADMIN_PASSWORD;

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  return !!pw && safeEqual(input, pw);
}

export function sessionValue() {
  return token(process.env.ADMIN_PASSWORD!);
}

export async function isAdmin() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  return !!v && safeEqual(v, token(pw));
}
