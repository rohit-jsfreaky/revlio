"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface CreditsHeaderProps {
  onRefresh: () => void;
}

export function CreditsHeader({ onRefresh }: CreditsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Credits</h1>
          {/* <p className="text-sm text-muted-foreground max-w-2xl">
            Earn credits by reviewing projects, spend them to get reviews
          </p> */}
        </div>
      </div>
      <Button
        variant="outline"
        onClick={onRefresh}
        className="w-full rounded-full border-border/60 px-5 sm:w-auto"
      >
        Refresh
      </Button>
    </div>
  );
}
