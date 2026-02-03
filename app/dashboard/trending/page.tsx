"use client";

import { TrendingUp, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TrendingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trending</h1>
        <p className="text-muted-foreground">
          Most reviewed and talked about projects this week.
        </p>
      </div>

      {/* Empty state */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-orange-50 dark:bg-orange-900/30 p-4 mb-4">
            <Flame className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No trending projects yet</h3>
          <p className="text-muted-foreground max-w-md">
            Trending projects will appear here based on review activity and
            engagement. Check back soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
