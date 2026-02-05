"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CreditStats } from "@/hooks/credits";

interface StatsCardsProps {
  credits: number;
  stats: CreditStats | undefined;
}

export function BalanceCard({ credits }: { credits: number }) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Current Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-foreground">{credits}</span>
          <span className="text-sm text-muted-foreground">credits</span>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          {credits >= 1 ? "You can submit a project today." : "Review projects to earn credits."}
        </p>
      </CardContent>
    </Card>
  );
}

export function TotalEarnedCard({ stats }: { stats: CreditStats | undefined }) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Total Earned
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-foreground">
            +{stats?.totalEarned || 0}
          </span>
          <span className="text-sm text-muted-foreground">credits</span>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          From {stats?.reviewsCompleted || 0} completed reviews.
        </p>
      </CardContent>
    </Card>
  );
}

export function TotalSpentCard({ stats }: { stats: CreditStats | undefined }) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Total Spent
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-foreground">
            {stats?.totalSpent || 0}
          </span>
          <span className="text-sm text-muted-foreground">credits</span>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          On {stats?.projectsSubmitted || 0} project submissions.
        </p>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ credits, stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <BalanceCard credits={credits} />
      <TotalEarnedCard stats={stats} />
      <TotalSpentCard stats={stats} />
    </div>
  );
}
