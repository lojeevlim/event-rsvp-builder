import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import AuthShell from "@/components/AuthShell";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage() {
  // Coming back from Google (or any signed-in visit) lands here: go straight on instead of showing the form again.
  if ((await auth()).userId) redirect("/dashboard");
  return (
    <AuthShell title="Create your account" subtitle="Start designing your first event.">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
    </AuthShell>
  );
}
