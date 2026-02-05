"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types
export interface ProjectOwner {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface Review {
  id: string;
  reviewerId: string;
  whatsGood: string;
  whatsUnclear: string;
  improvementSuggestion: string;
  isHelpful: boolean | null;
  ownerReply: string | null;
  submittedAt: string;
  reviewer: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  problemSolved: string;
  liveUrl: string;
  githubUrl: string | null;
  category: string;
  techStack: string[];
  screenshotUrl: string | null;
  status: string;
  reviewsReceived: number;
  reviewsRequired: number;
  createdAt: string;
  owner: ProjectOwner;
  reviews: Review[];
}

// API functions
async function fetchProjectDetail(projectId: string): Promise<ProjectDetail> {
  const res = await fetch(`/api/projects/${projectId}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Project not found");
    throw new Error("Failed to fetch project");
  }
  return res.json();
}

async function fetchCurrentUserId(): Promise<string | null> {
  const res = await fetch("/api/auth/session");
  const data = await res.json();
  return data.user?.id || null;
}

async function markReviewHelpful(
  projectId: string,
  reviewId: string,
  isHelpful: boolean
): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/reviews/${reviewId}/helpful`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isHelpful }),
  });
  if (!res.ok) throw new Error("Failed to record feedback");
}

async function submitReviewReply(
  projectId: string,
  reviewId: string,
  reply: string
): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/reviews/${reviewId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reply }),
  });
  if (!res.ok) throw new Error("Failed to save reply");
}

// Main hook
export function useProjectDetail(projectId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    fetchCurrentUserId().then(setCurrentUserId);
  }, []);

  // Fetch project with reviews
  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project-detail", projectId],
    queryFn: () => fetchProjectDetail(projectId),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Handle error - redirect if not found
  useEffect(() => {
    if (error) {
      if (error.message === "Project not found") {
        toast.error("Project not found");
        router.push("/dashboard/projects");
      } else {
        toast.error("Failed to load project");
      }
    }
  }, [error, router]);

  // Mark helpful mutation
  const helpfulMutation = useMutation({
    mutationFn: ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) =>
      markReviewHelpful(projectId, reviewId, isHelpful),
    onSuccess: (_, { reviewId, isHelpful }) => {
      // Optimistic update
      queryClient.setQueryData<ProjectDetail>(["project-detail", projectId], (old) => {
        if (!old) return old;
        return {
          ...old,
          reviews: old.reviews.map((r) =>
            r.id === reviewId ? { ...r, isHelpful } : r
          ),
        };
      });
      toast.success("Feedback recorded");
    },
    onError: () => {
      toast.error("Failed to record feedback");
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: string }) =>
      submitReviewReply(projectId, reviewId, reply),
    onSuccess: (_, { reviewId, reply }) => {
      // Optimistic update
      queryClient.setQueryData<ProjectDetail>(["project-detail", projectId], (old) => {
        if (!old) return old;
        return {
          ...old,
          reviews: old.reviews.map((r) =>
            r.id === reviewId ? { ...r, ownerReply: reply } : r
          ),
        };
      });
      toast.success("Reply saved");
    },
    onError: () => {
      toast.error("Failed to save reply");
    },
  });

  // Handlers
  const handleMarkHelpful = (reviewId: string, isHelpful: boolean) => {
    helpfulMutation.mutate({ reviewId, isHelpful });
  };

  const handleReply = async (reviewId: string, reply: string) => {
    await replyMutation.mutateAsync({ reviewId, reply });
  };

  // Computed values
  const isOwner = currentUserId === project?.owner.id;

  return {
    project,
    isLoading,
    isOwner,
    handleMarkHelpful,
    handleReply,
  };
}
