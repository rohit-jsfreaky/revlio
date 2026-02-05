"use client";

import { useProjects } from "@/hooks/projects";
import {
  ProjectsHeader,
  ProjectList,
  ProjectsPageSkeleton,
  ProjectsEmptyState,
} from "@/components/projects";
import { ProjectSubmitModal } from "@/components/dashboard/project-submit-modal";
import { ProjectEditModal } from "@/components/dashboard/project-edit-modal";

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    credits,
    isSubmitModalOpen,
    editingProject,
    openSubmitModal,
    closeSubmitModal,
    openEditModal,
    closeEditModal,
    handleSuccess,
  } = useProjects();

  if (isLoading) {
    return <ProjectsPageSkeleton />;
  }

  return (
    <div className="relative p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_10%_-10%,rgba(59,130,246,0.12),transparent)] dark:bg-[radial-gradient(900px_circle_at_10%_-10%,rgba(59,130,246,0.2),transparent)]" />
      <div className="mx-auto max-w-6xl space-y-6">
        <ProjectsHeader onSubmitProject={openSubmitModal} />

        {projects.length === 0 ? (
          <ProjectsEmptyState onSubmitProject={openSubmitModal} />
        ) : (
          <ProjectList projects={projects} onEdit={openEditModal} />
        )}

        {/* Submit Modal */}
        <ProjectSubmitModal
          isOpen={isSubmitModalOpen}
          onClose={closeSubmitModal}
          onSuccess={handleSuccess}
          credits={credits}
        />

        {/* Edit Modal */}
        <ProjectEditModal
          isOpen={!!editingProject}
          onClose={closeEditModal}
          onSuccess={handleSuccess}
          project={editingProject}
          credits={credits}
        />
      </div>
    </div>
  );
}
