"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** `base` and `showEmails` come from the event; while that loads they are worked out from the address (/event/<id>) and the Emails tab is shown. */
export default function EventTabs({ base: baseProp, showEmails = true }: { base?: string; showEmails?: boolean }) {
  const path = usePathname();
  const base = baseProp ?? path.split("/").slice(0, 3).join("/");
  const tabs = [{ href: base, label: "Replies & sharing" }, ...(showEmails ? [{ href: `${base}/emails`, label: "Emails" }] : [])];
  return (
    <nav className="flex gap-1 border-b border-border">
      {tabs.map((t) => {
        const active = path === t.href;
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${active ? "border-accent-600 text-fg" : "border-transparent text-soft hover:text-fg"}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
