import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SignOutLink from "@/components/SignOutLink";

// These pages read the signed-in user at request time, so they can't be prerendered into the static shell: let navigation wait here (a loading screen shows meanwhile).
export const instant = false;

export const metadata: Metadata = { title: "Account disabled", robots: { index: false } };

export default async function DisabledPage() {
  const s = await getSession();
  if (s.status === "signed-out") redirect("/sign-in");
  if (s.status === "ok") redirect("/dashboard");
  return (
    <main className="mx-auto mt-24 max-w-md px-4">
      <div className="rounded-3xl border border-border bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-extrabold">This account is disabled</h1>
        <p className="mt-3 text-sm text-soft">An administrator has switched off <b>{s.user.email}</b>. Your events are hidden until it is enabled again. Contact the site administrator if this is a mistake.</p>
        <div className="mt-6"><SignOutLink /></div>
      </div>
    </main>
  );
}
