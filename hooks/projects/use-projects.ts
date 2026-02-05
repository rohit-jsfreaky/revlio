"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCredits } from "@/components/dashboard/dashboard-layout";

// Types
export interface Project {
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

export interface ProjectFormData {
  title: string;
  description: string;
  problemSolved: string;
  liveUrl: string;
  githubUrl?: string;
  techStack: string[];
  category: string;
  screenshotUrl?: string;
}

export interface ProjectUpdateData extends Partial<ProjectFormData> {
  projectId: string;
  version?: string;
}

// API functions
async function fetchUserProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function createProject(data: ProjectFormData): Promise<{ success: boolean; project?: Project; error?: string }> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function updateProject(data: ProjectUpdateData): Promise<{ success: boolean; project?: Project; versionUpgraded?: boolean; error?: string }> {
  const res = await fetch("/api/projects", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Main hook
export function useProjects() {
  const queryClient = useQueryClient();
  const { credits, refreshCredits } = useCredits();

  // Modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Fetch user's projects with caching
  const {
    data: projects = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user-projects"],
    queryFn: fetchUserProjects,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async (result) => {
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ["user-projects"] });
        await refreshCredits();
        setIsSubmitModalOpen(false);
      }
    },
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: async (result) => {
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ["user-projects"] });
        if (result.versionUpgraded) {
          await refreshCredits();
        }
        setEditingProject(null);
      }
    },
  });

  // Handlers
  const openSubmitModal = () => setIsSubmitModalOpen(true);
  const closeSubmitModal = () => setIsSubmitModalOpen(false);
  const openEditModal = (project: Project) => setEditingProject(project);
  const closeEditModal = () => setEditingProject(null);

  const handleSuccess = async () => {
    await refetch();
    await refreshCredits();
  };

  return {
    // Data
    projects,
    isLoading,
    credits,

    // Modal states
    isSubmitModalOpen,
    editingProject,

    // Modal handlers
    openSubmitModal,
    closeSubmitModal,
    openEditModal,
    closeEditModal,

    // Actions
    handleSuccess,
    refetch,

    // Mutation states (for loading indicators if needed)
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

// Re-export types
export type { Project as UserProject };
