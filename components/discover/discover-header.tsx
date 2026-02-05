"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DiscoverHeaderProps {
  title: string;
  subtitle: string;
  projectCount: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export function DiscoverHeader({
  title,
  subtitle,
  projectCount,
  isLoading,
  onRefresh,
}: DiscoverHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <SidebarTrigger className="lg:hidden h-8 w-8 shrink-0 mt-1" />
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!isLoading && projectCount > 0 && (
          <span className="hidden sm:inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground whitespace-nowrap">
            {projectCount} project{projectCount !== 1 ? "s" : ""}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-full px-4"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
}
