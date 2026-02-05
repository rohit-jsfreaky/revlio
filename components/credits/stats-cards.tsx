"use client";

import { TrendingUp, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CreditStats } from "@/hooks/credits";

interface StatsCardsProps {
  credits: number;
  stats: CreditStats | undefined;
}

export function BalanceCard({ credits }: { credits: number }) {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">
          Current Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-amber-900 dark:text-amber-100">
            {credits}
          </span>
          <span className="text-amber-700 dark:text-amber-300">credits</span>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
          {credits >= 1 ? "You can submit a project!" : "Review projects to earn credits"}
        </p>
      </CardContent>
    </Card>
  );
}

export function TotalEarnedCard({ stats }: { stats: CreditStats | undefined }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          Total Earned
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-green-600">+{stats?.totalEarned || 0}</span>
          <span className="text-muted-foreground">credits</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          From {stats?.reviewsCompleted || 0} completed reviews
        </p>
      </CardContent>
    </Card>
  );
}

export function TotalSpentCard({ stats }: { stats: CreditStats | undefined }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4 text-blue-600" />
          Total Spent
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-blue-600">{stats?.totalSpent || 0}</span>
          <span className="text-muted-foreground">credits</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          On {stats?.projectsSubmitted || 0} project submissions
        </p>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ credits, stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BalanceCard credits={credits} />
      <TotalEarnedCard stats={stats} />
      <TotalSpentCard stats={stats} />
    </div>
  );
}
