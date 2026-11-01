import AccountMenu from "@/components/AccountMenu";
import AppNavbar from "@/components/AppNavbar";
import type { AppUser } from "@/lib/data";

/** Top bar of the signed-in app. The "Super admin" link only exists for super admins. */
export default function AppHeader({ user }: { user: AppUser }) {
  return (
    <AppNavbar isSuperAdmin={user.role === "super_admin"}>
      <AccountMenu name={user.name} email={user.email} role={user.role} imageUrl={user.imageUrl} />
    </AppNavbar>
  );
}
