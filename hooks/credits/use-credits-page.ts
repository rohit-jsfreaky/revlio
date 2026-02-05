"use client";

import { useQuery } from "@tanstack/react-query";
import { useCredits } from "@/components/dashboard/dashboard-layout";

// Types
export interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

export interface CreditStats {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  reviewsCompleted: number;
  projectsSubmitted: number;
}

// API functions
async function fetchCreditHistory(): Promise<CreditTransaction[]> {
  const res = await fetch("/api/credits?type=history");
  if (!res.ok) throw new Error("Failed to fetch credit history");
  const data = await res.json();
  // API returns { history, balance } - we need the history array
  return Array.isArray(data.history) ? data.history : [];
}

async function fetchCreditStats(): Promise<CreditStats> {
  const res = await fetch("/api/credits?type=stats");
  if (!res.ok) throw new Error("Failed to fetch credit stats");
  return res.json();
}

// Helper function
export function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    return `${hours}h ago`;
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

// Main hook
export function useCreditsPage() {
  const { credits, refreshCredits } = useCredits();

  // Fetch transaction history
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
  } = useQuery({
    queryKey: ["credit-history"],
    queryFn: fetchCreditHistory,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch credit stats
  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ["credit-stats"],
    queryFn: fetchCreditStats,
    staleTime: 30 * 1000, // 30 seconds
  });

  const isLoading = isLoadingTransactions || isLoadingStats;

  return {
    credits,
    transactions,
    stats,
    isLoading,
    refreshCredits,
  };
}
