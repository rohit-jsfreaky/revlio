"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ProjectsHeaderProps {
  onSubmitProject: () => void;
}

export function ProjectsHeader({ onSubmitProject }: ProjectsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            My Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Manage your submitted projects and view feedback
          </p>
        </div>
      </div>
      <Button
        onClick={onSubmitProject}
        className="w-full rounded-full bg-primary px-6 sm:w-auto"
      >
        Submit Project
      </Button>
    </div>
  );
}
