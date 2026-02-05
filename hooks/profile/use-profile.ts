"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  bio: string | null;
  website: string | null;
  position: string | null;
  skills: string[];
  avatarUrl: string | null;
  bannerUrl: string | null;
  createdAt: string;
}

export interface ProfileStats {
  projectsCount: number;
  reviewsCount: number;
  helpfulCount: number;
  score: number;
}

export interface ProfileUpdateData {
  name?: string;
  bio?: string;
  website?: string;
  position?: string;
  skills?: string[];
  avatarUrl?: string;
  bannerUrl?: string;
}

// API functions
async function fetchProfile(): Promise<{ profile: UserProfile; stats: ProfileStats }> {
  const res = await fetch("/api/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

async function updateProfile(data: ProfileUpdateData): Promise<{ profile: UserProfile }> {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update profile");
  }
  return res.json();
}

async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload/avatar", {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload avatar");
  }
  
  const data = await res.json();
  return data.url;
}

async function uploadBanner(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload/banner", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload banner");
  }

  const data = await res.json();
  return data.url;
}

// Position labels
export const positionLabels: Record<string, string> = {
  "frontend-developer": "Frontend Developer",
  "backend-developer": "Backend Developer",
  "fullstack-developer": "Fullstack Developer",
  "mobile-developer": "Mobile Developer",
  "designer": "Designer",
  "product-manager": "Product Manager",
  "founder": "Founder / Entrepreneur",
  "student": "Student",
  "other": "Other",
};

// Main hook
export function useProfile() {
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch profile with stats
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchProfile,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      queryClient.setQueryData(["user-profile"], (old: { profile: UserProfile; stats: ProfileStats } | undefined) => {
        if (!old) return old;
        return { ...old, profile: result.profile };
      });
      toast.success("Profile updated successfully");
      setIsEditModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Upload avatar mutation
  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: async (url) => {
      // Update profile with new avatar URL
      await updateMutation.mutateAsync({ avatarUrl: url });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Upload banner mutation
  const bannerMutation = useMutation({
    mutationFn: uploadBanner,
    onSuccess: async (url) => {
      // Update profile with new banner URL
      await updateMutation.mutateAsync({ bannerUrl: url });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleUpdateProfile = (data: ProfileUpdateData) => {
    updateMutation.mutate(data);
  };

  const handleUploadAvatar = (file: File) => {
    avatarMutation.mutate(file);
  };

  const handleUploadBanner = (file: File) => {
    bannerMutation.mutate(file);
  };

  return {
    profile: data?.profile,
    stats: data?.stats,
    isLoading,
    error,
    
    // Edit modal state
    isEditModalOpen,
    openEditModal,
    closeEditModal,
    
    // Actions
    handleUpdateProfile,
    handleUploadAvatar,
    handleUploadBanner,
    refetch,
    
    // Loading states
    isUpdating: updateMutation.isPending,
    isUploadingAvatar: avatarMutation.isPending,
    isUploadingBanner: bannerMutation.isPending,
  };
}
