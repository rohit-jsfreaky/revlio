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
    <div className="p-6 space-y-6">
      <CreditsHeader onRefresh={refreshCredits} />
      <StatsCards credits={credits} stats={stats} />
      <HowCreditsWorkCard />
      <TransactionHistory transactions={transactions} />
      <QuickActions credits={credits} />
    </div>
  );
}
