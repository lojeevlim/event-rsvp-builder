import AppHeader from "@/components/AppHeader";
import { requireUser } from "@/lib/auth";

// Same top bar and page frame as the dashboard: an event's page lives at /event/<id>.
export const instant = false;

export default async function EventAreaLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <AppHeader user={user} />
      <main className="page-enter mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-5">{children}</main>
    </>
  );
}
