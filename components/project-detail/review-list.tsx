"use client";

import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewCard } from "./review-card";
import type { Review } from "@/hooks/project-detail";

interface ReviewListProps {
  reviews: Review[];
  reviewsReceived: number;
  reviewsRequired: number;
  isOwner: boolean;
  onMarkHelpful: (reviewId: string, helpful: boolean) => void;
  onReply: (reviewId: string, reply: string) => Promise<void>;
}

export function ReviewList({
  reviews,
  reviewsReceived,
  reviewsRequired,
  isOwner,
  onMarkHelpful,
  onReply,
}: ReviewListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          Reviews
        </h2>
        <p className="text-sm text-muted-foreground">
          {reviewsReceived}/{reviewsRequired} completed reviews
        </p>
      </div>

      {reviews.length === 0 ? (
        <ReviewsEmptyState />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={isOwner}
              onMarkHelpful={onMarkHelpful}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewsEmptyState() {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="py-12 text-center">
        <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <h3 className="font-semibold text-lg mb-2">No reviews yet</h3>
        <p className="text-muted-foreground">
          Your project is in the review queue. Reviews will appear here as they&apos;re completed.
        </p>
      </CardContent>
    </Card>
  );
}
