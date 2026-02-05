"use client";

import { FileText, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectDetail } from "@/hooks/project-detail";

interface ProjectInfoCardsProps {
  project: ProjectDetail;
}

export function ProblemSolvedCard({ project }: ProjectInfoCardsProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Problem Solved
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {project.problemSolved || "No problem statement provided yet."}
        </p>
      </CardContent>
    </Card>
  );
}

export function TechStackCard({ project }: ProjectInfoCardsProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          Tech Stack
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="rounded-full border border-border/60 bg-muted/40 text-sm"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectInfoCards({ project }: ProjectInfoCardsProps) {
  return (
    <div className="flex flex-col gap-6">
      <ProblemSolvedCard project={project} />
      <TechStackCard project={project} />
    </div>
  );
}
