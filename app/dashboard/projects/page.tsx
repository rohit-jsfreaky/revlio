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
    <div className="p-6 space-y-6">
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
  );
}
