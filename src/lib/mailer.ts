import nodemailer from "nodemailer";
import { APP_NAME } from "./brand";

type Env = Record<string, string | undefined>;

const gmailReady = (env: Env) => !!env.GMAIL_USER && !!env.GMAIL_APP_PASSWORD;

/** What the Emails screen tells the host about the sending service. */
export function emailProviderInfo(env: Env = process.env): { label: string; warning?: string } {
  if (gmailReady(env)) return { label: "Gmail" };
  return { label: "Gmail", warning: "Gmail is not set up yet (GMAIL_USER and GMAIL_APP_PASSWORD), so no emails can be sent." };
}

/** Emails the whole site may send in 24 hours (0 = no cap of our own). Gmail blocks accounts that go over about 500 a day, so it is held below that. */
export function emailDailyLimit(env: Env = process.env): number {
  const set = Number(env.EMAIL_DAILY_LIMIT);
  if (Number.isFinite(set) && set >= 0 && env.EMAIL_DAILY_LIMIT !== undefined && env.EMAIL_DAILY_LIMIT !== "") return Math.floor(set);
  return 400;
}

/** Turns Gmail's error into something a host can act on. */
export function explainGmailError(err: unknown): string {
  const e = err as { code?: string; responseCode?: number; message?: string };
  const m = String(e?.message ?? "").toLowerCase();
  if (e?.code === "EAUTH" || m.includes("invalid login") || m.includes("username and password not accepted")) return "Gmail rejected the login. GMAIL_APP_PASSWORD must be a 16-character app password from your Google account (not your normal password), and 2-Step Verification must be on.";
  if (m.includes("daily user sending") || m.includes("5.4.5") || e?.responseCode === 550) return "Gmail's daily sending limit was reached. Emails will work again within 24 hours.";
  if (m.includes("invalid recipient") || m.includes("no such user") || e?.responseCode === 553) return "Gmail says that email address doesn't exist.";
  return `Gmail could not send the email: ${String(e?.message ?? "unknown error").slice(0, 200)}`;
}

export type Mail = { to: string; subject: string; html: string; /** where guest replies go (the host) */ replyTo?: string; fromName?: string };

/** Sends through Gmail. Throws, with a readable message, when the mail could not be sent. */
export async function sendMail({ to, subject, html, replyTo, fromName }: Mail) {
  if (!gmailReady(process.env)) throw new Error("Gmail is not set up. Set GMAIL_USER and GMAIL_APP_PASSWORD.");
  const name = (fromName ?? APP_NAME).replace(/[<>"\r\n]/g, "").slice(0, 60) || APP_NAME;
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
  try {
    await transporter.sendMail({ from: `"${name}" <${process.env.GMAIL_USER}>`, to, subject, html, ...(replyTo ? { replyTo } : {}) });
  } catch (err) {
    throw new Error(explainGmailError(err));
  }
}
