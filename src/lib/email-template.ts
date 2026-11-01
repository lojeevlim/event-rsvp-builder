/** The customisable email layout: shared by the editor's live preview and the server that sends the mail. */
export const EMAIL_KINDS = ["invitation", "confirmation"] as const;
export type EmailKind = (typeof EMAIL_KINDS)[number];

export type EmailTemplate = {
  subject: string;
  heading: string;
  body: string;
  buttonLabel: string;
  /** colour of the header band and the button */
  accent: string;
  background: string;
  footer: string;
};

export const EMAIL_KIND_LABEL: Record<EmailKind, string> = { invitation: "Invitation", confirmation: "RSVP confirmation" };
export const EMAIL_KIND_HINT: Record<EmailKind, string> = {
  invitation: "Sent when you email the event link to people you invite.",
  confirmation: "Sent to a guest right after they reply that they can attend.",
};

/** Words in {braces} are replaced for each guest. */
export const EMAIL_PLACEHOLDERS = ["{guest}", "{event}", "{link}", "{guests}"] as const;

export const DEFAULT_TEMPLATES: Record<EmailKind, EmailTemplate> = {
  invitation: {
    subject: "You're invited to {event}",
    heading: "You're invited!",
    body: "Hi {guest},\n\nWe'd love to have you at {event}. Tap the button below to see the details and let us know if you can make it.",
    buttonLabel: "See details & RSVP",
    accent: "#18181b",
    background: "#f4f4f5",
    footer: "Sent with Event RSVP",
  },
  confirmation: {
    subject: "Your RSVP is confirmed — {event}",
    heading: "RSVP confirmed",
    body: "Hi {guest},\n\nThanks for replying — we have you down for {guests} at {event}. We can't wait to see you there!",
    buttonLabel: "View the event page",
    accent: "#18181b",
    background: "#f4f4f5",
    footer: "Sent with Event RSVP",
  },
};

const COLOR = /^#[0-9a-fA-F]{6}$/;

/** Clean up stored or submitted data: every field is a string of sensible length, colours are hex. */
export function normalizeTemplate(kind: EmailKind, raw: unknown): EmailTemplate {
  const d = DEFAULT_TEMPLATES[kind];
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (k: keyof EmailTemplate, max: number) => (typeof r[k] === "string" ? (r[k] as string).slice(0, max) : d[k]);
  const color = (k: "accent" | "background") => (typeof r[k] === "string" && COLOR.test(r[k] as string) ? (r[k] as string) : d[k]);
  return {
    subject: str("subject", 200),
    heading: str("heading", 200),
    body: str("body", 3000),
    buttonLabel: str("buttonLabel", 60),
    accent: color("accent"),
    background: color("background"),
    footer: str("footer", 300),
  };
}

export type EmailVars = { guest: string; event: string; link: string; guests: number };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Replace {guest} {event} {link} {guests} in plain text. */
export const fill = (text: string, v: EmailVars) =>
  text.replace(/\{guest\}/gi, v.guest).replace(/\{event\}/gi, v.event).replace(/\{link\}/gi, v.link).replace(/\{guests\}/gi, `${v.guests} ${v.guests === 1 ? "guest" : "guests"}`);

export const renderSubject = (t: EmailTemplate, v: EmailVars) => fill(t.subject, v).replace(/[\r\n]+/g, " ").trim();

/** Dark text on light accents, white on dark ones. */
const onColor = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? "#18181b" : "#ffffff";
};

/** The full HTML email. Everything a guest or host typed is escaped; only the link is turned into a button. */
export function renderEmailHtml(t: EmailTemplate, v: EmailVars): string {
  const body = esc(fill(t.body, { ...v, link: "" }))
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#3f3f46">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  const safeLink = /^https?:\/\//i.test(v.link) ? v.link : "";
  const button =
    safeLink && t.buttonLabel
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto 4px"><tr><td style="border-radius:999px;background:${t.accent}"><a href="${esc(safeLink)}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:bold;color:${onColor(t.accent)};text-decoration:none">${esc(fill(t.buttonLabel, v))}</a></td></tr></table>`
      : "";
  return `<!doctype html><html><body style="margin:0;padding:24px;background:${t.background};font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e4e4e7">
<tr><td align="center" style="padding:30px 24px;background:${t.accent};color:${onColor(t.accent)}">
<div style="font-size:12px;letter-spacing:4px;opacity:.75">${esc(fill(t.heading, v)).toUpperCase()}</div>
<div style="font-size:26px;font-weight:bold;margin:10px 0 0">${esc(v.event)}</div></td></tr>
<tr><td style="padding:28px 28px 22px">${body}${button}</td></tr>
<tr><td align="center" style="padding:0 24px 24px;font-size:12px;color:#a1a1aa">${esc(fill(t.footer, v))}</td></tr>
</table></td></tr></table></body></html>`;
}
