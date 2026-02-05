"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HowCreditsWorkCard() {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-lg">How Credits Work</CardTitle>
        <CardDescription>
          The Revlio credit system ensures quality feedback for everyone
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full border border-border/60 bg-muted/40 flex items-center justify-center text-xs font-semibold text-muted-foreground">
              01
            </div>
            <div>
              <h4 className="font-semibold">Earn Credits</h4>
              <p className="text-sm text-muted-foreground">
                Complete thoughtful reviews (min. 100 chars per section) to earn{" "}
                <strong>1 credit</strong> per review.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full border border-border/60 bg-muted/40 flex items-center justify-center text-xs font-semibold text-muted-foreground">
              02
            </div>
            <div>
              <h4 className="font-semibold">Spend Credits</h4>
              <p className="text-sm text-muted-foreground">
                Submit your project for review and spend <strong>1 credit</strong> to receive 3
                reviews.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
