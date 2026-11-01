"use client";

import { useEffect } from "react";
import { applyTheme } from "lojee-ui";
import { ThemeProvider } from "@/components/ui";
import type { Settings } from "@/lib/settings-shared";

/** Gives a public event page its own theme and font; also mirrors the theme onto <html> so dialogs and menus match, and restores the app theme when leaving. */
export default function EventTheme({ theme, children }: { theme: Settings["theme"]; children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(theme.mode, theme.accent, undefined, theme.design);
    return () => applyTheme("light", "#18181b", undefined, "bento");
  }, [theme.mode, theme.accent, theme.design]);

  return (
    <ThemeProvider isolated mode={theme.mode} accent={theme.accent} design={theme.design}>
      <div data-font={theme.font} className="page-bg min-h-screen text-fg">{children}</div>
    </ThemeProvider>
  );
}
