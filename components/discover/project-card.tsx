"use client";

import Link from "next/link";
import { Heart, MessageCircle, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { DiscoverProject } from "@/hooks/discover";

interface ProjectCardProps {
  project: DiscoverProject;
  onLike: (projectId: string) => void;
  onOpenComments?: (project: DiscoverProject) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  saas: "SaaS",
  tool: "Tool",
  app: "App",
  portfolio: "Portfolio",
  api: "API",
  open_source: "Open Source",
  other: "Other",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

export function ProjectCard({ project, onLike, onOpenComments }: ProjectCardProps) {
  return (
    <article className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={project.owner.avatarUrl || undefined} />
            <AvatarFallback className="bg-muted text-foreground/80 text-sm">
              {project.owner.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {project.owner.name || "Anonymous"}
            </span>
            {project.owner.position && (
              <span className="text-xs hidden sm:inline">
                • {project.owner.position}
              </span>
            )}
            <span className="text-muted-foreground">·</span>
            <span className="text-xs">{formatTimeAgo(project.createdAt)}</span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge
              variant="outline"
              className="rounded-full border-border/60 bg-muted/40 text-xs font-medium text-foreground/80"
            >
              {CATEGORY_LABELS[project.category] || project.category}
            </Badge>
            {project.status === "pending_review" && (
              <Badge
                variant="outline"
                className="rounded-full border-amber-200/70 bg-amber-50/70 text-amber-700 text-xs font-medium dark:border-amber-800/60 dark:bg-amber-900/30 dark:text-amber-300"
              >
                Needs Review
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <Link href={`/dashboard/projects/${project.id}`} className="block mt-2 group">
            <h3 className="font-semibold text-base tracking-tight group-hover:text-blue-600 transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {project.description}
            </p>
          </Link>

          {/* Screenshot */}
          {project.screenshotUrl && (
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="mt-4 block rounded-xl overflow-hidden border border-border/60 hover:border-border transition-colors"
            >
              <img
                src={project.screenshotUrl}
                alt={project.title}
                className="w-full h-40 sm:h-48 object-cover"
                loading="lazy"
              />
            </Link>
          )}

          {/* Links */}
          <div className="flex items-center gap-3 mt-4 text-muted-foreground">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs hover:text-blue-600 transition-colors"
                aria-label="Open live site"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs hover:text-foreground transition-colors"
                aria-label="View source on GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Tech Stack */}
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.techStack.slice(0, 4).map((tech) => (
                <Badge
                  key={tech}
                  variant="outline"
                  className="rounded-full border-border/60 bg-muted/40 text-xs font-normal"
                >
                  {tech}
                </Badge>
              ))}
              {project.techStack.length > 4 && (
                <Badge
                  variant="outline"
                  className="rounded-full border-border/60 bg-muted/40 text-xs font-normal"
                >
                  +{project.techStack.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onOpenComments?.(project)}
              aria-label={`Comments ${project.commentCount ?? 0}`}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground mr-2">
              {project.commentCount ?? 0}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className={project.isLiked ? "text-red-600 hover:text-red-700" : "text-muted-foreground hover:text-foreground"}
              onClick={() => onLike(project.id)}
              aria-label={`Likes ${project.likeCount ?? 0}`}
            >
              <Heart className={`h-4 w-4 ${project.isLiked ? "fill-current" : ""}`} />
            </Button>
            <span className={`text-xs ${project.isLiked ? "text-red-600" : "text-muted-foreground"}`}>
              {project.likeCount ?? 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
