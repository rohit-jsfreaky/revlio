"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { OnboardingGuard } from "@/components/auth/onboarding-guard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data fresh for 1 minute
            gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
            refetchOnWindowFocus: false, // Don't refetch on window focus
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <OnboardingGuard>{children}</OnboardingGuard>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
