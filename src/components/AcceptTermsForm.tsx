"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import SignOutLink from "@/components/SignOutLink";
import TermsContent from "@/components/TermsContent";

/** The terms card: read (scroll) → tick → accept, then a short "all set" hand-off into the dashboard. */
export default function AcceptTermsForm({ name }: { name: string }) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [atEnd, setAtEnd] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  async function accept() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/me/terms", { method: "POST" }).catch(() => null);
    if (!res?.ok) {
      setBusy(false);
      return setError("Could not save. Please try again.");
    }
    setDone(true);
    router.prefetch("/dashboard");
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1300);
  }

  return (
    <>
      <div className={`transition-all duration-500 ${done ? "pointer-events-none scale-95 opacity-0 blur-[2px]" : ""}`}>
        <div className="anim-rise mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-600 text-white shadow-lg shadow-accent-600/30" style={{ "--d": "0.05s" } as React.CSSProperties}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 8.2-8 9-4.8-.8-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5L15.5 10" /></svg>
        </div>
        <h1 className="anim-rise mt-5 text-center text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ "--d": "0.12s" } as React.CSSProperties}>
          Welcome{name ? `, ${name.split(" ")[0]}` : ""}
        </h1>
        <p className="anim-rise mt-1.5 text-center text-sm text-soft" style={{ "--d": "0.18s" } as React.CSSProperties}>One last step: review our terms and conditions to open your dashboard.</p>

        <div className="anim-rise relative mt-6" style={{ "--d": "0.26s" } as React.CSSProperties}>
          <div
            ref={box}
            onScroll={(e) => {
              const t = e.currentTarget;
              setAtEnd(t.scrollTop + t.clientHeight >= t.scrollHeight - 8);
            }}
            className="max-h-64 overflow-y-auto rounded-2xl border border-border bg-cream/60 p-5 shadow-inner"
          >
            <TermsContent />
          </div>
          <div className={`pointer-events-none absolute inset-x-px bottom-px h-12 rounded-b-2xl bg-gradient-to-t from-surface to-transparent transition-opacity duration-300 ${atEnd ? "opacity-0" : "opacity-100"}`} />
        </div>

        <label className="anim-rise mt-5 flex cursor-pointer select-none items-start gap-3 rounded-2xl border border-border p-4 text-sm transition-colors hover:border-accent-500/60 has-[:checked]:border-accent-500 has-[:checked]:bg-accent-50/60" style={{ "--d": "0.32s" } as React.CSSProperties}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="peer sr-only" />
          <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-line bg-surface text-transparent transition-all duration-200 peer-checked:scale-110 peer-checked:border-accent-600 peer-checked:bg-accent-600 peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-accent-500/30">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </span>
          <span>I have read and agree to the terms and conditions.</span>
        </label>

        {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
        <div className="anim-rise mt-5 flex items-center justify-between gap-3" style={{ "--d": "0.38s" } as React.CSSProperties}>
          <SignOutLink />
          <Button disabled={!agreed || busy} onClick={accept}>{busy ? "Saving…" : "Accept and continue →"}</Button>
        </div>
      </div>

      {done && (
        <div className="anim-fade absolute inset-0 grid place-items-center rounded-[inherit] bg-surface/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="relative mx-auto grid h-20 w-20 place-items-center">
              <span className="absolute inset-0 rounded-full bg-accent-500" style={{ animation: "ring-burst 0.9s ease-out 0.25s both" }} />
              <span className="relative grid h-20 w-20 place-items-center rounded-full bg-accent-600 text-white shadow-lg shadow-accent-600/40" style={{ animation: "ring-pop 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" strokeDashoffset="24" style={{ animation: "check-draw 0.5s ease-out 0.3s forwards" }}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
            </div>
            <p className="anim-rise mt-5 text-xl font-extrabold" style={{ "--d": "0.4s" } as React.CSSProperties}>You&apos;re all set</p>
            <p className="anim-rise mt-1 text-sm text-soft" style={{ "--d": "0.5s" } as React.CSSProperties}>Taking you to your dashboard…</p>
          </div>
        </div>
      )}
    </>
  );
}
