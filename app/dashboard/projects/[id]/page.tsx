"use client";

import { use } from "react";
import { useProjectDetail } from "@/hooks/project-detail";
import {
  ProjectDetailHeader,
  ProjectInfoCards,
  ReviewList,
  ProjectDetailSkeleton,
} from "@/components/project-detail";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { project, isLoading, isOwner, handleMarkHelpful, handleReply } = useProjectDetail(id);

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    return null;
  }

  return (
    <div className="relative p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_10%_-10%,rgba(59,130,246,0.12),transparent)] dark:bg-[radial-gradient(900px_circle_at_10%_-10%,rgba(59,130,246,0.2),transparent)]" />
      <div className="mx-auto max-w-6xl space-y-6">
        <ProjectDetailHeader project={project} />

        <ProjectInfoCards project={project} />

        <ReviewList
          reviews={project.reviews}
          reviewsReceived={project.reviewsReceived}
          reviewsRequired={project.reviewsRequired}
          isOwner={isOwner}
          onMarkHelpful={handleMarkHelpful}
          onReply={handleReply}
        />
      </div>
    </div>
  );
}
