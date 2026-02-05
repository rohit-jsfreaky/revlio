"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Github, Tag, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { ProjectDetail } from "@/hooks/project-detail";

// Status configuration
const statusConfig: Record<string, { label: string; color: string }> = {
  draft: {
    label: "Draft",
    color: "bg-muted/60 text-foreground/70 border-border/60",
  },
  pending_review: {
    label: "Pending Review",
    color:
      "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50",
  },
  active: {
    label: "Active",
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50",
  },
  archived: {
    label: "Archived",
    color: "bg-muted/60 text-muted-foreground border-border/60",
  },
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
  const ownerName = project.owner.name || "Unknown";

  return (
    <>
      {/* Back Button */}
      <div className="flex items-start gap-2">
        <SidebarTrigger className="md:hidden" />
        <Button variant="ghost" asChild className="px-2">
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>

      {/* Project Header */}
      <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6">
          {/* Screenshot */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/40">
            {project.screenshotUrl ? (
              <Image
                src={project.screenshotUrl}
                alt={project.title}
                width={960}
                height={600}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wider text-muted-foreground">
                Project preview
              </div>
            )}
          </div>

          {/* Project Info */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
              <Badge
                variant="outline"
                className={`gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.color}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current/70" />
                {status.label}
              </Badge>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>

            {/* Links */}
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-full px-4">
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Site
                </a>
              </Button>
              {project.githubUrl && (
                <Button asChild variant="outline" size="sm" className="rounded-full px-4">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                <Tag className="mr-2 inline-block h-3.5 w-3.5" />
                {categoryLabels[project.category] || project.category}
              </span>
              <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                <Clock className="mr-2 inline-block h-3.5 w-3.5" />
                {formatDate(project.createdAt)}
              </span>
              <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                <User className="mr-2 inline-block h-3.5 w-3.5" />
                {ownerName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
