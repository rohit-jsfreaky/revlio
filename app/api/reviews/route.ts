import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
  getUserReviewQueue,
  submitReview,
  saveReviewDraft,
  getReviewDraft,
  getUserCompletedReviews,
  autoAssignReviewers,
} from "@/lib/reviews";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "queue";
    const assignmentId = searchParams.get("assignmentId");

    switch (type) {
      case "queue": {
        const queue = await getUserReviewQueue(user.id);
        return NextResponse.json(queue);
      }
      case "completed": {
        const completed = await getUserCompletedReviews(user.id);
        return NextResponse.json(completed);
      }
      case "draft": {
        if (!assignmentId) {
          return NextResponse.json(
            { error: "Assignment ID required" },
            { status: 400 },
          );
        }
        const draft = await getReviewDraft(assignmentId);
        return NextResponse.json(draft || {});
      }
      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error in reviews GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "submit": {
        const { assignmentId, whatsGood, whatsUnclear, improvementSuggestion } =
          body;

        if (
          !assignmentId ||
          !whatsGood ||
          !whatsUnclear ||
          !improvementSuggestion
        ) {
          return NextResponse.json(
            { error: "All fields are required" },
            { status: 400 },
          );
        }

        const result = await submitReview(assignmentId, user.id, {
          whatsGood,
          whatsUnclear,
          improvementSuggestion,
        });

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          review: result.review,
          message: "Review submitted! You earned 1 credit.",
        });
      }

      case "saveDraft": {
        const { assignmentId, whatsGood, whatsUnclear, improvementSuggestion } =
          body;

        if (!assignmentId) {
          return NextResponse.json(
            { error: "Assignment ID required" },
            { status: 400 },
          );
        }

        const draft = await saveReviewDraft(assignmentId, {
          whatsGood,
          whatsUnclear,
          improvementSuggestion,
        });

        return NextResponse.json({
          success: true,
          draft,
          message: "Draft saved",
        });
      }

      case "assignReviewers": {
        const { projectId, numberOfReviewers } = body;

        if (!projectId) {
          return NextResponse.json(
            { error: "Project ID required" },
            { status: 400 },
          );
        }

        const assignments = await autoAssignReviewers(
          projectId,
          numberOfReviewers || 3,
        );

        return NextResponse.json({
          success: true,
          assignments,
          message: `Assigned ${assignments.length} reviewers`,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in reviews POST:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
