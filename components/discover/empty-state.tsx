"use client";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "no-projects" | "no-results";
  searchQuery?: string;
  onClearFilters?: () => void;
}

export function EmptyState({ type, searchQuery, onClearFilters }: EmptyStateProps) {
  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/80 py-16 px-6 text-center">
        <h3 className="text-lg font-semibold mb-2">No matching projects</h3>
        <p className="text-muted-foreground max-w-md mb-4">
          {searchQuery
            ? `No projects found for "${searchQuery}". Try adjusting your search or filters.`
            : "No projects match your current filters."}
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/80 py-16 px-6 text-center">
      <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
      <p className="text-muted-foreground max-w-md">
        Be the first to submit a project! Projects will appear here once
        members start sharing their work.
      </p>
    </div>
  );
}
