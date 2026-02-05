"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface QuickActionsProps {
  credits: number;
  layout?: "grid" | "stack";
}

function ActionArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export function QuickActions({ credits, layout = "grid" }: QuickActionsProps) {
  const isStack = layout === "stack";

  return (
    <div className={`grid gap-4 ${isStack ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
      <Card className="group cursor-pointer border-border/60 bg-card/80 transition-colors hover:border-emerald-400/70">
        <Link href="/dashboard/reviews">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Earn</p>
                <h3 className="mt-1 text-base font-semibold">Review Projects</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Earn credits by helping other makers.
                </p>
              </div>
              <ActionArrow />
            </div>
          </CardContent>
        </Link>
      </Card>

      <Card
        className={`group cursor-pointer border-border/60 bg-card/80 transition-colors ${
          credits >= 1 ? "hover:border-sky-400/70" : "opacity-60"
        }`}
      >
        <Link
          href={credits >= 1 ? "/dashboard/submit" : "#"}
          className={credits < 1 ? "pointer-events-none" : ""}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Spend</p>
                <h3 className="mt-1 text-base font-semibold">Submit Project</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {credits >= 1 ? "Get feedback from real makers." : "Need 1 credit to submit."}
                </p>
              </div>
              <ActionArrow />
            </div>
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}
