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

/** Table-based icons (email clients ignore SVG): a tick or an envelope in a white disc. */
const ICONS = { check: "&#10003;", mail: "&#9993;", reply: "&#9993;" } as const;

/** The shared premium layout for every email we send: coloured header with an icon disc, white card, soft footer. All inputs must already be escaped. */
export function emailShell(o: { accent: string; background: string; icon: keyof typeof ICONS; kicker: string; title: string; subtitle?: string; bodyHtml: string; footer: string; preheader?: string }): string {
  const on = onColor(o.accent);
  const soft = on === "#ffffff" ? "rgba(255,255,255,.78)" : "rgba(24,24,27,.65)";
  const disc = on === "#ffffff" ? "rgba(255,255,255,.18)" : "rgba(24,24,27,.10)";
  return `<!doctype html><html><body style="margin:0;padding:0;background:${o.background};font-family:-apple-system,'Segoe UI',Roboto,Arial,Helvetica,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${o.preheader ?? o.title}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${o.background}"><tr><td align="center" style="padding:28px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid rgba(0,0,0,.07);box-shadow:0 18px 40px -22px rgba(0,0,0,.35)">
<tr><td align="center" style="padding:38px 28px 34px;background:${o.accent};background-image:linear-gradient(160deg,rgba(255,255,255,.16),rgba(255,255,255,0) 55%);color:${on}">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" width="56" height="56" style="width:56px;height:56px;border-radius:28px;background:${disc};font-size:26px;line-height:56px;font-weight:bold;color:${on}">${ICONS[o.icon]}</td></tr></table>
<div style="margin-top:18px;font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:${soft}">${o.kicker}</div>
<div style="margin-top:8px;font-size:28px;line-height:1.2;font-weight:800;color:${on}">${o.title}</div>
${o.subtitle ? `<div style="margin-top:8px;font-size:14px;color:${soft}">${o.subtitle}</div>` : ""}</td></tr>
<tr><td style="padding:32px 32px 26px">${o.bodyHtml}</td></tr>
<tr><td style="padding:0 32px"><div style="height:1px;background:#ececef;line-height:1px;font-size:1px">&nbsp;</div></td></tr>
<tr><td align="center" style="padding:18px 32px 26px;font-size:12px;line-height:1.5;color:#a1a1aa">${o.footer}</td></tr>
</table></td></tr></table></body></html>`;
}

/** The full HTML email. Everything a guest or host typed is escaped; only the link is turned into a button. */
export function renderEmailHtml(t: EmailTemplate, v: EmailVars, kind: EmailKind = "invitation"): string {
  const body = esc(fill(t.body, { ...v, link: "" }))
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#3f3f46">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  const safeLink = /^https?:\/\//i.test(v.link) ? v.link : "";
  const button =
    safeLink && t.buttonLabel
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px auto 6px"><tr><td style="border-radius:999px;background:${t.accent}"><a href="${esc(safeLink)}" style="display:inline-block;padding:15px 34px;font-size:15px;font-weight:bold;color:${onColor(t.accent)};text-decoration:none;border-radius:999px">${esc(fill(t.buttonLabel, v))}</a></td></tr></table>`
      : "";
  return emailShell({
    accent: t.accent,
    background: t.background,
    icon: kind === "confirmation" ? "check" : "mail",
    kicker: esc(fill(t.heading, v)),
    title: esc(v.event),
    bodyHtml: body + button,
    footer: esc(fill(t.footer, v)),
    preheader: esc(fill(t.heading, v)),
  });
}
