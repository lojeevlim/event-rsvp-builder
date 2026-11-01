"use client";

import { UserProfile } from "@clerk/nextjs";

export default function ProfileClerk() {
  return <UserProfile routing="hash" appearance={{ elements: { rootBox: "w-full", cardBox: "w-full max-w-full shadow-none border border-[var(--color-border)]" } }} />;
}
