"use client";

import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HowCreditsWorkCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">How Credits Work</CardTitle>
        <CardDescription>
          The Revlio credit system ensures quality feedback for everyone
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold">Earn Credits</h4>
              <p className="text-sm text-muted-foreground">
                Complete thoughtful reviews (min. 100 chars per section) to earn{" "}
                <strong>1 credit</strong> per review
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ArrowDownLeft className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold">Spend Credits</h4>
              <p className="text-sm text-muted-foreground">
                Submit your project for review and spend <strong>1 credit</strong> to receive 3
                reviews
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
