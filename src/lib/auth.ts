import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { dbEnabled } from "./db";
import { getUserByClerkId, setUserRole, superAdminEmails, touchUser, upsertUser, type AppUser } from "./data";

/** Sign-in is handled by Clerk; everything else about a user (role, enabled/disabled) lives in our own database. */
export const clerkEnabled = () => !!process.env.CLERK_SECRET_KEY && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/** Which required service is missing, or null when the app can run. */
export const setupMissing = (): "clerk" | "database" | null => (!clerkEnabled() ? "clerk" : !dbEnabled() ? "database" : null);

export type Session = { status: "signed-out" } | { status: "disabled"; user: AppUser } | { status: "ok"; user: AppUser };

const TEN_MINUTES = 10 * 60 * 1000;

/** Validates the signed-in person against our database: creates their record on first visit and rejects disabled accounts. */
export async function getSession(): Promise<Session> {
  const { userId } = await auth();
  if (!userId) return { status: "signed-out" };

  let user = await getUserByClerkId(userId);
  if (!user) {
    const cu = await currentUser();
    if (!cu) return { status: "signed-out" };
    const email = (cu.emailAddresses.find((e) => e.id === cu.primaryEmailAddressId) ?? cu.emailAddresses[0])?.emailAddress;
    if (!email) return { status: "signed-out" };
    user = await upsertUser({ clerkId: userId, email, name: [cu.firstName, cu.lastName].filter(Boolean).join(" ") || email.split("@")[0], imageUrl: cu.hasImage ? cu.imageUrl : "" });
  } else {
    if (user.role !== "super_admin" && superAdminEmails().includes(user.email)) user = (await setUserRole(user.id, "super_admin")) ?? user;
    if (Date.now() - new Date(user.lastSeenAt).getTime() > TEN_MINUTES) void touchUser(user.id).catch(() => {});
  }
  return user.active ? { status: "ok", user } : { status: "disabled", user };
}

/** For pages: the signed-in, enabled user, or a redirect. */
export async function requireUser(): Promise<AppUser> {
  const s = await getSession();
  if (s.status === "signed-out") redirect("/sign-in");
  if (s.status === "disabled") redirect("/disabled");
  return s.user;
}

export async function requireSuperAdmin(): Promise<AppUser> {
  const user = await requireUser();
  if (user.role !== "super_admin") redirect("/dashboard");
  return user;
}

/** For API routes: the user, or the response to return. */
export async function apiUser(role?: "super_admin"): Promise<{ user: AppUser } | { response: Response }> {
  const s = await getSession();
  if (s.status === "signed-out") return { response: Response.json({ error: "Please sign in." }, { status: 401 }) };
  if (s.status === "disabled") return { response: Response.json({ error: "This account is disabled." }, { status: 403 }) };
  if (role && s.user.role !== role) return { response: Response.json({ error: "Not allowed." }, { status: 403 }) };
  return { user: s.user };
}
