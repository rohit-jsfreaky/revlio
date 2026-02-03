"use client";

import { FolderPlus, Coins, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubmitProjectPage() {
  const userCredits = 0; // Will be fetched from API
  const requiredCredits = 2;
  const hasEnoughCredits = userCredits >= requiredCredits;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submit Project</h1>
        <p className="text-muted-foreground">
          Share your project and get guaranteed feedback from the community.
        </p>
      </div>

      {/* Credit check */}
      {!hasEnoughCredits && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-200">
                Not enough credits
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                You need {requiredCredits} credits to submit a project. You currently have{" "}
                <span className="font-semibold">{userCredits} credits</span>.
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                Earn credits by reviewing other projects in the review queue.
              </p>
              <Button asChild variant="outline" className="mt-4 border-amber-300 dark:border-amber-700">
                <Link href="/dashboard/reviews">
                  Go to Review Queue
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project submission form placeholder */}
      <Card className={!hasEnoughCredits ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Project Details
          </CardTitle>
          <CardDescription>
            Fill in the details about your project. Cost: {requiredCredits} credits.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FolderPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground max-w-md">
            Project submission form will be available here. First, earn some credits by reviewing projects!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
