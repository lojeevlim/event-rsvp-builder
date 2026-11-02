"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import NavProgress from "@/components/NavProgress";
import { Navbar, NavbarItem } from "@/components/ui";
import { startNavProgress } from "@/lib/nav-progress";

/** The signed-in app's top bar, built on the lojee-ui Navbar. Links navigate on the client (no full page reload). */
export default function AppNavbar({ isSuperAdmin, children }: { isSuperAdmin: boolean; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();

  const items = [
    { href: "/dashboard", label: "My events", icon: "calendar-days", active: path.startsWith("/dashboard") && !path.startsWith("/dashboard/profile") },
    { href: "/dashboard/profile", label: "Profile", icon: "user", active: path.startsWith("/dashboard/profile") },
    ...(isSuperAdmin ? [{ href: "/super", label: "Super admin", icon: "shield-check", active: path.startsWith("/super") }] : []),
  ];

  return (
    <div className="sticky top-0 z-40">
      <Navbar
        variant="light"
        brand={
          <Link href="/dashboard" aria-label="Event RSVP: my events">
            <Logo height={36} />
          </Link>
        }
        actions={children}
      >
        {items.map((i) => (
          <NavbarItem key={i.href} icon={i.icon} active={i.active} onClick={() => { startNavProgress(); router.push(i.href); }}>
            <span className="max-sm:sr-only">{i.label}</span>
          </NavbarItem>
        ))}
      </Navbar>
      <NavProgress />
    </div>
  );
}
