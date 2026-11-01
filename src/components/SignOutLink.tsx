"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui";

export default function SignOutLink() {
  return (
    <SignOutButton redirectUrl="/">
      <Button variant="outline" size="sm">Sign out</Button>
    </SignOutButton>
  );
}
