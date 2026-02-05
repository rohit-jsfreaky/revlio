"use client";

import { useState } from "react";
import {
  CheckCircle2,
  MessageSquare,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@/hooks/project-detail";

// Helper function
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface ReviewCardProps {
  review: Review;
  isOwner: boolean;
  onMarkHelpful: (reviewId: string, helpful: boolean) => void;
  onReply: (reviewId: string, reply: string) => Promise<void>;
}

export function ReviewCard({ review, isOwner, onMarkHelpful, onReply }: ReviewCardProps) {
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
              <p className="text-xs text-muted-foreground">{formatDate(review.submittedAt)}</p>
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
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Send Reply
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowReplyForm(false)}>
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
