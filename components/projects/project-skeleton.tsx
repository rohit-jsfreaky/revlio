"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <div className="border rounded-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Screenshot skeleton */}
        <Skeleton className="md:w-60 h-40 md:h-auto" />
        
        {/* Content skeleton */}
        <div className="flex-1 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          
          {/* Tech stack skeleton */}
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-20" />
          </div>
          
          {/* Progress skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-2 w-48" />
            <Skeleton className="h-4 w-12" />
          </div>
          
          {/* Footer skeleton */}
          <div className="flex items-center justify-between pt-3 border-t">
            <Skeleton className="h-3 w-32" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProjectListSkeletonProps {
  count?: number;
}

export function ProjectListSkeleton({ count = 3 }: ProjectListSkeletonProps) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProjectsPageSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <ProjectListSkeleton count={3} />
    </div>
  );
}
