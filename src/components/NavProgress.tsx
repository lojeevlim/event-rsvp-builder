"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { getNavProgress, getServerNavProgress, installNavProgress, navPathChanged, subscribeNavProgress } from "@/lib/nav-progress";

/** The bar under the navbar. All of its logic lives in lib/nav-progress, so it carries on when a layout swap re-creates the navbar. */
export default function NavProgress() {
  const path = usePathname();
  const { value, shown } = useSyncExternalStore(subscribeNavProgress, getNavProgress, getServerNavProgress);

  useEffect(() => installNavProgress(), []);
  useEffect(() => navPathChanged(path), [path]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-full z-50 h-1 ${shown ? "opacity-100" : "opacity-0 transition-opacity duration-300"}`}>
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 shadow-[0_0_10px_1px] shadow-accent-500/60 transition-[width] duration-200 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
