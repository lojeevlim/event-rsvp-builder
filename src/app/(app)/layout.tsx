import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import SetupMissing from "@/components/SetupMissing";
import { setupMissing } from "@/lib/auth";

// Everything signed-in lives in this group; Clerk wraps only it, so the landing page and public events stay static.
export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const missing = setupMissing();
  if (missing) return <SetupMissing missing={missing} />;
  // No fallback on purpose: a placeholder here would flash for an instant before each page shows its own loading screen.
  return (
    <Suspense fallback={null}>
      <ClerkProvider>{children}</ClerkProvider>
    </Suspense>
  );
}
