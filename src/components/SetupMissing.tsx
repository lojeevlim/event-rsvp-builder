/** Shown instead of the app when a required service is not configured yet. */
export default function SetupMissing({ missing }: { missing: "clerk" | "database" }) {
  return (
    <main className="mx-auto mt-24 max-w-lg px-4">
      <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-extrabold">Almost there — one service is missing</h1>
        {missing === "clerk" ? (
          <p className="mt-3 text-sm text-soft">
            Sign-in needs Clerk. Set <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code>CLERK_SECRET_KEY</code> in your environment, then restart.
          </p>
        ) : (
          <p className="mt-3 text-sm text-soft">
            The app needs a Neon database. Set <code>DATABASE_URL</code> in your environment, then restart.
          </p>
        )}
        <p className="mt-3 text-sm text-soft">
          Full steps are in <code>docs/production-setup.md</code>.
        </p>
      </div>
    </main>
  );
}
