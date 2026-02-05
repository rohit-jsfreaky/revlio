"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Github, Clock, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { ProjectDetail } from "@/hooks/project-detail";

// Status configuration
const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  pending_review: { label: "Pending Review", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  active: { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
  archived: { label: "Archived", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
};

// Category labels
const categoryLabels: Record<string, string> = {
  saas: "SaaS",
  tool: "Developer Tool",
  app: "Mobile/Web App",
  portfolio: "Portfolio",
  api: "API/Backend",
  open_source: "Open Source",
  other: "Other",
};

// Helper function
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface ProjectDetailHeaderProps {
  project: ProjectDetail;
}

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  const status = statusConfig[project.status] || statusConfig.draft;

  return (
    <>
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>

      {/* Project Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Screenshot */}
        {project.screenshotUrl && (
          <div className="md:w-80 h-48 rounded-xl overflow-hidden border">
            <Image
              src={project.screenshotUrl}
              alt={project.title}
              width={320}
              height={192}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Project Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <Badge className={status.color}>{status.label}</Badge>
              </div>
              <p className="text-muted-foreground mb-4">{project.description}</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button asChild variant="outline" size="sm">
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Site
              </a>
            </Button>
            {project.githubUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              {categoryLabels[project.category] || project.category}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(project.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {project.owner.name}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
