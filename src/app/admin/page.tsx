import type { Metadata } from "next";
import { Suspense } from "react";
import { adminEnabled, isAdmin } from "@/lib/admin-auth";
import { readSettings } from "@/lib/settings";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminLogin from "@/components/admin/AdminLogin";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

async function Gate() {
  if (!adminEnabled()) {
    return <p className="mx-auto mt-24 max-w-md rounded-2xl bg-white p-6 text-center">Set <code>ADMIN_PASSWORD</code> in <code>.env</code> and restart to enable the admin panel.</p>;
  }
  if (!(await isAdmin())) return <AdminLogin />;
  return <AdminPanel initial={await readSettings()} />;
}

export default function AdminPage() {
  return (
    <main className="h-screen overflow-y-auto overflow-x-hidden bg-cream">
      <Suspense fallback={<p className="p-10 text-center text-soft">Loading…</p>}>
        <Gate />
      </Suspense>
    </main>
  );
}
