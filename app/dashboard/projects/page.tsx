"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  ExternalLink,
  Github,
  Clock,
  CheckCircle2,
  MessageSquare,
  Eye,
  MoreVertical,
  Pencil,
  Tag,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectSubmitModal } from "@/components/dashboard/project-submit-modal";
import { ProjectEditModal } from "@/components/dashboard/project-edit-modal";
import { useCredits } from "@/components/dashboard/dashboard-layout";

interface Project {
  id: string;
  title: string;
  description: string;
  problemSolved: string | null;
  liveUrl: string;
  githubUrl: string | null;
  category: string;
  techStack: string[];
  screenshotUrl: string | null;
  status: string;
  version: string | null;
  reviewsReceived: number;
  reviewsRequired: number;
  createdAt: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Draft",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    icon: <FileText className="h-3 w-3" />,
  },
  pending_review: {
    label: "Pending Review",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    icon: <Clock className="h-3 w-3" />,
  },
  active: {
    label: "Active",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  archived: {
    label: "Archived",
    color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    icon: <FileText className="h-3 w-3" />,
  },
};

function formatDate(dateString: string) {
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

function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig.draft;
  const reviewProgress = Math.min(
    (project.reviewsReceived / project.reviewsRequired) * 100,
    100,
  );

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <div className="flex flex-col md:flex-row">
        {/* Screenshot */}
        <div className="md:w-56 h-36 md:h-auto bg-muted shrink-0 relative">
          {project.screenshotUrl ? (
            <Image
              src={project.screenshotUrl}
              alt={project.title}
              width={224}
              height={144}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <FileText className="h-10 w-10 text-blue-300 dark:text-blue-700" />
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
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="font-semibold text-lg hover:text-blue-600 transition-colors truncate"
                >
                  {project.title}
                </Link>
                <Badge
                  variant="secondary"
                  className={`${status.color} gap-1 shrink-0`}
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
                    className="text-xs py-0.5"
                  >
                    {tech}
                  </Badge>
                ))}
                {project.techStack.length > 5 && (
                  <Badge variant="outline" className="text-xs py-0.5 bg-muted">
                    +{project.techStack.length - 5}
                  </Badge>
                )}
              </div>

              {/* Review Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-48">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                    style={{ width: `${reviewProgress}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {project.reviewsReceived}/{project.reviewsRequired}
                </span>
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Site
                  </a>
                </DropdownMenuItem>
                {project.githubUrl && (
                  <DropdownMenuItem asChild>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span>Submitted {formatDate(project.createdAt)}</span>
            <div className="flex items-center gap-3">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Visit
              </a>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Github className="h-3 w-3" />
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { credits, refreshCredits } = useCredits();

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSuccess = async () => {
    await fetchProjects();
    await refreshCredits();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            My Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your submitted projects and view feedback
          </p>
        </div>
        <Button
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Submit Project
        </Button>
      </div>

      {projects.length === 0 ? (
        /* Empty state */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-4 mb-4">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Submit your first project to get guaranteed feedback from real
              makers. You need credits to submit a project.
            </p>
            <Button onClick={() => setIsSubmitModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Submit Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Project list */
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={setEditingProject}
            />
          ))}
        </div>
      )}

      {/* Submit Modal */}
      <ProjectSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleSuccess}
        credits={credits}
      />

      {/* Edit Modal */}
      <ProjectEditModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSuccess={handleSuccess}
        project={editingProject}
        credits={credits}
      />
    </div>
  );
}
