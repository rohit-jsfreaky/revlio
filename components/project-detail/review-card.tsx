"use client";

import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  MessageSquare,
  Lightbulb,
  Reply,
  Send,
  Loader2,
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
    <Card className="border-border/60 bg-card/80">
      <CardContent className="p-6">
        {/* Reviewer Info */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            <div className="flex items-center gap-2">
              <Button
                variant={review.isHelpful === true ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => onMarkHelpful(review.id, true)}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Helpful
              </Button>
              <Button
                variant={review.isHelpful === false ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => onMarkHelpful(review.id, false)}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Not Helpful
              </Button>
            </div>
          )}
        </div>

        {/* Review Sections */}
        <div className="space-y-4 mt-5">
          <div className="p-4 rounded-lg border border-border/60 bg-muted/30">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              What&apos;s Good
            </h4>
            <p className="text-sm text-foreground/80">{review.whatsGood}</p>
          </div>

          <div className="p-4 rounded-lg border border-border/60 bg-muted/30">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              What&apos;s Unclear
            </h4>
            <p className="text-sm text-foreground/80">{review.whatsUnclear}</p>
          </div>

          <div className="p-4 rounded-lg border border-border/60 bg-muted/30">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Improvement Suggestions
            </h4>
            <p className="text-sm text-foreground/80">{review.improvementSuggestion}</p>
          </div>
        </div>

        {/* Owner Reply */}
        {review.ownerReply && !showReplyForm && (
          <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <Reply className="h-4 w-4" />
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
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
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
