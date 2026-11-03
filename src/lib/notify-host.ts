import { emailsSentLast24h, logEmail, type EventRow } from "./data";
import { DEFAULT_TEMPLATES, emailShell } from "./email-template";
import { emailDailyLimit, sendMail } from "./mailer";
import { APP_NAME } from "./brand";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Tells the event's host (at their own address) that a guest replied. Never throws: the reply is already saved. */
export async function notifyHostOfRsvp(opts: { event: EventRow; hostEmail: string; name: string; email: string; attending: boolean; guests: number; message?: string; link: string }) {
  const { event, hostEmail, name, email, attending, guests, message, link } = opts;
  if (!event.notifyHost) return;
  try {
    const cap = emailDailyLimit();
    if (cap > 0 && (await emailsSentLast24h()) >= cap) throw new Error("The site has reached its daily email limit.");
    const status = attending ? `is coming${guests > 1 ? ` (${guests} people)` : ""}` : "can't make it";
    const row = (k: string, v: string) => `<tr><td style="padding:10px 16px 10px 0;font-size:13px;color:#8a8a93;border-bottom:1px solid #f0f0f2;white-space:nowrap">${k}</td><td style="padding:10px 0;font-size:15px;font-weight:600;color:#18181b;border-bottom:1px solid #f0f0f2">${v}</td></tr>`;
    const d = DEFAULT_TEMPLATES.confirmation;
    const safeLink = /^https?:\/\//i.test(link) ? link : "";
    const bodyHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${row("Name", esc(name))}${row("Email", esc(email))}${row("Attending", attending ? "Yes" : "No")}${attending ? row("Guests", String(guests)) : ""}${message?.trim() ? row("Note", esc(message.trim())) : ""}</table>${
      safeLink ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px auto 4px"><tr><td style="border-radius:999px;background:${d.accent}"><a href="${esc(safeLink)}" style="display:inline-block;padding:15px 34px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px">View all replies</a></td></tr></table>` : ""
    }`;
    const html = emailShell({ accent: d.accent, background: d.background, icon: "reply", kicker: "New reply", title: esc(`${name} ${status}`), subtitle: esc(event.title), bodyHtml, footer: "You get this because reply notifications are on for this event.", preheader: esc(`${name} ${status}`) });
    await sendMail({ to: event.notifyEmail || hostEmail, subject: `${name} ${attending ? "is coming to" : "can't make it to"} ${event.title}`, html, replyTo: email, fromName: APP_NAME });
    await logEmail(event.id, "notification", event.notifyEmail || hostEmail, "sent");
  } catch (err) {
    await logEmail(event.id, "notification", event.notifyEmail || hostEmail, "failed", err instanceof Error ? err.message : "Could not send.").catch(() => {});
  }
}
