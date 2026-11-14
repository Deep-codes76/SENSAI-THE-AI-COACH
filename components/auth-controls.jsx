import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import MobileNav from "@/components/mobile-nav";

/**
 * The Clerk-dependent half of the header, split out so that demo mode can
 * render the same navigation without instantiating Clerk at all.
 */
export default function AuthControls({ signedInNav, children }) {
  return (
    <>
      <SignedIn>{signedInNav}</SignedIn>

      <SignedOut>
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link href="#features">Features</Link>
        </Button>
        <SignInButton mode="modal">
          <Button variant="outline">Sign in</Button>
        </SignInButton>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/dashboard">Get started</Link>
        </Button>
      </SignedOut>

      {children}

      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
              userButtonPopoverCard: "shadow-xl",
              userPreviewMainIdentifier: "font-semibold",
            },
          }}
        />
        <MobileNav />
      </SignedIn>
    </>
  );
}
