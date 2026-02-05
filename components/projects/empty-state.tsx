"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectsEmptyStateProps {
  onSubmitProject: () => void;
}

export function ProjectsEmptyState({ onSubmitProject }: ProjectsEmptyStateProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-muted/40">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Submit your first project to get guaranteed feedback from real
          makers. You need credits to submit a project.
        </p>
        <Button onClick={onSubmitProject} className="rounded-full px-6 gap-2">
          <Plus className="h-4 w-4" />
          Submit Your First Project
        </Button>
      </CardContent>
    </Card>
  );
}
