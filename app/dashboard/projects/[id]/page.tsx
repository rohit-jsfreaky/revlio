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
    <div className="p-6 space-y-6">
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
  );
}