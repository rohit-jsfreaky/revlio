import { eq, and, desc, sql, lt } from "drizzle-orm";
import { getDb } from "./db";
import {
  reviews,
  reviewAssignments,
  reviewDrafts,
  projects,
  users,
  type Review,
  type NewReview,
  type ReviewAssignment,
  type ReviewDraft,
} from "./schema";
import { addCredits, CREDIT_CONFIG } from "./credits";

/**
 * Get user's assigned reviews (review queue)
 */
export async function getUserReviewQueue(userId: string) {
  const db = getDb();

  const assignments = await db
    .select({
      assignment: reviewAssignments,
      project: projects,
      owner: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(reviewAssignments)
    .innerJoin(projects, eq(reviewAssignments.projectId, projects.id))
    .innerJoin(users, eq(projects.userId, users.id))
    .where(
      and(
        eq(reviewAssignments.reviewerId, userId),
        sql`${reviewAssignments.status} IN ('assigned', 'in_progress')`,
      ),
    )
    .orderBy(reviewAssignments.expiresAt);

  return assignments;
}

/**
 * Create a review assignment
 */
export async function assignReviewer(
  projectId: string,
  reviewerId: string,
  expiresInHours = 48,
): Promise<ReviewAssignment> {
  const db = getDb();

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const [assignment] = await db
    .insert(reviewAssignments)
    .values({
      projectId,
      reviewerId,
      expiresAt,
      status: "assigned",
    })
    .returning();

  return assignment;
}

/**
 * Auto-assign reviewers to a project based on tech stack matching
 */
export async function autoAssignReviewers(
  projectId: string,
  numberOfReviewers = 3,
): Promise<ReviewAssignment[]> {
  const db = getDb();

  // Get the project's tech stack
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) return [];

  const techStack = project.techStack as string[];

  // Find users who have matching skills and aren't the project owner
  // Also exclude users who already have an assignment for this project
  const potentialReviewers = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        sql`${users.id} != ${project.userId}`,
        sql`${users.onboardingCompleted} = true`,
        sql`${users.id} NOT IN (
          SELECT reviewer_id FROM review_assignments WHERE project_id = ${projectId}
        )`,
        sql`${users.id} NOT IN (
          SELECT reviewer_id FROM reviews WHERE project_id = ${projectId}
        )`,
      ),
    )
    .orderBy(
      // Prioritize users with matching skills - format as PostgreSQL array literal
      sql`(
        SELECT COUNT(*) FROM jsonb_array_elements_text(${users.skills}) AS skill
        WHERE skill = ANY(ARRAY[${sql.join(
          techStack.map((t) => sql`${t}`),
          sql`, `,
        )}]::text[])
      ) DESC`,
    )
    .limit(numberOfReviewers);

  // Create assignments
  const assignments: ReviewAssignment[] = [];
  for (const reviewer of potentialReviewers) {
    const assignment = await assignReviewer(projectId, reviewer.id);
    assignments.push(assignment);
  }

  return assignments;
}

/**
 * Submit a review
 */
