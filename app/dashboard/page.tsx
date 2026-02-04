"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  ExternalLink,
  MessageCircle,
  Heart,
  Share2,
  Image as ImageIcon,
  LinkIcon,
  Tag,
  Zap,
  Activity,
  ClipboardList,
  Github,
  Plus,
  Users,
  TrendingUp,
  Loader2,
  Copy,
  Check,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ProjectSubmitModal } from "@/components/dashboard/project-submit-modal";
import { CommentModal } from "@/components/dashboard/comment-modal";
import { useCredits } from "@/components/dashboard/dashboard-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  liveUrl: string | null;
  githubUrl: string | null;
  category: string;
  techStack: string[];
  screenshotUrl: string | null;
  status: string;
  reviewsReceived: number;
  createdAt: string;
  owner: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    position: string | null;
  };
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
}

// Format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

// Composer component for triggering submit modal
function PostComposer({
  user,
  onOpenModal,
}: {
  user: UserData | null;
  onOpenModal: () => void;
}) {
  return (
    <div className="p-3 sm:p-4 border-b border-border bg-card/30">
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Build Update</p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Share your project and get real feedback.
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] sm:text-xs shrink-0"
        >
          Live
        </Badge>
      </div>
      <div className="flex gap-2 sm:gap-3">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
          <AvatarImage
            src={user?.avatarUrl || undefined}
            alt={user?.name || ""}
          />
          <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <button
            onClick={onOpenModal}
            className="w-full text-left min-h-16 sm:min-h-20 border border-border/60 rounded-lg bg-background px-3 sm:px-4 py-2 sm:py-3 text-sm text-muted-foreground hover:border-border transition-colors"
          >
            What did you ship today? Click to submit your project...
          </button>
          <div className="flex items-center justify-between mt-2 sm:mt-3 gap-2">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                onClick={onOpenModal}
              >
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                onClick={onOpenModal}
              >
                <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                onClick={onOpenModal}
              >
                <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            <Button
              onClick={onOpenModal}
              size="sm"
              className="rounded-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3 sm:px-5 text-xs sm:text-sm gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Publish</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tabs for switching between feed views
function FeedTabs({
  activeTab,
  onTabChange,
  projectCount,
  isLoading,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  projectCount: number;
  isLoading: boolean;
}) {
  const tabs = [
    { id: "pulse", label: "Pulse", icon: Zap, description: "Latest builds" },
    { id: "circle", label: "Circle", icon: Users, description: "Following" },
    { id: "momentum", label: "Momentum", icon: TrendingUp, description: "Trending" },
  ];

  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border">
      <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="lg:hidden h-8 w-8 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold">Build Stream</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Real-time updates from builders
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          )}
          <span className="hidden sm:inline">Live feed</span>
          {projectCount > 0 && !isLoading && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-[10px] py-0 px-1.5"
            >
              {projectCount}
            </Badge>
          )}
        </div>
      </div>
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Project card in feed style
function ProjectFeedCard({
  project,
  currentUserId,
  onLike,
  onOpenComments,
  followingIds,
  onFollow,
}: {
  project: Project;
  currentUserId?: string;
  onLike: (projectId: string) => void;
  onOpenComments: (project: Project) => void;
  followingIds: Set<string>;
  onFollow: (userId: string) => void;
}) {
  const [isLiked, setIsLiked] = useState(project.isLiked);
  const [likeCount, setLikeCount] = useState(project.likeCount);
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(
    followingIds.has(project.owner.id)
  );
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [unfollowOpen, setUnfollowOpen] = useState(false);

  const isOwnProject = currentUserId === project.owner.id;

  const categoryLabels: Record<string, string> = {
    saas: "SaaS",
    tool: "Tool",
    app: "App",
    portfolio: "Portfolio",
    api: "API",
    open_source: "Open Source",
    other: "Other",
  };

  const handleLike = async () => {
    if (!currentUserId) return;

    const prevLiked = isLiked;
    const prevCount = likeCount;

    // Optimistic update
    setIsLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));

    try {
      await onLike(project.id);
    } catch {
      // Revert on error
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/dashboard/projects/${project.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.description,
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId || isOwnProject || isFollowLoading) return;

    setIsFollowLoading(true);
    setIsFollowing(!isFollowing);

    try {
      await onFollow(project.owner.id);
    } catch {
      setIsFollowing(isFollowing);
    } finally {
      setIsFollowLoading(false);
    }
  };

  useEffect(() => {
    setIsFollowing(followingIds.has(project.owner.id));
  }, [followingIds, project.owner.id]);

  return (
    <article className="px-3 py-2 sm:p-4">
      <div className="rounded-xl border border-border/50 bg-card/70 p-3 sm:p-4 hover:border-border hover:shadow-sm transition-all">
        <div className="flex gap-2 sm:gap-3">
          <div className="shrink-0">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
              <AvatarImage src={project.owner.avatarUrl || undefined} />
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-sm">
                {project.owner.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap text-sm min-w-0">
                <span className="font-semibold hover:underline cursor-pointer truncate">
                  {project.owner.name || "Anonymous"}
                </span>
                {project.owner.position && (
                  <span className="text-muted-foreground text-xs sm:text-sm hidden sm:inline">
                    • {project.owner.position}
                  </span>
                )}
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground text-xs sm:text-sm">
                  {formatTimeAgo(project.createdAt)}
                </span>
              </div>
              {/* Follow button */}
              {currentUserId && !isOwnProject && (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={() => {
                    if (isFollowing) {
                      setUnfollowOpen(true);
                    } else {
                      handleFollow();
                    }
                  }}
                  disabled={isFollowLoading}
                  className={`rounded-full h-7 px-3 text-xs shrink-0 ${
                    isFollowing
                      ? "border-border"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isFollowLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Follow</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            <AlertDialog open={unfollowOpen} onOpenChange={setUnfollowOpen}>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Unfollow user?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will stop seeing their projects in your Circle feed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleFollow}
                  >
                    Unfollow
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Badges */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] sm:text-xs"
              >
                {categoryLabels[project.category] || project.category}
              </Badge>
              {project.status === "pending_review" && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] sm:text-xs"
                >
                  Needs Review
                </Badge>
              )}
            </div>

            {/* Content */}
            <Link href={`/dashboard/projects/${project.id}`}>
              <h3 className="font-semibold text-sm sm:text-base mt-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {project.title}
              </h3>
            </Link>
            <p className="text-foreground/90 mt-1 leading-relaxed text-sm line-clamp-3">
              {project.description}
            </p>

            {/* Screenshot preview */}
            {project.screenshotUrl && (
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="mt-3 block rounded-lg overflow-hidden border border-border/50 hover:border-border transition-colors"
              >
                <img
                  src={project.screenshotUrl}
                  alt={project.title}
                  className="w-full h-40 sm:h-48 object-cover"
                  loading="lazy"
                />
              </Link>
            )}

            {/* Link preview */}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block border border-border/50 rounded-lg overflow-hidden hover:bg-muted/50 transition-colors"
              >
                <div className="p-3 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-blue-600 dark:text-blue-400 truncate">
                    {(() => {
                      try {
                        return new URL(project.liveUrl).hostname;
                      } catch {
                        return project.liveUrl;
                      }
                    })()}
                  </span>
                </div>
              </a>
            )}

            {/* GitHub link */}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>View source</span>
              </a>
            )}

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.techStack.slice(0, 5).map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="text-[10px] sm:text-xs rounded-full"
                  >
                    {tech}
                  </Badge>
                ))}
                {project.techStack.length > 5 && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs rounded-full">
                    +{project.techStack.length - 5}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 max-w-md">
              {/* Comments */}
              <button
                onClick={() => onOpenComments(project)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                {project.commentCount > 0 && (
                  <span className="text-xs sm:text-sm">{project.commentCount}</span>
                )}
              </button>

              {/* Likes */}
              <button
                onClick={handleLike}
                disabled={!currentUserId}
                className={`flex items-center gap-1.5 transition-colors group ${
                  isLiked
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
                }`}
              >
                <div
                  className={`p-2 rounded-full transition-colors ${
                    isLiked
                      ? "bg-rose-50 dark:bg-rose-900/30"
                      : "group-hover:bg-rose-50 dark:group-hover:bg-rose-900/30"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform ${
                      isLiked ? "fill-current scale-110" : ""
                    }`}
                  />
                </div>
                {likeCount > 0 && (
                  <span className="text-xs sm:text-sm">{likeCount}</span>
                )}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                  {copied ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  ) : (
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
              </button>

              {/* Reviews */}
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/30 transition-colors">
                  <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                {project.reviewsReceived > 0 && (
                  <span className="text-xs sm:text-sm">{project.reviewsReceived}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// Empty state component
function EmptyState({
  type,
  onOpenModal,
}: {
  type: string;
  onOpenModal: () => void;
}) {
  const content = {
    pulse: {
      icon: Sparkles,
      title: "Welcome to Revlio!",
      description:
        "Be the first to share your project and get guaranteed feedback from the community.",
      showActions: true,
    },
    circle: {
      icon: Users,
      title: "Your Circle is Empty",
      description:
        "Follow other builders to see their projects here. Explore the Pulse feed to find interesting people!",
      showActions: false,
    },
    momentum: {
      icon: TrendingUp,
      title: "No Trending Projects Yet",
      description:
        "Projects with the most engagement will appear here. Be the first to make waves!",
      showActions: true,
    },
  };

  const { icon: Icon, title, description, showActions } =
    content[type as keyof typeof content] || content.pulse;

  return (
    <div className="p-8 text-center">
      <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-4 mb-4 w-fit mx-auto">
        <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">{description}</p>
      {showActions && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onOpenModal}>
            <Plus className="mr-2 h-4 w-4" />
            Submit Project
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/reviews">
              <ClipboardList className="mr-2 h-4 w-4" />
              Start Reviewing
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

// Loading skeleton for feed
function FeedSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-2 sm:p-4">
          <div className="rounded-2xl border border-border bg-card/70 p-3 sm:p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("pulse");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { credits, refreshCredits } = useCredits();
  const queryClient = useQueryClient();
  
  // Debounce timers for like mutations
  const likeTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingLikesRef = useRef<Map<string, boolean>>(new Map());

  // Fetch feed with caching
  const { data: feedData, isLoading } = useQuery({
    queryKey: ["projects-feed", activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/projects/feed?type=${activeTab}`);
      if (!res.ok) throw new Error("Failed to load feed");
      const data = await res.json();
      return data.projects || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const projects = feedData || [];

  // Fetch following IDs with caching
  const { data: followingData } = useQuery({
    queryKey: ["following-ids"],
    queryFn: async () => {
      const res = await fetch("/api/follows?type=following-ids");
      if (!res.ok) throw new Error("Failed to load following");
      const data = await res.json();
      return data.followingIds || [];
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const followingIds = new Set<string>(followingData || []);

  useEffect(() => {
    async function loadUser() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated && sessionData.user) {
          setUser(sessionData.user);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }
    loadUser();

    // Cleanup timers on unmount
    return () => {
      likeTimersRef.current.forEach((timer) => clearTimeout(timer));
      likeTimersRef.current.clear();
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleProjectSubmitSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["projects-feed"] });
    refreshCredits();
  };

  const likeMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error("Failed to like");
      return res.json();
    },
    onSuccess: (data, projectId) => {
      // Update cache with actual server state
      queryClient.setQueryData(["projects-feed", activeTab], (old: Project[]) =>
        old.map((p) =>
          p.id === projectId
            ? { ...p, isLiked: data.liked, likeCount: data.likeCount }
            : p
        )
      );
      pendingLikesRef.current.delete(projectId);
    },
    onError: (err, projectId) => {
      // Revert optimistic update on error
      queryClient.setQueryData(["projects-feed", activeTab], (old: Project[]) =>
        old.map((p) =>
          p.id === projectId
            ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        )
      );
      pendingLikesRef.current.delete(projectId);
      toast.error("Failed to like project");
    },
  });

  const handleLike = (projectId: string) => {
    // Clear existing timer for this project
    const existingTimer = likeTimersRef.current.get(projectId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Instant optimistic UI update
    queryClient.setQueryData(["projects-feed", activeTab], (old: Project[]) =>
      old.map((p) =>
        p.id === projectId
          ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );

    // Debounce the actual API call (300ms)
    const timer = setTimeout(() => {
      // Only send API request if not already pending
      if (!pendingLikesRef.current.get(projectId)) {
        pendingLikesRef.current.set(projectId, true);
        likeMutation.mutate(projectId);
      }
      likeTimersRef.current.delete(projectId);
    }, 300);

    likeTimersRef.current.set(projectId, timer);
  };

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to follow");
      return res.json();
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["following-ids"] });
      const previous = queryClient.getQueryData(["following-ids"]);
      queryClient.setQueryData(["following-ids"], (old: string[] = []) => {
        const isFollowing = old.includes(userId);
        return isFollowing ? old.filter((id) => id !== userId) : [...old, userId];
      });
      return { previous };
    },
    onError: (err, userId, context) => {
      queryClient.setQueryData(["following-ids"], context?.previous);
      toast.error("Failed to follow");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["following-ids"] });
      queryClient.invalidateQueries({ queryKey: ["projects-feed", "circle"] });
      toast.success(data.following ? "Following!" : "Unfollowed");
    },
  });

  const handleFollow = (userId: string) => {
    followMutation.mutate(userId);
  };

  const handleOpenComments = (project: Project) => {
    setSelectedProject(project);
    setCommentModalOpen(true);
  };

  const handleCommentCountChange = (count: number) => {
    if (!selectedProject) return;
    queryClient.setQueryData(["projects-feed", activeTab], (old: Project[]) =>
      old.map((p) =>
        p.id === selectedProject.id ? { ...p, commentCount: count } : p
      )
    );
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex flex-col w-full overflow-x-hidden">
        <FeedTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          projectCount={0}
          isLoading={true}
        />
        <div className="border-b border-border p-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          </div>
        </div>
        <FeedSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* Feed Tabs */}
      <FeedTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        projectCount={projects.length}
        isLoading={isLoading}
      />

      {/* Composer */}
      <PostComposer user={user} onOpenModal={() => setIsModalOpen(true)} />

      {/* Feed */}
      <div className="flex flex-col pb-8">
        {isLoading ? (
          <FeedSkeleton />
        ) : projects.length === 0 ? (
          <EmptyState type={activeTab} onOpenModal={() => setIsModalOpen(true)} />
        ) : (
          projects.map((project: Project) => (
            <ProjectFeedCard
              key={project.id}
              project={project}
              currentUserId={user?.id}
              onLike={handleLike}
              onOpenComments={handleOpenComments}
              followingIds={followingIds}
              onFollow={handleFollow}
            />
          ))
        )}
      </div>

      {/* Submit Modal */}
      <ProjectSubmitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectSubmitSuccess}
        credits={credits}
      />

      {/* Comment Modal */}
      {selectedProject && (
        <CommentModal
          isOpen={commentModalOpen}
          onClose={() => {
            setCommentModalOpen(false);
            setSelectedProject(null);
          }}
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
          projectOwnerId={selectedProject.owner.id}
          currentUserId={user?.id}
          onCommentCountChange={handleCommentCountChange}
        />
      )}
    </div>
  );
}
