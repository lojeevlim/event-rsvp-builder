import AppHeader from "@/components/AppHeader";
import { requireUser } from "@/lib/auth";

// These pages read the signed-in user at request time, so they can't be prerendered into the static shell: let navigation wait here (a loading screen shows meanwhile).
export const instant = false;

// The top bar waits for the user and is drawn once, with the real role already known, so nothing in it changes or pops in afterwards.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-5">{children}</main>
    </>
  );
}
