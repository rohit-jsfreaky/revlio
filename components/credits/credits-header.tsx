"use client";

import { Coins, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface CreditsHeaderProps {
  onRefresh: () => void;
}

export function CreditsHeader({ onRefresh }: CreditsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-amber-600" />
            Credits
          </h1>
          <p className="text-muted-foreground mt-1">
            Earn credits by reviewing projects, spend them to get reviews
          </p>
        </div>
      </div>
      <Button variant="outline" onClick={onRefresh} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
}
