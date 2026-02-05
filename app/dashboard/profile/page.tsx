"use client";

import { useProfile } from "@/hooks/profile";
import {
  ProfileHeader,
  ProfileCard,
  SkillsCard,
  StatsCard,
  EditProfileModal,
  ProfilePageSkeleton,
} from "@/components/profile";

export default function ProfilePage() {
  const {
    profile,
    stats,
    isLoading,
    isEditModalOpen,
    openEditModal,
    closeEditModal,
    handleUpdateProfile,
    handleUploadAvatar,
    handleUploadBanner,
    isUpdating,
    isUploadingAvatar,
    isUploadingBanner,
  } = useProfile();

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return (
      <div className="p-6 flex items-center justify-center py-16">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="relative p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_10%_-10%,rgba(59,130,246,0.12),transparent)] dark:bg-[radial-gradient(900px_circle_at_10%_-10%,rgba(59,130,246,0.2),transparent)]" />
      <div className="mx-auto max-w-7xl space-y-6">
        <ProfileHeader onEdit={openEditModal} />

        <div className="flex flex-col gap-6">
          <ProfileCard
            profile={profile}
            onUploadAvatar={handleUploadAvatar}
            onUploadBanner={handleUploadBanner}
            isUploadingAvatar={isUploadingAvatar}
            isUploadingBanner={isUploadingBanner}
          />

          {stats && <StatsCard stats={stats} />}
          <SkillsCard skills={profile.skills || []} />
        </div>

        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          profile={profile}
          onSave={handleUpdateProfile}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
}
