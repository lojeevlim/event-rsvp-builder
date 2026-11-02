import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import AuthShell from "@/components/AuthShell";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  // Coming back from Google (or any signed-in visit) lands here: go straight on instead of showing the form again.
  if ((await auth()).userId) redirect("/dashboard");
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your events.">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
    </AuthShell>
  );
}
