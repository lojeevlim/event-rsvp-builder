"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Navbar, NavbarItem } from "@/components/ui";

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
    <Navbar
      sticky
      variant="light"
      brand={
        <Link href="/dashboard" aria-label="Event RSVP: my events">
          <Logo height={36} />
        </Link>
      }
      actions={children}
    >
      {items.map((i) => (
        <NavbarItem key={i.href} icon={i.icon} active={i.active} onClick={() => router.push(i.href)}>
          <span className="max-sm:sr-only">{i.label}</span>
        </NavbarItem>
      ))}
    </Navbar>
  );
}
