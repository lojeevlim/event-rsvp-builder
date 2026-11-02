import { emailsSentLast24h, getEventSettings, getTemplate, logEmail, type EventRow } from "./data";
import { renderEmailHtml, renderSubject, type EmailKind } from "./email-template";
import { emailDailyLimit, sendMail } from "./mailer";

/** Renders the event's template for one guest and sends it; the result is written to the email log. */
export async function sendEventEmail(opts: { event: EventRow; kind: EmailKind; to: string; guest: string; guests?: number; link: string; replyTo?: string; log?: boolean }) {
  const { event, kind, to, guest, link, replyTo } = opts;
  const settings = await getEventSettings(event.id);
  const eventName = settings?.name.trim() || event.title;
  const template = await getTemplate(event.id, kind);
  const vars = { guest, event: eventName, link, guests: opts.guests ?? 1 };
  try {
    // hold the whole site under its sending limit, rather than letting the email service block the account
    const cap = emailDailyLimit();
    if (cap > 0 && (await emailsSentLast24h()) >= cap) {
      throw new Error(`The site has reached its daily limit of ${cap} emails. Emails will send again within 24 hours, or move to a bigger email plan.`);
    }
    await sendMail({ to, subject: renderSubject(template, vars), html: renderEmailHtml(template, vars, kind), replyTo, fromName: eventName });
    if (opts.log !== false) await logEmail(event.id, kind, to, "sent");
    return { ok: true as const };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Could not send.";
    if (opts.log !== false) await logEmail(event.id, kind, to, "failed", error).catch(() => {});
    return { ok: false as const, error };
  }
}
