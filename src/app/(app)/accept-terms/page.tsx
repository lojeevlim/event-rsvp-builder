import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AcceptTermsForm from "@/components/AcceptTermsForm";

export const instant = false;

export const metadata: Metadata = { title: "Terms and conditions", robots: { index: false } };

export default async function AcceptTermsPage() {
  const s = await getSession();
  if (s.status === "signed-out") redirect("/sign-in");
  if (s.status === "disabled") redirect("/disabled");
  if (s.user.termsAcceptedAt) redirect("/dashboard");
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10">
      <div aria-hidden className="orb pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent-500/25 blur-3xl" style={{ animation: "orb-drift 12s ease-in-out infinite" }} />
      <div aria-hidden className="orb pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-accent-600/20 blur-3xl" style={{ animation: "orb-drift 15s ease-in-out infinite reverse" }} />
      <div className="anim-rise relative w-full max-w-xl overflow-hidden rounded-[32px] border border-border bg-surface/95 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] backdrop-blur sm:p-9">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-accent-500 via-accent-600 to-accent-500" />
        <AcceptTermsForm name={s.user.name} />
      </div>
    </main>
  );
}
