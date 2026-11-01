"use client";

import { useEffect, useRef } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserMenu } from "@/components/ui";

/** The lojee-ui user menu in the header: the profile photo when there is one, otherwise the first letter of the name. */
export default function AccountMenu({ name, email, role, imageUrl }: { name: string; email: string; role: "super_admin" | "host"; imageUrl: string }) {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Until Clerk has loaded, show the photo saved with the account; afterwards Clerk's own (so a new photo shows at once).
  const live = isLoaded ? (user?.hasImage ? user.imageUrl : "") : imageUrl;

  // Remember a changed photo, so the next page load already starts with it.
  const synced = useRef(imageUrl);
  useEffect(() => {
    if (!isLoaded || live === synced.current) return;
    synced.current = live;
    void fetch("/api/me/avatar", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: live }) }).catch(() => {});
  }, [isLoaded, live]);

  return (
    <UserMenu
      transition="blur"
      name={name || email}
      email={`${email}${role === "super_admin" ? " · Super admin" : ""}`}
      avatarSrc={live || undefined}
      avatarInitials={(name || email)[0].toUpperCase()}
      items={[{ label: "Profile", icon: "user" }, { label: "Sign out", danger: true }]}
      onItemSelect={(item) => (item.label === "Profile" ? router.push("/dashboard/profile") : signOut({ redirectUrl: "/" }))}
    />
  );
}
