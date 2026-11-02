import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk reads the session for the signed-in parts of the app (dashboard, editor, super admin, sign-in pages and their APIs).
// The landing page and the public event pages (/e/...) never touch it, so they stay static and cached.
const clerk = clerkMiddleware();

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return NextResponse.next();
  return clerk(req, event);
}

export const config = {
  matcher: ["/sign-in/:path*", "/sign-up/:path*", "/disabled", "/accept-terms", "/dashboard/:path*", "/editor/:path*", "/super/:path*", "/api/events/:path*", "/api/super/:path*", "/api/upload", "/api/me/:path*"],
};
