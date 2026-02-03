"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip check for auth pages and onboarding page itself
    if (
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/verify-email") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/onboarding")
    ) {
      setIsChecking(false);
      return;
    }

    async function checkOnboarding() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        // If authenticated but not onboarded, redirect to onboarding
        if (data.authenticated && data.user?.onboardingCompleted === false) {
          router.push("/onboarding");
          return;
        }
      } catch (error) {
        console.error("Onboarding check error:", error);
      } finally {
        setIsChecking(false);
      }
    }

    checkOnboarding();
  }, [pathname, router]);

  // Don't block rendering for public pages
  if (
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/onboarding")
  ) {
    return <>{children}</>;
  }

  // For protected pages, show nothing while checking (prevents flash)
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
