"use client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ProfileHeaderProps {
  onEdit: () => void;
}

export function ProfileHeader({ onEdit }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Profile</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Manage how your profile appears to others and keep your presence polished.
          </p>
        </div>
      </div>
      <Button
        onClick={onEdit}
        variant="outline"
        className="w-full sm:w-auto rounded-full border-border/60 px-5"
      >
        Edit Profile
      </Button>
    </div>
  );
}
