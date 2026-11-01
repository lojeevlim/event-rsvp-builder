"use client";

import { useEffect } from "react";
import { applyTheme } from "lojee-ui";
import { ThemeProvider } from "@/components/ui";
import type { Settings } from "@/lib/settings-shared";

/** The app itself (landing, dashboard, sign-in) has one fixed look, on a plain background (only the landing hero is dotted); each event page sets its own theme (see EventTheme). */
const APP_THEME: Settings["theme"] = { mode: "light", accent: "#18181b", design: "bento", font: "playful" };

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(APP_THEME.mode, APP_THEME.accent, undefined, APP_THEME.design);
  }, []);

  return (
    <ThemeProvider isolated mode={APP_THEME.mode} accent={APP_THEME.accent} design={APP_THEME.design}>
      <div data-font={APP_THEME.font} className="flex min-h-screen flex-col bg-surface text-fg">{children}</div>
    </ThemeProvider>
  );
}
