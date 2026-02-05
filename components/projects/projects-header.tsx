"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ProjectsHeaderProps {
  onSubmitProject: () => void;
}

export function ProjectsHeader({ onSubmitProject }: ProjectsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            My Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your submitted projects and view feedback
          </p>
        </div>
      </div>
      <Button
        onClick={onSubmitProject}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        <Plus className="mr-2 h-4 w-4" />
        Submit Project
      </Button>
    </div>
  );
}
