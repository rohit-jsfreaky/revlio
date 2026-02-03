"use client";

import { ThemeProvider } from "next-themes";
import { OnboardingGuard } from "@/components/auth/onboarding-guard";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <OnboardingGuard>{children}</OnboardingGuard>
    </ThemeProvider>
  );
}
