"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { positionLabels, type UserProfile } from "@/hooks/profile";
import { toast } from "sonner";

interface ProfileCardProps {
  profile: UserProfile;
  onUploadAvatar: (file: File) => void;
  onUploadBanner: (file: File) => void;
  isUploadingAvatar: boolean;
  isUploadingBanner: boolean;
}

export function ProfileCard({
  profile,
  onUploadAvatar,
  onUploadBanner,
  isUploadingAvatar,
  isUploadingBanner,
}: ProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const isValidImage = (file: File) => {
    if (file.type && !file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB.");
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isValidImage(file)) {
        e.currentTarget.value = "";
        return;
      }
      onUploadAvatar(file);
    }
    e.currentTarget.value = "";
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Banner file input changed", e.target.files);
    const file = e.target.files?.[0];
    console.log("Selected banner file:", file);
    if (file) {
      if (!isValidImage(file)) {
        e.currentTarget.value = "";
        return;
      }
      onUploadBanner(file);
    }
    e.currentTarget.value = "";
  };

  const positionLabel = profile.position
    ? positionLabels[profile.position] ||
      profile.position
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
    : null;

  return (
    <Card className="relative overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] pt-0">
      <div className="relative h-28 sm:h-36 overflow-hidden">
        {profile.bannerUrl ? (
          <img
            src={profile.bannerUrl}
            alt={`${profile.name || "Profile"} banner`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-800 to-slate-700" />
            <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_20%_-20%,rgba(56,189,248,0.45),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(500px_circle_at_80%_20%,rgba(99,102,241,0.35),transparent)]" />
            <div className="absolute inset-0 opacity-30 bg-[linear-gradient(120deg,rgba(15,23,42,0.8),rgba(15,23,42,0.2),rgba(15,23,42,0.85))]" />
          </>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => bannerInputRef.current?.click()}
          disabled={isUploadingBanner}
          className="absolute right-4 top-4 h-8 rounded-full border-white/30 bg-white/90 text-xs font-medium text-slate-900 shadow-sm hover:bg-white"
        >
          {isUploadingBanner ? "Uploading..." : "Change banner"}
        </Button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerChange}
        />
      </div>
      <CardContent className="-mt-12 sm:-mt-14">
        <div className="grid gap-6 sm:grid-cols-[auto,1fr] sm:items-end">
          <div className="flex flex-col items-start gap-3">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-background shadow-lg">
              <AvatarImage
                src={profile.avatarUrl || undefined}
                alt={profile.name || ""}
              />
              <AvatarFallback className="text-xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {profile.name?.charAt(0)?.toUpperCase() ||
                  profile.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="w-full rounded-full border-border/60"
            >
              {isUploadingAvatar ? "Uploading..." : "Change photo"}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold sm:text-2xl">
                {profile.name || "Anonymous"}
              </h2>
              {positionLabel && (
                <p className="text-sm text-muted-foreground">{positionLabel}</p>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-foreground/80 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-foreground/80">
                {profile.email}
              </span>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-foreground/80 hover:bg-muted/70 transition-colors"
                >
                  {(() => {
                    try {
                      return new URL(profile.website).hostname;
                    } catch {
                      return profile.website;
                    }
                  })()}
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
