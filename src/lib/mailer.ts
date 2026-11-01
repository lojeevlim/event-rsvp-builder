import nodemailer from "nodemailer";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function cardHtml(name: string, guests: number) {
  const event = process.env.EVENT_NAME ?? "Our Event";
  const date = process.env.EVENT_DATE ?? "";
  const place = process.env.EVENT_PLACE ?? "";
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e4e4e7">
<tr><td align="center" style="padding:32px 24px 24px;background:#18181b;color:#fff">
<div style="font-size:12px;letter-spacing:4px;color:#a1a1aa">RSVP CONFIRMED</div>
<div style="font-size:26px;font-weight:bold;margin:10px 0 0">${esc(event)}</div></td></tr>
<tr><td align="center" style="padding:28px 24px">
<div style="font-size:12px;color:#71717a;letter-spacing:2px">GUEST</div>
<div style="font-size:26px;font-weight:bold;color:#18181b;margin:4px 0 16px">${esc(name)}</div>
<div style="font-size:15px;color:#3f3f46;line-height:1.7">${esc(date)}<br>${esc(place)}<br>${guests} guest${guests > 1 ? "s" : ""} confirmed</div>
<div style="margin-top:22px;font-size:14px;color:#71717a">Thank you for replying — we can't wait to see you there!</div></td></tr>
</table></td></tr></table></body></html>`;
}

export async function sendCard(to: string, name: string, guests: number) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  await transporter.sendMail({
    from: `"${process.env.EVENT_NAME ?? "Our Event"}" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Your RSVP is confirmed — ${process.env.EVENT_NAME ?? "Our Event"}`,
    html: cardHtml(name, guests),
  });
}
