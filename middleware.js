import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { DEMO_MODE } from "@/lib/demo";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/resume(.*)",
  "/interview(.*)",
  "/ai-cover-letter(.*)",
  "/onboarding(.*)",
]);

const passthrough = () => NextResponse.next();

// In demo mode there is no Clerk instance to talk to, so the auth middleware
// is skipped rather than left to fail its handshake on every request.
export default DEMO_MODE
  ? passthrough
  : clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return NextResponse.next();

  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    // Send the user back where they were trying to go once they sign in.
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  return NextResponse.next();
    });

export const config = {
  matcher: [
    // Skip Next.js internals and static files unless referenced in a query.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
