import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarHeart, Check, Link2, Mail, Palette, ShieldCheck, Users } from "lucide-react";
import Logo from "@/components/Logo";
import { linkButton } from "@/components/link-button";
import { APP_NAME } from "@/lib/brand";
import { auth } from "@clerk/nextjs/server";
import { clerkEnabled } from "@/lib/auth";

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

/** Renders `signedIn` for signed-in visitors, else `signedOut`. Streams in so the rest of the page can still prerender. */
async function AuthSwitch({ signedIn, signedOut }: { signedIn: ReactNode; signedOut: ReactNode }) {
  const isSignedIn = clerkEnabled() && !!(await auth()).userId;
  return <>{isSignedIn ? signedIn : signedOut}</>;
}

function ByAuth(props: { signedIn: ReactNode; signedOut: ReactNode }) {
  return <Suspense fallback={props.signedOut}><AuthSwitch {...props} /></Suspense>;
}

export default function Landing() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      {/* the only dotted part of the app: the top bar and the hero */}
      <div className="page-bg overflow-x-clip">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" aria-label={`${APP_NAME} home`}>
          <Logo height={42} />
        </Link>
        <nav className="flex items-center gap-2">
          <ByAuth
            signedIn={<Link href="/dashboard" className={linkButton("primary", "sm")}>Dashboard</Link>}
            signedOut={
              <>
                <Link href="/sign-in" className={linkButton("ghost", "sm")}>Sign in</Link>
                <Link href="/sign-up" className={linkButton("primary", "sm")}>Get started</Link>
              </>
            }
          />
        </nav>
      </header>

        <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-6 md:grid-cols-[1.1fr_0.9fr] md:gap-14 md:pb-20 md:pt-20">
          {/* soft aurora behind the hero */}
          <div aria-hidden className="hero-orb pointer-events-none absolute -left-20 top-0 -z-10 h-72 w-72 md:-left-32 md:h-96 md:w-96 rounded-full bg-accent-500/20 blur-3xl" />
          <div aria-hidden className="hero-orb pointer-events-none absolute -right-16 bottom-0 -z-10 h-72 w-72 md:-right-24 md:h-[26rem] md:w-[26rem] rounded-full bg-accent-600/15 blur-3xl [animation-delay:-6s]" />

          <div>
            <p className="anim-rise mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 py-1.5 pl-2.5 pr-4 text-xs font-semibold uppercase tracking-[0.16em] text-soft shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Event invitations, simplified
            </p>
            <h1 className="anim-rise text-[2.5rem] font-extrabold leading-[1.06] tracking-tight [--d:0.08s] sm:text-5xl md:text-6xl lg:text-7xl">
              Invitations people <span className="hero-ink">actually reply to.</span>
            </h1>
            <p className="anim-rise mt-6 max-w-xl text-lg leading-relaxed text-soft [--d:0.16s] md:text-xl">Design a beautiful event page, share one link, and see at a glance who can come and who can&apos;t.</p>
            <div className="anim-rise mt-8 flex flex-col gap-3 [--d:0.24s] min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center md:mt-9">
              <ByAuth
                signedIn={
                  <>
                    <Link href="/dashboard" className={`${linkButton("primary", "lg")} group w-full gap-2 shadow-lg shadow-accent-600/25 min-[420px]:w-auto`}>
                      Create your event <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link href="/dashboard" className={`${linkButton("outline", "lg")} w-full min-[420px]:w-auto`}>Dashboard</Link>
                  </>
                }
                signedOut={
                  <>
                    <Link href="/sign-up" className={`${linkButton("primary", "lg")} group w-full gap-2 shadow-lg shadow-accent-600/25 min-[420px]:w-auto`}>
                      Create your event <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link href="/sign-in" className={`${linkButton("outline", "lg")} w-full min-[420px]:w-auto`}>Sign in</Link>
                  </>
                }
              />
            </div>
            <ul className="anim-rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-soft [--d:0.32s]">
              {["Visual editor", "One shareable link", "Live guest counts"].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check size={16} className="text-emerald-600" strokeWidth={3} />{t}</li>
              ))}
            </ul>
          </div>

          {/* an illustration of the result: an invitation, its live counts and a reply arriving */}
          <div aria-hidden className="anim-rise relative mx-auto w-full max-w-sm px-1 pt-14 [--d:0.2s] md:px-0 md:pt-0">
            <div className="hero-float absolute left-1 top-0 z-20 md:-left-6 md:-top-5 flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-3.5 py-2.5 shadow-xl [animation-delay:-2s]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/15 text-sm font-extrabold text-emerald-600">M</span>
              <span className="text-left text-xs leading-tight"><b className="block text-sm text-ink">Mia said yes 🎉</b><span className="text-soft">+2 guests · just now</span></span>
            </div>
            <div className="relative rotate-2 overflow-hidden rounded-[32px] border border-border bg-surface p-8 text-center shadow-[0_30px_70px_-25px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-accent-500 via-accent-600 to-accent-500" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-600">You&apos;re invited</p>
              <p className="mt-3 text-3xl font-extrabold leading-tight">Dylan&apos;s 1st Birthday</p>
              <p className="mt-2 text-sm text-soft">Saturday · 6:00 PM · The Garden Room</p>
              <div className="mx-auto mt-6 inline-flex rounded-full bg-accent-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-accent-600/30">RSVP to the party</div>
            </div>
            <div className="hero-float relative z-10 -mt-6 ml-auto w-[90%] -rotate-1 rounded-2xl border border-border bg-surface p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-soft">Replies so far</p>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">Live</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div><p className="text-2xl font-extrabold text-emerald-600">18</p><p className="text-xs text-soft">can attend</p></div>
                <div><p className="text-2xl font-extrabold text-rose-500">4</p><p className="text-xs text-soft">can&apos;t</p></div>
                <div><p className="text-2xl font-extrabold">31</p><p className="text-xs text-soft">people</p></div>
              </div>
              <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-border">
                <span className="w-[82%] rounded-full bg-emerald-500" />
                <span className="ml-0.5 w-[18%] rounded-full bg-rose-400" />
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
            <ByAuth
              signedIn={<Link href="/dashboard" className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-bold text-accent-700 hover:bg-white/90">Go to dashboard</Link>}
              signedOut={<Link href="/sign-up" className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-bold text-accent-700 hover:bg-white/90">Get started</Link>}
            />
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
