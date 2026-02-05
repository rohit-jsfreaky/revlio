"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types
export interface ProjectOwner {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  position: string | null;
}

export interface DiscoverProject {
  id: string;
  title: string;
  description: string;
  problemSolved: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  category: string;
  techStack: string[];
  screenshotUrl: string | null;
  status: string;
  createdAt: string;
  owner: ProjectOwner;
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
}

export type CategoryFilter = "all" | "saas" | "tool" | "app" | "portfolio" | "api" | "open_source" | "other";

interface UseDiscoverOptions {
  initialCategory?: CategoryFilter;
}

interface UseDiscoverReturn {
  // Data
  projects: DiscoverProject[];
  filteredProjects: DiscoverProject[];
  isLoading: boolean;
  hasMore: boolean;
  
  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (category: CategoryFilter) => void;
  
  // Actions
  handleLike: (projectId: string) => void;
  loadMore: () => void;
  refresh: () => void;
}

export function useDiscover(options: UseDiscoverOptions = {}): UseDiscoverReturn {
  const { initialCategory = "all" } = options;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(initialCategory);
  const [offset, setOffset] = useState(0);
  
  const queryClient = useQueryClient();
  
  // Debounce timers for like mutations
  const likeTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingLikesRef = useRef<Map<string, boolean>>(new Map());

  // Fetch discover projects
  const { data, isLoading } = useQuery({
    queryKey: ["discover-projects", offset],
    queryFn: async () => {
      const res = await fetch(`/api/projects/feed?type=pulse&limit=20&offset=${offset}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const projects: DiscoverProject[] = data?.projects || [];
  const hasMore = data?.hasMore || false;

  // Filter projects based on search and category
  const filteredProjects = projects.filter((project) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Like mutation with debounce
  const likeMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error("Failed to like");
      return res.json();
    },
    onSuccess: (data, projectId) => {
      queryClient.setQueryData(["discover-projects", offset], (old: { projects: DiscoverProject[]; hasMore: boolean } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          projects: old.projects.map((p) =>
            p.id === projectId
              ? { ...p, isLiked: data.liked, likeCount: data.likeCount }
              : p
          ),
        };
      });
      pendingLikesRef.current.delete(projectId);
    },
    onError: (err, projectId) => {
      // Revert optimistic update
      queryClient.setQueryData(["discover-projects", offset], (old: { projects: DiscoverProject[]; hasMore: boolean } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          projects: old.projects.map((p) =>
            p.id === projectId
              ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
              : p
          ),
        };
      });
      pendingLikesRef.current.delete(projectId);
      toast.error("Failed to like project");
    },
  });

  const handleLike = useCallback((projectId: string) => {
    // Clear existing timer
    const existingTimer = likeTimersRef.current.get(projectId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Instant optimistic UI update
    queryClient.setQueryData(["discover-projects", offset], (old: { projects: DiscoverProject[]; hasMore: boolean } | undefined) => {
      if (!old) return old;
      return {
        ...old,
        projects: old.projects.map((p) =>
          p.id === projectId
            ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        ),
      };
    });

    // Debounce API call (300ms)
    const timer = setTimeout(() => {
      if (!pendingLikesRef.current.get(projectId)) {
        pendingLikesRef.current.set(projectId, true);
        likeMutation.mutate(projectId);
      }
      likeTimersRef.current.delete(projectId);
    }, 300);

    likeTimersRef.current.set(projectId, timer);
  }, [likeMutation, queryClient, offset]);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setOffset((prev) => prev + 20);
    }
  }, [hasMore]);

  const refresh = useCallback(() => {
    setOffset(0);
    queryClient.invalidateQueries({ queryKey: ["discover-projects"] });
  }, [queryClient]);

  return {
    projects,
    filteredProjects,
    isLoading,
    hasMore,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    handleLike,
    loadMore,
    refresh,
  };
}
