"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  ExternalLink,
  Github,
  Clock,
  CheckCircle2,
  MessageSquare,
  Eye,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/hooks/projects";

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: {
    label: "Draft",
    color: "bg-muted/60 text-foreground/70 border-border/60",
    icon: <FileText className="h-3 w-3" />,
  },
  pending_review: {
    label: "Pending Review",
    color: "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50",
    icon: <Clock className="h-3 w-3" />,
  },
  active: {
    label: "Active",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  archived: {
    label: "Archived",
    color: "bg-muted/60 text-muted-foreground border-border/60",
    icon: <FileText className="h-3 w-3" />,
  },
};

// Helper function
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig.draft;
  const reviewProgress = Math.min(
    (project.reviewsReceived / project.reviewsRequired) * 100,
    100
  );

  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-sm transition-shadow hover:shadow-md gap-0 p-0">
      <div className="flex flex-col md:flex-row">
        {/* Screenshot */}
        <div className="md:w-60 h-40 md:h-auto bg-muted shrink-0 relative">
          {project.screenshotUrl ? (
            <Image
              src={project.screenshotUrl}
              alt={project.title}
              width={224}
              height={144}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Project preview
              </span>
            </div>
          )}
          {/* Version badge */}
          {project.version && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-black/60 text-white border-0 text-[10px]"
            >
              v{project.version}
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="font-semibold text-lg tracking-tight hover:text-blue-600 transition-colors truncate"
                >
                  {project.title}
                </Link>
                <Badge
                  variant="outline"
                  className={`shrink-0 gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.color}`}
                >
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.techStack.slice(0, 5).map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="text-xs py-0.5 rounded-full border-border/60 bg-muted/40"
                  >
                    {tech}
                  </Badge>
                ))}
                {project.techStack.length > 5 && (
                  <Badge
                    variant="outline"
                    className="text-xs py-0.5 rounded-full border-border/60 bg-muted/40"
                  >
                    +{project.techStack.length - 5}
                  </Badge>
                )}
              </div>

              {/* Review Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted/70 rounded-full overflow-hidden max-w-48">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500/80 to-indigo-500/80 transition-all"
                    style={{ width: `${reviewProgress}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {project.reviewsReceived}/{project.reviewsRequired}
                </span>
              </div>
            </div>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-full border-border/60"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Site
                  </a>
                </DropdownMenuItem>
                {project.githubUrl && (
                  <DropdownMenuItem asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
            <span>Submitted {formatDate(project.createdAt)}</span>
            <div className="flex items-center gap-3">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Visit
              </a>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
