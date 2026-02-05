"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectsEmptyStateProps {
  onSubmitProject: () => void;
}

export function ProjectsEmptyState({ onSubmitProject }: ProjectsEmptyStateProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Submit your first project to get guaranteed feedback from real
          makers. You need credits to submit a project.
        </p>
        <Button onClick={onSubmitProject} className="rounded-full px-6">
          Submit Your First Project
        </Button>
      </CardContent>
    </Card>
  );
}
