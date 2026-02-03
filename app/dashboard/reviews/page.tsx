"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ClipboardList, 
  Coins, 
  Clock, 
  ArrowRight,
  ExternalLink,
  Play,
  CheckCircle2,
  Timer,
  FileText,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReviewAssignment {
  assignment: {
    id: string;
    projectId: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  };
  project: {
    id: string;
    title: string;
    description: string;
    liveUrl: string;
    category: string;
    techStack: string[];
    screenshotUrl: string | null;
  };
  owner: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface CompletedReview {
  review: {
    id: string;
    projectId: string;
    whatsGood: string;
    creditsEarned: number;
    submittedAt: string;
  };
  project: {
    id: string;
    title: string;
    screenshotUrl: string | null;
  };
}

function formatTimeLeft(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();
  
  if (diff <= 0) return "Expired";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  return `${hours}h ${minutes}m left`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric"
  });
}

function AssignmentCard({ assignment }: { assignment: ReviewAssignment }) {
  const isExpired = new Date(assignment.assignment.expiresAt) < new Date();
  const isInProgress = assignment.assignment.status === "in_progress";
  
  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${isExpired ? "opacity-60" : ""}`}>
      <div className="flex flex-col md:flex-row">
        {/* Screenshot */}
        <div className="md:w-48 h-32 md:h-auto bg-muted shrink-0">
          {assignment.project.screenshotUrl ? (
            <Image
              src={assignment.project.screenshotUrl}
              alt={assignment.project.title}
              width={192}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{assignment.project.title}</h3>
                {isInProgress && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    In Progress
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {assignment.project.description}
              </p>
            </div>
            
            {/* Time Left */}
            <div className={`flex items-center gap-1 text-sm shrink-0 ${isExpired ? "text-red-600" : "text-amber-600"}`}>
              <Timer className="h-4 w-4" />
              {formatTimeLeft(assignment.assignment.expiresAt)}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1 mb-3">
            {assignment.project.techStack.slice(0, 5).map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>

          {/* Owner & Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignment.owner.avatarUrl || undefined} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                  {assignment.owner.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{assignment.owner.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={assignment.project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Preview
                </a>
              </Button>
              <Button size="sm" asChild disabled={isExpired} className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Link href={`/dashboard/reviews/${assignment.assignment.id}`}>
                  <Play className="h-4 w-4 mr-1" />
                  {isInProgress ? "Continue" : "Start"} Review
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function CompletedReviewCard({ review }: { review: CompletedReview }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
            {review.project.screenshotUrl ? (
              <Image
                src={review.project.screenshotUrl}
                alt={review.project.title}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{review.project.title}</h4>
            <p className="text-sm text-muted-foreground">
              Reviewed {formatDate(review.review.submittedAt)}
            </p>
          </div>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            +{review.review.creditsEarned} credit
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReviewsPage() {
  const [assignments, setAssignments] = useState<ReviewAssignment[]>([]);
  const [completedReviews, setCompletedReviews] = useState<CompletedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [queueRes, completedRes] = await Promise.all([
          fetch("/api/reviews?type=queue"),
          fetch("/api/reviews?type=completed"),
        ]);
        
        const [queueData, completedData] = await Promise.all([
          queueRes.json(),
          completedRes.json(),
        ]);
        
        setAssignments(queueData);
        setCompletedReviews(completedData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  const pendingCount = assignments.filter(a => 
    a.assignment.status !== "submitted" && new Date(a.assignment.expiresAt) > new Date()
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            Review Queue
          </h1>
          <p className="text-muted-foreground mt-1">
            Review projects to earn credits. Each quality review earns you 1 credit.
          </p>
        </div>
        <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
          <Coins className="h-4 w-4" />
          +1 credit per review
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/50 p-3">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-3">
                <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Earned</p>
                <p className="text-2xl font-bold">
                  {completedReviews.reduce((sum, r) => sum + r.review.creditsEarned, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed ({completedReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {assignments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-4 mb-4">
                  <ClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No reviews assigned yet</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  When projects are submitted, you&apos;ll be assigned reviews based on your
                  tech stack. Check back soon!
                </p>
                <p className="text-sm text-muted-foreground">
                  Want to explore? Check out{" "}
                  <Link href="/dashboard/discover" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Fresh Builds
                  </Link>
                </p>
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <AssignmentCard key={assignment.assignment.id} assignment={assignment} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedReviews.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-green-50 dark:bg-green-900/30 p-4 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No completed reviews</h3>
                <p className="text-muted-foreground max-w-md">
                  Complete your first review to earn credits!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedReviews.map((review) => (
                <CompletedReviewCard key={review.review.id} review={review} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
