"use client";

import type { Project } from "@/hooks/projects";
import { ProjectCard } from "./project-card";

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
}

export function ProjectList({ projects, onEdit }: ProjectListProps) {
  return (
    <div className="space-y-5">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onEdit={onEdit} />
      ))}
    </div>
  );
}
