"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { applyTheme } from "lojee-ui";
import { ThemeProvider } from "@/components/ui";
import type { Settings } from "@/lib/settings-shared";

/**
 * The site theme comes from the admin settings. The isolated provider puts data-theme / accent on a
 * wrapper during server rendering (no flash of the wrong theme); applyTheme mirrors it onto <html> so
 * portals (dropdowns, dialogs) pick it up too.
 */
/** The admin app keeps its own fixed look; only the page preview inside it follows the site theme. */
const ADMIN_THEME: Settings["theme"] = { mode: "light", accent: "#18181b", design: "bento", font: "playful" };

export default function Providers({ theme: siteTheme, children }: { theme: Settings["theme"]; children: React.ReactNode }) {
  const theme = usePathname().startsWith("/admin") ? ADMIN_THEME : siteTheme;
  useEffect(() => {
    applyTheme(theme.mode, theme.accent, undefined, theme.design);
  }, [theme.mode, theme.accent, theme.design]);

  return (
    <ThemeProvider isolated mode={theme.mode} accent={theme.accent} design={theme.design}>
      <div data-font={theme.font} className="page-bg flex min-h-screen flex-col text-fg">{children}</div>
    </ThemeProvider>
  );
}
