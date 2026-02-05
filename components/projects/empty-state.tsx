"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectsEmptyStateProps {
  onSubmitProject: () => void;
}

export function ProjectsEmptyState({ onSubmitProject }: ProjectsEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-4 mb-4">
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Submit your first project to get guaranteed feedback from real
          makers. You need credits to submit a project.
        </p>
        <Button onClick={onSubmitProject}>
          <Plus className="mr-2 h-4 w-4" />
          Submit Your First Project
        </Button>
      </CardContent>
    </Card>
  );
}
