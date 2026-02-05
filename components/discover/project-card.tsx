"use client";

import Link from "next/link";
import {
  Heart,
  MessageCircle,
  ExternalLink,
  Github,
} from "lucide-react";
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
    <article className="p-4 border-b border-border hover:bg-muted/30 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={project.owner.avatarUrl || undefined} />
            <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-sm">
              {project.owner.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="font-semibold hover:underline cursor-pointer">
              {project.owner.name || "Anonymous"}
            </span>
            {project.owner.position && (
              <span className="text-muted-foreground text-xs hidden sm:inline">
                • {project.owner.position}
              </span>
            )}
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground text-xs">
              {formatTimeAgo(project.createdAt)}
            </span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs"
            >
              {CATEGORY_LABELS[project.category] || project.category}
            </Badge>
            {project.status === "pending_review" && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs"
              >
                Needs Review
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <Link href={`/dashboard/projects/${project.id}`} className="block mt-2 group">
            <h3 className="font-semibold text-base group-hover:text-blue-600 transition-colors">
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
              className="mt-3 block rounded-lg overflow-hidden border border-border/50 hover:border-border transition-colors"
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
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {(() => {
                  try {
                    return new URL(project.liveUrl).hostname;
                  } catch {
                    return "Live";
                  }
                })()}
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                View source
              </a>
            )}
          </div>

          {/* Tech Stack */}
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.techStack.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs font-normal">
                  {tech}
                </Badge>
              ))}
              {project.techStack.length > 4 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{project.techStack.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3 -ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => onOpenComments?.(project)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{project.commentCount || ""}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 gap-1.5 ${
                project.isLiked
                  ? "text-red-600 hover:text-red-700"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onLike(project.id)}
            >
              <Heart className={`h-4 w-4 ${project.isLiked ? "fill-current" : ""}`} />
              <span className="text-xs">{project.likeCount || ""}</span>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
