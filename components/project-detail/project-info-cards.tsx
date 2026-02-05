"use client";

import { FileText, Layers, MessageSquare, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectDetail } from "@/hooks/project-detail";

interface ProjectInfoCardsProps {
  project: ProjectDetail;
}

export function ProblemSolvedCard({ project }: ProjectInfoCardsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-600" />
          Problem Solved
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{project.problemSolved}</p>
      </CardContent>
    </Card>
  );
}

export function TechStackCard({ project }: ProjectInfoCardsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600" />
          Tech Stack
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-sm">
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
    <>
      <ProblemSolvedCard project={project} />
      <TechStackCard project={project} />
    </>
  );
}
