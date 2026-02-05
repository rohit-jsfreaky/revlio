"use client";

import { useCreditsPage } from "@/hooks/credits";
import {
  CreditsHeader,
  StatsCards,
  HowCreditsWorkCard,
  TransactionHistory,
  QuickActions,
  CreditsPageSkeleton,
} from "@/components/credits";

export default function CreditsPage() {
  const { credits, transactions, stats, isLoading, refreshCredits } = useCreditsPage();

  if (isLoading) {
    return <CreditsPageSkeleton />;
  }

  return (
    <div className="relative p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_10%_-10%,rgba(59,130,246,0.12),transparent)] dark:bg-[radial-gradient(900px_circle_at_10%_-10%,rgba(59,130,246,0.2),transparent)]" />
      <div className="mx-auto max-w-7xl space-y-6">
        <CreditsHeader onRefresh={refreshCredits} />

        <div className="flex flex-col gap-6">
          <StatsCards credits={credits} stats={stats} />
          <HowCreditsWorkCard />
          <TransactionHistory transactions={transactions} />
          <QuickActions credits={credits} layout="stack" />
        </div>
      </div>
    </div>
  );
}
