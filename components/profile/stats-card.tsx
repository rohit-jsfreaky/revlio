"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileStats } from "@/hooks/profile";

interface StatsCardProps {
  stats: ProfileStats;
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <Card className="rounded-2xl border-border/60 bg-card/80">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-base">Activity</CardTitle>
        <CardDescription>Your contribution to the community.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border/60 bg-muted/30 text-sm sm:grid-cols-4">
          <div className="space-y-1 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Projects</p>
            <p className="text-2xl font-semibold text-foreground">{stats.projectsCount}</p>
          </div>
          <div className="space-y-1 border-l border-border/60 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Reviews</p>
            <p className="text-2xl font-semibold text-foreground">{stats.reviewsCount}</p>
          </div>
          <div className="space-y-1 border-t border-border/60 p-4 sm:border-t-0 sm:border-l sm:border-border/60">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Helpful</p>
            <p className="text-2xl font-semibold text-foreground">{stats.helpfulCount}</p>
          </div>
          <div className="space-y-1 border-l border-border/60 border-t border-border/60 p-4 sm:border-t-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Score</p>
            <p className="text-2xl font-semibold text-foreground">{stats.score}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
