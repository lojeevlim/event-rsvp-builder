import Link from "next/link";
import Logo from "@/components/Logo";

/** The login / sign-up layout: a brand panel next to the Clerk form. */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid flex-1 md:grid-cols-[1fr_1.1fr]">
      <aside className="hidden flex-col justify-between bg-accent-600 p-10 text-white md:flex">
        <Link href="/" aria-label="Event RSVP home">
          <Logo height={46} tone="light" />
        </Link>
        <div>
          <p className="text-4xl font-extrabold leading-tight">Invitations people actually reply to.</p>
          <p className="mt-3 max-w-sm text-white/75">Design the page, share one link, and see who can come.</p>
        </div>
        <p className="text-sm text-white/60">Event RSVP</p>
      </aside>
      <section className="flex flex-col items-center justify-center gap-5 px-4 py-12">
        <Link href="/" aria-label="Event RSVP home" className="md:hidden">
          <Logo height={40} />
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="mt-1 text-sm text-soft">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
