"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft,
  ExternalLink,
  Github,
  Clock,
  CheckCircle2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Reply,
  FileText,
  Layers,
  Tag,
  User,
  Loader2,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ProjectOwner {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

interface Review {
  id: string;
  reviewerId: string;
  whatsGood: string;
  whatsUnclear: string;
  improvementSuggestion: string;
  isHelpful: boolean | null;
  ownerReply: string | null;
  submittedAt: string;
  reviewer: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface Project {
  id: string;
  title: string;
  description: string;
  problemSolved: string;
  liveUrl: string;
  githubUrl: string | null;
  category: string;
  techStack: string[];
  screenshotUrl: string | null;
  status: string;
  reviewsReceived: number;
  reviewsRequired: number;
  createdAt: string;
  owner: ProjectOwner;
  reviews: Review[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  pending_review: { label: "Pending Review", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  active: { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
  archived: { label: "Archived", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
};

const categoryLabels: Record<string, string> = {
  saas: "SaaS",
  tool: "Developer Tool",
  app: "Mobile/Web App",
  portfolio: "Portfolio",
  api: "API/Backend",
  open_source: "Open Source",
  other: "Other",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    month: "long", 
    day: "numeric",
    year: "numeric"
  });
}

function ReviewCard({ 
  review, 
  isOwner, 
  onMarkHelpful,
  onReply 
}: { 
  review: Review; 
  isOwner: boolean;
  onMarkHelpful: (reviewId: string, helpful: boolean) => void;
  onReply: (reviewId: string, reply: string) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState(review.ownerReply || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    await onReply(review.id, replyText);
    setIsSubmitting(false);
    setShowReplyForm(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Reviewer Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.reviewer.avatarUrl || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {review.reviewer.name?.charAt(0) || "R"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{review.reviewer.name || "Anonymous"}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(review.submittedAt)}
              </p>
            </div>
          </div>
          {isOwner && (
            <div className="flex items-center gap-1">
              <Button
                variant={review.isHelpful === true ? "default" : "outline"}
                size="sm"
                className={review.isHelpful === true ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={() => onMarkHelpful(review.id, true)}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant={review.isHelpful === false ? "default" : "outline"}
                size="sm"
                className={review.isHelpful === false ? "bg-red-600 hover:bg-red-700" : ""}
                onClick={() => onMarkHelpful(review.id, false)}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Review Sections */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              What&apos;s Good
            </h4>
            <p className="text-green-700 dark:text-green-300 text-sm">{review.whatsGood}</p>
          </div>

          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              What&apos;s Unclear
            </h4>
            <p className="text-amber-700 dark:text-amber-300 text-sm">{review.whatsUnclear}</p>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Improvement Suggestions
            </h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm">{review.improvementSuggestion}</p>
          </div>
        </div>

        {/* Owner Reply */}
        {review.ownerReply && !showReplyForm && (
          <div className="mt-4 p-4 rounded-lg bg-muted border-l-4 border-blue-600">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Reply className="h-3 w-3" />
              Owner Response
            </p>
            <p className="text-sm">{review.ownerReply}</p>
          </div>
        )}

        {/* Reply Form */}
        {isOwner && (
          <div className="mt-4">
            {showReplyForm ? (
              <div className="space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your response to this review..."
                  className="min-h-20"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={isSubmitting || !replyText.trim()}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                    Send Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReplyForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowReplyForm(true)}>
                <Reply className="h-4 w-4 mr-2" />
                {review.ownerReply ? "Edit Reply" : "Reply"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch session to get current user
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        setCurrentUserId(sessionData.user?.id || null);

        // Fetch project with reviews
        const res = await fetch(`/api/projects/${resolvedParams.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            toast.error("Project not found");
            router.push("/dashboard/projects");
            return;
          }
          throw new Error("Failed to fetch project");
        }
        const data = await res.json();
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [resolvedParams.id, router]);

  const handleMarkHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      const res = await fetch(`/api/projects/${resolvedParams.id}/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHelpful: helpful }),
      });

      if (res.ok) {
        setProject(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            reviews: prev.reviews.map(r => 
              r.id === reviewId ? { ...r, isHelpful: helpful } : r
            ),
          };
        });
        toast.success("Feedback recorded");
      }
    } catch (error) {
      console.error("Error marking helpful:", error);
      toast.error("Failed to record feedback");
    }
  };

  const handleReply = async (reviewId: string, reply: string) => {
    try {
      const res = await fetch(`/api/projects/${resolvedParams.id}/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });

      if (res.ok) {
        setProject(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            reviews: prev.reviews.map(r => 
              r.id === reviewId ? { ...r, ownerReply: reply } : r
            ),
          };
        });
        toast.success("Reply saved");
      }
    } catch (error) {
      console.error("Error saving reply:", error);
      toast.error("Failed to save reply");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const isOwner = currentUserId === project.owner.id;
  const status = statusConfig[project.status] || statusConfig.draft;

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/dashboard/projects">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </Button>

      {/* Project Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Screenshot */}
        {project.screenshotUrl && (
          <div className="md:w-80 h-48 rounded-xl overflow-hidden border">
            <Image
              src={project.screenshotUrl}
              alt={project.title}
              width={320}
              height={192}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Project Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <Badge className={status.color}>{status.label}</Badge>
              </div>
              <p className="text-muted-foreground mb-4">{project.description}</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button asChild variant="outline" size="sm">
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Site
              </a>
            </Button>
            {project.githubUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              {categoryLabels[project.category] || project.category}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(project.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {project.owner.name}
            </div>
          </div>
        </div>
      </div>

      {/* Problem Solved */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            Problem Solved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{project.problemSolved}</p>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            Tech Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews ({project.reviewsReceived}/{project.reviewsRequired})
          </h2>
        </div>

        {project.reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                Your project is in the review queue. Reviews will appear here as they&apos;re completed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {project.reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwner={isOwner}
                onMarkHelpful={handleMarkHelpful}
                onReply={handleReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}