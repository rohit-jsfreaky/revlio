"use client";

import { RefreshCw } from "lucide-react";
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
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <SidebarTrigger className="lg:hidden h-8 w-8 shrink-0 mt-1" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isLoading && projectCount > 0 && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {projectCount} project{projectCount !== 1 ? "s" : ""}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
