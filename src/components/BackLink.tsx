import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** The "back" pill at the top of a page: an accent arrow disc that nudges left on hover. */
export default function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-4 text-sm font-semibold text-fg shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-accent-500 hover:bg-surface-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 ring-offset-surface"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white shadow-sm transition-transform duration-200 group-hover:-translate-x-0.5">
        <ArrowLeft size={15} strokeWidth={2.25} />
      </span>
      {children}
    </Link>
  );
}
