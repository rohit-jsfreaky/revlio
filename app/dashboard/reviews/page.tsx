"use client";

import { ClipboardList, Coins, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ReviewsPage() {
  const pendingReviews = 0; // Will be fetched from API

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
          <p className="text-muted-foreground">
            Review projects to earn credits. Each review earns you 1 credit.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="h-4 w-4 text-amber-500" />
          <span>+1 credit per review</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-3">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">{pendingReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-3">
                <Coins className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Earned</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-purple-50 dark:bg-purple-900/30 p-3">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Review Time</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-4 mb-4">
            <ClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No reviews assigned yet</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            When projects are submitted, you'll be assigned reviews based on your
            tech stack. Check back soon!
          </p>
          <p className="text-sm text-muted-foreground">
            Want to review voluntarily? Explore the{" "}
            <a href="/dashboard/discover" className="text-blue-600 dark:text-blue-400 hover:underline">
              Fresh Builds
            </a>{" "}
            section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
