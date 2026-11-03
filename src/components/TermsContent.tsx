import { APP_NAME } from "@/lib/brand";

const SECTIONS: [string, string][] = [
  [`Using ${APP_NAME}`, `You may use ${APP_NAME} to design invitation pages, share them and collect replies for events you organise. You are responsible for the content you publish and for keeping your account secure.`],
  ["Your content", "You keep ownership of your events, pictures and text. You allow us to store and display them so your invitation page works. Do not upload anything unlawful, hateful, infringing or that you do not have the right to share."],
  ["Guest information", "Replies contain guests' names, emails and messages. Use them only to run your event, keep them private, and respect any request from a guest to remove their information."],
  ["Emails", "Confirmation and notification emails are sent on your behalf. Do not use the service to send spam or unsolicited messages."],
  ["Availability", "We work to keep the service running but it is provided as is, without guarantees. We may change, suspend or remove accounts that break these terms."],
  ["Privacy", "We store your name, email, profile photo and event data to provide the service, and do not sell it. You can ask an administrator to delete your account and data at any time."],
];

export default function TermsContent() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-soft">
      {SECTIONS.map(([h, p], i) => (
        <section key={h}>
          <h2 className="font-bold text-ink">{i + 1}. {h}</h2>
          <p className="mt-1">{p}</p>
        </section>
      ))}
    </div>
  );
}
