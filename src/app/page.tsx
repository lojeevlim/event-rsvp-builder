import Link from "next/link";
import { CalendarHeart, Link2, Mail, Palette, ShieldCheck, Users } from "lucide-react";
import Logo from "@/components/Logo";
import { linkButton } from "@/components/link-button";

const FEATURES = [
  { Icon: Palette, title: "Design it your way", text: "A visual editor: sections, stickers, maps, countdowns, colours and fonts. Start from a ready-made type like birthday or wedding." },
  { Icon: Link2, title: "One link to share", text: "Every event gets its own public address. Send it in any chat or email, and guests reply in seconds." },
  { Icon: Users, title: "See who's coming", text: "Live counts of who can attend and who can't, with each guest's name, party size and note." },
  { Icon: Mail, title: "Emails that look like you", text: "Customise the invitation and the confirmation email: wording, colours and button. Then email your guests the link." },
  { Icon: CalendarHeart, title: "Many events, one account", text: "Birthdays, weddings, team days. Keep each event, its design and its replies separate." },
  { Icon: ShieldCheck, title: "Your guests stay private", text: "Only you see your guest list. Accounts are verified, and an administrator can switch off abuse." },
];

const STEPS = [
  ["Create", "Pick a type, name your event and start from a ready-made design."],
  ["Customise", "Change the look, the text and the RSVP form until it feels like your event."],
  ["Share", "Copy the link, or email it to your guests, and watch the replies arrive."],
];

export default function Landing() {
  return (
    <div className="flex flex-1 flex-col">
      {/* the only dotted part of the app: the top bar and the hero */}
      <div className="page-bg">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" aria-label="Event RSVP home">
          <Logo height={42} />
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/sign-in" className={linkButton("ghost", "sm")}>Sign in</Link>
          <Link href="/sign-up" className={linkButton("primary", "sm")}>Get started</Link>
        </nav>
      </header>

        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-10 md:grid-cols-[1.1fr_0.9fr] md:pt-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Event invitations, simplified
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">Invitations people actually reply to.</h1>
            <p className="mt-5 max-w-xl text-lg text-soft">Design a beautiful event page, share one link, and see at a glance who can come and who can&apos;t.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-up" className={linkButton("primary", "lg")}>Create your event</Link>
              <Link href="/sign-in" className={linkButton("outline", "lg")}>Sign in</Link>
            </div>
          </div>

          {/* a small illustration of the result: an invitation and its live counts */}
          <div aria-hidden className="relative mx-auto w-full max-w-sm">
            <div className="rotate-2 rounded-[32px] border border-border bg-surface p-7 text-center shadow-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-600">You&apos;re invited</p>
              <p className="mt-3 text-3xl font-extrabold leading-tight">Dylan&apos;s 1st Birthday</p>
              <p className="mt-2 text-sm text-soft">Saturday · 6:00 PM · The Garden Room</p>
              <div className="mx-auto mt-5 inline-flex rounded-full bg-accent-600 px-6 py-2.5 text-sm font-bold text-white">RSVP to the party</div>
            </div>
            <div className="-mt-5 ml-auto w-[88%] -rotate-1 rounded-2xl border border-border bg-surface p-4 shadow-lg">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-soft">Replies so far</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div><p className="text-2xl font-extrabold text-emerald-600">18</p><p className="text-xs text-soft">can attend</p></div>
                <div><p className="text-2xl font-extrabold text-rose-500">4</p><p className="text-xs text-soft">can&apos;t</p></div>
                <div><p className="text-2xl font-extrabold">31</p><p className="text-xs text-soft">people</p></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <main className="flex-1">
        <section className="bg-surface-muted py-16">
          <div className="mx-auto w-full max-w-6xl px-5">
            <h2 className="text-center text-3xl font-extrabold tracking-tight">Everything you need, nothing you don&apos;t</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ Icon, title, text }) => (
                <div key={title} className="rounded-3xl border border-border bg-surface p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600"><Icon size={22} /></span>
                  <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                  <p className="mt-1.5 text-sm text-soft">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="text-center text-3xl font-extrabold tracking-tight">Three steps to a full guest list</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="rounded-3xl border border-border bg-surface p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-600 text-sm font-extrabold text-white">{i + 1}</span>
                <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                <p className="mt-1.5 text-sm text-soft">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-20">
          <div className="rounded-[36px] bg-accent-600 px-6 py-14 text-center text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to plan your next event?</h2>
            <p className="mx-auto mt-3 max-w-md text-white/80">Create your first invitation in a few minutes.</p>
            <Link href="/sign-up" className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-bold text-accent-700 hover:bg-white/90">
              Get started
            </Link>
          </div>
        </section>
      </main>

      <footer className="grid justify-items-center gap-3 border-t border-border py-8 text-center text-sm text-soft">
        <Logo height={30} />
        <p>Made with ♥️ by Lojee</p>
      </footer>
    </div>
  );
}
