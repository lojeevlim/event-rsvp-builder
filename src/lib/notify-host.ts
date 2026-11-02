import { emailsSentLast24h, logEmail, type EventRow } from "./data";
import { emailDailyLimit, sendMail } from "./mailer";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Tells the event's host (at their own address) that a guest replied. Never throws: the reply is already saved. */
export async function notifyHostOfRsvp(opts: { event: EventRow; hostEmail: string; name: string; email: string; attending: boolean; guests: number; message?: string; link: string }) {
  const { event, hostEmail, name, email, attending, guests, message, link } = opts;
  if (!event.notifyHost) return;
  try {
    const cap = emailDailyLimit();
    if (cap > 0 && (await emailsSentLast24h()) >= cap) throw new Error("The site has reached its daily email limit.");
    const status = attending ? `is coming${guests > 1 ? ` (${guests} people)` : ""}` : "can't make it";
    const row = (k: string, v: string) => `<tr><td style="padding:6px 12px 6px 0;color:#6b7280">${k}</td><td style="padding:6px 0">${v}</td></tr>`;
    const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:16px;color:#111827">
<h2 style="margin:0 0 4px">${esc(name)} ${status}</h2>
<p style="margin:0 0 14px;color:#6b7280">New reply to ${esc(event.title)}</p>
<table role="presentation" style="font-size:14px">${row("Name", esc(name))}${row("Email", esc(email))}${row("Attending", attending ? "Yes" : "No")}${attending ? row("Guests", String(guests)) : ""}${message?.trim() ? row("Note", esc(message.trim())) : ""}</table>
<p style="margin-top:18px"><a href="${esc(link)}" style="color:#111827">View all replies</a></p></div>`;
    await sendMail({ to: hostEmail, subject: `${name} ${attending ? "is coming to" : "can't make it to"} ${event.title}`, html, replyTo: email, fromName: "Event RSVP" });
    await logEmail(event.id, "notification", hostEmail, "sent");
  } catch (err) {
    await logEmail(event.id, "notification", hostEmail, "failed", err instanceof Error ? err.message : "Could not send.").catch(() => {});
  }
}
