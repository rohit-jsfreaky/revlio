"use client";

import { useState } from "react";
import { useDiscover, type DiscoverProject } from "@/hooks/discover";
import {
  DiscoverHeader,
  SearchBar,
  CategoryFilterDropdown,
  ProjectCard,
  ProjectListSkeleton,
  EmptyState,
} from "@/components/discover";
import { CommentModal } from "@/components/dashboard/comment-modal";

export default function DiscoverPage() {
  const {
    filteredProjects,
    isLoading,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    handleLike,
    refresh,
  } = useDiscover();

  // Comment modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<DiscoverProject | null>(null);

  const handleOpenComments = (project: DiscoverProject) => {
    setSelectedProject(project);
    setCommentModalOpen(true);
  };

  const handleCloseComments = () => {
    setCommentModalOpen(false);
    setSelectedProject(null);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
  };

  const hasFilters = searchQuery !== "" || categoryFilter !== "all";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10 space-y-4">
        <DiscoverHeader
          title="Fresh Builds"
          subtitle="Discover new projects from the community and give voluntary feedback."
          projectCount={filteredProjects.length}
          isLoading={isLoading}
          onRefresh={refresh}
        />

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search projects, tech stack..."
          />
          <CategoryFilterDropdown value={categoryFilter} onChange={setCategoryFilter} />
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1">
        {isLoading ? (
          <ProjectListSkeleton count={5} />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            type={hasFilters ? "no-results" : "no-projects"}
            searchQuery={searchQuery}
            onClearFilters={hasFilters ? handleClearFilters : undefined}
          />
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onLike={handleLike}
              onOpenComments={handleOpenComments}
            />
          ))
        )}
      </div>

      {/* Comment Modal */}
      {selectedProject && (
        <CommentModal
          isOpen={commentModalOpen}
          onClose={handleCloseComments}
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
          projectOwnerId={selectedProject.owner.id}
        />
      )}
    </div>
  );
}
