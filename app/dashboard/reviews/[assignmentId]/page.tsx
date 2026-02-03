"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft,
  ExternalLink,
  Github,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Lightbulb,
  Timer,
  FileText,
  Layers,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useCredits } from "@/components/dashboard/dashboard-layout";

const MIN_CHARS = 100;

interface ReviewAssignment {
  assignment: {
    id: string;
    projectId: string;
    status: string;
    expiresAt: string;
  };
  project: {
    id: string;
    title: string;
    description: string;
    problemSolved: string;
    liveUrl: string;
    githubUrl: string | null;
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

interface ReviewDraft {
  whatsGood?: string;
  whatsUnclear?: string;
  improvementSuggestion?: string;
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

function CharCounter({ current, min }: { current: number; min: number }) {
  const isValid = current >= min;
  const percentage = Math.min((current / min) * 100, 100);
  
  return (
    <div className="flex items-center gap-2 mt-1">
      <Progress value={percentage} className="h-1 flex-1" />
      <span className={`text-xs ${isValid ? "text-green-600" : "text-muted-foreground"}`}>
        {current}/{min}
        {isValid && <CheckCircle2 className="inline h-3 w-3 ml-1" />}
      </span>
    </div>
  );
}

export default function ReviewSubmissionPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { refreshCredits } = useCredits();
  
  const [assignment, setAssignment] = useState<ReviewAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [formData, setFormData] = useState({
    whatsGood: "",
    whatsUnclear: "",
    improvementSuggestion: "",
  });

  const isExpired = assignment ? new Date(assignment.assignment.expiresAt) < new Date() : false;
  const canSubmit = 
    formData.whatsGood.length >= MIN_CHARS &&
    formData.whatsUnclear.length >= MIN_CHARS &&
    formData.improvementSuggestion.length >= MIN_CHARS &&
    !isExpired;

  // Auto-save debounce
  const saveDraft = useCallback(async () => {
    if (!resolvedParams.assignmentId) return;
    
    setIsSaving(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveDraft",
          assignmentId: resolvedParams.assignmentId,
          ...formData,
        }),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setIsSaving(false);
    }
  }, [resolvedParams.assignmentId, formData]);

  // Fetch assignment and draft
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch review queue to find this assignment
        const queueRes = await fetch("/api/reviews?type=queue");
        const queueData = await queueRes.json();
        
        const found = queueData.find(
          (a: ReviewAssignment) => a.assignment.id === resolvedParams.assignmentId
        );
        
        if (!found) {
          toast.error("Assignment not found");
          router.push("/dashboard/reviews");
          return;
        }
        
        setAssignment(found);

        // Fetch draft if exists
        const draftRes = await fetch(`/api/reviews?type=draft&assignmentId=${resolvedParams.assignmentId}`);
        const draftData: ReviewDraft = await draftRes.json();
        
        if (draftData.whatsGood || draftData.whatsUnclear || draftData.improvementSuggestion) {
          setFormData({
            whatsGood: draftData.whatsGood || "",
            whatsUnclear: draftData.whatsUnclear || "",
            improvementSuggestion: draftData.improvementSuggestion || "",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load assignment");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [resolvedParams.assignmentId, router]);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.whatsGood || formData.whatsUnclear || formData.improvementSuggestion) {
        saveDraft();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, saveDraft]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          assignmentId: resolvedParams.assignmentId,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Review submitted! You earned 1 credit 🎉");
      refreshCredits();
      router.push("/dashboard/reviews");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/dashboard/reviews">
            <ArrowLeft className="h-4 w-4" />
            Back to Queue
          </Link>
        </Button>
        
        <div className="flex items-center gap-3">
          {/* Auto-save indicator */}
          {isSaving && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}
          {lastSaved && !isSaving && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              Draft saved
            </span>
          )}
          
          {/* Timer */}
          <Badge 
            variant="outline" 
            className={`gap-1 ${isExpired ? "border-red-500 text-red-600" : "border-amber-500 text-amber-600"}`}
          >
            <Timer className="h-4 w-4" />
            {formatTimeLeft(assignment.assignment.expiresAt)}
          </Badge>
        </div>
      </div>

      {/* Expired Warning */}
      {isExpired && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Assignment Expired</p>
              <p className="text-sm text-red-600 dark:text-red-300">
                This review assignment has expired. You can no longer submit it.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Screenshot */}
            {assignment.project.screenshotUrl && (
              <div className="md:w-64 h-40 rounded-lg overflow-hidden border shrink-0">
                <Image
                  src={assignment.project.screenshotUrl}
                  alt={assignment.project.title}
                  width={256}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={assignment.owner.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {assignment.owner.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{assignment.owner.name}</span>
              </div>
              
              <h2 className="text-xl font-bold mb-2">{assignment.project.title}</h2>
              <p className="text-muted-foreground mb-4">{assignment.project.description}</p>
              
              {/* Problem Solved */}
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center gap-1 mb-1">
                  <Lightbulb className="h-4 w-4" />
                  Problem Solved
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">{assignment.project.problemSolved}</p>
              </div>
              
              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1 mb-4">
                {assignment.project.techStack.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              
              {/* Links */}
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={assignment.project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Live Site
                  </a>
                </Button>
                {assignment.project.githubUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={assignment.project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      View Code
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      <Card className={isExpired ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Your Review
          </CardTitle>
          <CardDescription>
            Provide thoughtful, constructive feedback. Minimum {MIN_CHARS} characters per section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* What's Good */}
          <div className="space-y-2">
            <Label htmlFor="whatsGood" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              What&apos;s Good
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="whatsGood"
              name="whatsGood"
              value={formData.whatsGood}
              onChange={handleChange}
              placeholder="What aspects of the project are well done? Consider the design, functionality, user experience, code quality, etc."
              className="min-h-28 resize-none"
            />
            <CharCounter current={formData.whatsGood.length} min={MIN_CHARS} />
          </div>

          {/* What's Unclear */}
          <div className="space-y-2">
            <Label htmlFor="whatsUnclear" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              What&apos;s Unclear
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="whatsUnclear"
              name="whatsUnclear"
              value={formData.whatsUnclear}
              onChange={handleChange}
              placeholder="What parts of the project or its purpose are confusing? Any UX issues, unclear messaging, or missing information?"
              className="min-h-28 resize-none"
            />
            <CharCounter current={formData.whatsUnclear.length} min={MIN_CHARS} />
          </div>

          {/* Improvement Suggestions */}
          <div className="space-y-2">
            <Label htmlFor="improvementSuggestion" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              Improvement Suggestions
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="improvementSuggestion"
              name="improvementSuggestion"
              value={formData.improvementSuggestion}
              onChange={handleChange}
              placeholder="What specific changes would you suggest? Think about features, design improvements, technical optimizations, or marketing strategies."
              className="min-h-28 resize-none"
            />
            <CharCounter current={formData.improvementSuggestion.length} min={MIN_CHARS} />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-amber-600" />
              <span className="text-muted-foreground">You&apos;ll earn <strong className="text-foreground">1 credit</strong> for this review</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={saveDraft}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}