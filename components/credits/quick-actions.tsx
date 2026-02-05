"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickActionsProps {
  credits: number;
}

export function QuickActions({ credits }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="group hover:border-green-500 transition-colors cursor-pointer">
        <Link href="/dashboard/reviews">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Review Projects</h3>
                <p className="text-sm text-muted-foreground">
                  Earn credits by helping other makers
                </p>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>

      <Card
        className={`group transition-colors cursor-pointer ${
          credits >= 1 ? "hover:border-blue-500" : "opacity-60"
        }`}
      >
        <Link
          href={credits >= 1 ? "/dashboard/submit" : "#"}
          className={credits < 1 ? "pointer-events-none" : ""}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Submit Project</h3>
                <p className="text-sm text-muted-foreground">
                  {credits >= 1 ? "Get feedback from real makers" : "Need 1 credit to submit"}
                </p>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}