export async function submitReview(
  assignmentId: string,
  reviewerId: string,
  data: {
    whatsGood: string;
    whatsUnclear: string;
    improvementSuggestion: string;
  },
): Promise<{ success: boolean; review?: Review; error?: string }> {
  const db = getDb();

  // Validate minimum length
  if (data.whatsGood.length < CREDIT_CONFIG.MIN_REVIEW_LENGTH) {
    return {
      success: false,
      error: `"What's good" must be at least ${CREDIT_CONFIG.MIN_REVIEW_LENGTH} characters`,
    };
  }
  if (data.whatsUnclear.length < CREDIT_CONFIG.MIN_REVIEW_LENGTH) {
    return {
      success: false,
      error: `"What's unclear" must be at least ${CREDIT_CONFIG.MIN_REVIEW_LENGTH} characters`,
    };
  }
  if (data.improvementSuggestion.length < CREDIT_CONFIG.MIN_REVIEW_LENGTH) {
    return {
      success: false,
      error: `"Improvement suggestion" must be at least ${CREDIT_CONFIG.MIN_REVIEW_LENGTH} characters`,
    };
  }

  // Get the assignment
  const [assignment] = await db
    .select()
    .from(reviewAssignments)
    .where(
      and(
        eq(reviewAssignments.id, assignmentId),
        eq(reviewAssignments.reviewerId, reviewerId),
      ),
    )
    .limit(1);

  if (!assignment) {
    return { success: false, error: "Assignment not found" };
  }

  if (assignment.status === "submitted") {
    return { success: false, error: "Review already submitted" };
  }

  if (assignment.status === "expired") {
    return { success: false, error: "Assignment has expired" };
  }

  // Create the review
  const [review] = await db
    .insert(reviews)
    .values({
      projectId: assignment.projectId,
      reviewerId,
      whatsGood: data.whatsGood,
      whatsUnclear: data.whatsUnclear,
      improvementSuggestion: data.improvementSuggestion,
      creditsEarned: CREDIT_CONFIG.EARN_PER_REVIEW,
      status: "submitted",
    })
    .returning();

  // Update assignment status
  await db
    .update(reviewAssignments)
    .set({
      status: "submitted",
      completedAt: new Date(),
    })
    .where(eq(reviewAssignments.id, assignmentId));

  // Update project's review count
  await db
    .update(projects)
    .set({
      reviewsReceived: sql`${projects.reviewsReceived} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, assignment.projectId));

  // Award credits to reviewer
  await addCredits(
    reviewerId,
    CREDIT_CONFIG.EARN_PER_REVIEW,
    "earned_review",
    "Completed a project review",
    assignment.projectId,
    review.id,
  );

  // Delete any draft
  await db
    .delete(reviewDrafts)
    .where(eq(reviewDrafts.assignmentId, assignmentId));

  return { success: true, review };
}

/**
 * Save review draft
 */
export async function saveReviewDraft(
  assignmentId: string,
  data: {
    whatsGood?: string;
    whatsUnclear?: string;
    improvementSuggestion?: string;
  },
): Promise<ReviewDraft> {
  const db = getDb();

  // Upsert draft
  const [draft] = await db
    .insert(reviewDrafts)
    .values({
      assignmentId,
      whatsGood: data.whatsGood,
      whatsUnclear: data.whatsUnclear,
      improvementSuggestion: data.improvementSuggestion,
    })
    .onConflictDoUpdate({
      target: reviewDrafts.assignmentId,
      set: {
        whatsGood: data.whatsGood,
        whatsUnclear: data.whatsUnclear,
        improvementSuggestion: data.improvementSuggestion,
        updatedAt: new Date(),
      },
    })
    .returning();

  return draft;
}

/**
 * Get review draft
 */
export async function getReviewDraft(
  assignmentId: string,
): Promise<ReviewDraft | null> {
  const db = getDb();

  const [draft] = await db
    .select()
    .from(reviewDrafts)
    .where(eq(reviewDrafts.assignmentId, assignmentId))
    .limit(1);

  return draft || null;
}

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(
  reviewId: string,
  projectOwnerId: string,
  isHelpful: boolean,
): Promise<boolean> {
  const db = getDb();

  // Verify the user owns the project
  const [review] = await db
    .select({ projectId: reviews.projectId })
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);

  if (!review) return false;

  const [project] = await db
    .select({ userId: projects.userId })
    .from(projects)
    .where(eq(projects.id, review.projectId))
    .limit(1);

  if (!project || project.userId !== projectOwnerId) return false;

  await db.update(reviews).set({ isHelpful }).where(eq(reviews.id, reviewId));

  return true;
}

/**
 * Add owner reply to a review
 */
export async function addOwnerReply(
  reviewId: string,
  projectOwnerId: string,
  reply: string,
): Promise<boolean> {
  const db = getDb();

  // Verify the user owns the project
  const [review] = await db
    .select({ projectId: reviews.projectId })
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);

  if (!review) return false;

  const [project] = await db
    .select({ userId: projects.userId })
    .from(projects)
    .where(eq(projects.id, review.projectId))
    .limit(1);

  if (!project || project.userId !== projectOwnerId) return false;

  await db
    .update(reviews)
    .set({ ownerReply: reply })
    .where(eq(reviews.id, reviewId));

  return true;
}

/**
 * Expire old assignments
 */
export async function expireOldAssignments(): Promise<number> {
  const db = getDb();

  const result = await db
    .update(reviewAssignments)
    .set({ status: "expired" })
    .where(
      and(
        sql`${reviewAssignments.status} IN ('assigned', 'in_progress')`,
        lt(reviewAssignments.expiresAt, new Date()),
      ),
    )
    .returning();

  return result.length;
}

/**
 * Get user's completed reviews
 */
export async function getUserCompletedReviews(userId: string) {
  const db = getDb();

  const result = await db
    .select({
      review: reviews,
      project: {
        id: projects.id,
        title: projects.title,
        screenshotUrl: projects.screenshotUrl,
      },
    })
    .from(reviews)
    .innerJoin(projects, eq(reviews.projectId, projects.id))
    .where(eq(reviews.reviewerId, userId))
    .orderBy(desc(reviews.submittedAt));

  return result;
}
