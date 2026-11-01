import nodemailer from "nodemailer";

export type Mail = { to: string; subject: string; html: string; /** where guest replies go (the host) */ replyTo?: string; fromName?: string };

/** Sends through Resend when RESEND_API_KEY is set (EMAIL_FROM = an address on your verified domain), otherwise through Gmail. Throws when the mail could not be sent. */
export async function sendMail({ to, subject, html, replyTo, fromName }: Mail) {
  const name = (fromName ?? "Event RSVP").replace(/[<>"\r\n]/g, "").slice(0, 60) || "Event RSVP";
  if (process.env.RESEND_API_KEY) {
    const address = (process.env.EMAIL_FROM ?? "Event RSVP <onboarding@resend.dev>").match(/<([^>]+)>/)?.[1] ?? process.env.EMAIL_FROM ?? "onboarding@resend.dev";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: `${name} <${address}>`, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) throw new Error(`Resend failed (${res.status}): ${await res.text().catch(() => "")}`.slice(0, 300));
    return;
  }
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) throw new Error("No email service is set up (RESEND_API_KEY or Gmail).");
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
  await transporter.sendMail({ from: `"${name}" <${process.env.GMAIL_USER}>`, to, subject, html, ...(replyTo ? { replyTo } : {}) });
}
