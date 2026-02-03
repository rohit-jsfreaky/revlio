import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  projects,
  reviews,
  reviewAssignments,
  users,
  type Project,
  type NewProject,
  type Review,
  type ReviewAssignment,
} from "./schema";
import { spendCredits, CREDIT_CONFIG } from "./credits";

/**
 * Create a new project submission
 */
export async function createProject(
  userId: string,
  data: {
    title: string;
    description: string;
    problemSolved?: string;
    liveUrl?: string;
    githubUrl?: string;
    techStack: string[];
    category: NewProject["category"];
    screenshotUrl?: string;
  },
): Promise<{ success: boolean; project?: Project; error?: string }> {
  const db = getDb();

  // Spend credits for submission
  const creditResult = await spendCredits(
    userId,
    CREDIT_CONFIG.COST_PER_SUBMISSION,
    "spent_submission",
    `Submitted project: ${data.title}`,
  );

  if (!creditResult.success) {
    return { success: false, error: creditResult.error };
  }

  // Create the project
  const [project] = await db
    .insert(projects)
    .values({
      userId,
      title: data.title,
      description: data.description,
      problemSolved: data.problemSolved,
      liveUrl: data.liveUrl,
      githubUrl: data.githubUrl,
      techStack: data.techStack,
      category: data.category,
      screenshotUrl: data.screenshotUrl,
      creditsSpent: CREDIT_CONFIG.COST_PER_SUBMISSION,
      status: "pending_review",
    })
    .returning();

  // Update the credit transaction with the project ID
  // This is done after project creation to have the project ID

  return { success: true, project };
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  const db = getDb();

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));

  return userProjects;
}

/**
 * Get a single project by ID
 */
export async function getProjectById(
  projectId: string,
): Promise<Project | null> {
  const db = getDb();

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return project || null;
}

/**
 * Get project with owner info
 */
export async function getProjectWithOwner(projectId: string) {
  const db = getDb();

  const result = await db
    .select({
      project: projects,
      owner: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        position: users.position,
      },
    })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(eq(projects.id, projectId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get reviews for a project
 */
export async function getProjectReviews(
  projectId: string,
): Promise<
  (Review & {
    reviewer: { id: string; name: string | null; avatarUrl: string | null };
  })[]
> {
  const db = getDb();

  const result = await db
    .select({
      review: reviews,
      reviewer: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.reviewerId, users.id))
    .where(eq(reviews.projectId, projectId))
    .orderBy(desc(reviews.submittedAt));

  return result.map((r) => ({ ...r.review, reviewer: r.reviewer }));
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  status: Project["status"],
): Promise<Project | null> {
  const db = getDb();

  const [updated] = await db
    .update(projects)
    .set({ status, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  return updated || null;
}

/**
 * Get projects available for review (not owned by user, not already reviewed/assigned)
 */
export async function getProjectsForReview(
  userId: string,
  limit = 10,
): Promise<
  (Project & { owner: { name: string | null; avatarUrl: string | null } })[]
> {
  const db = getDb();

  // Get projects that:
  // 1. Are not owned by the user
  // 2. Are in pending_review or active status
  // 3. User hasn't already reviewed
  // 4. User doesn't have an active assignment for
  const result = await db
    .select({
      project: projects,
      owner: {
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(
      and(
        sql`${projects.userId} != ${userId}`,
        sql`${projects.status} IN ('pending_review', 'active')`,
        sql`${projects.id} NOT IN (
          SELECT project_id FROM reviews WHERE reviewer_id = ${userId}
        )`,
        sql`${projects.id} NOT IN (
          SELECT project_id FROM review_assignments 
          WHERE reviewer_id = ${userId} AND status IN ('assigned', 'in_progress')
        )`,
      ),
    )
    .orderBy(desc(projects.createdAt))
    .limit(limit);

  return result.map((r) => ({ ...r.project, owner: r.owner }));
}

/**
 * Get feed projects for homepage
 */
export async function getFeedProjects(
  limit = 20,
  offset = 0,
): Promise<
  (Project & {
    owner: {
      id: string;
      name: string | null;
      avatarUrl: string | null;
      position: string | null;
    };
  })[]
> {
  const db = getDb();

  const result = await db
    .select({
      project: projects,
      owner: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        position: users.position,
      },
    })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(sql`${projects.status} IN ('pending_review', 'active')`)
    .orderBy(desc(projects.createdAt))
    .limit(limit)
    .offset(offset);

  return result.map((r) => ({ ...r.project, owner: r.owner }));
}

/**
 * Compare semver versions - returns true if newVersion > currentVersion
 */
function isVersionUpgrade(
  currentVersion: string | null,
  newVersion: string,
): boolean {
  if (!currentVersion) return true;

  const parseVersion = (v: string): number[] => {
    const parts = v.split(".").map((p) => parseInt(p, 10) || 0);
    while (parts.length < 3) parts.push(0);
    return parts.slice(0, 3);
  };

  const current = parseVersion(currentVersion);
  const next = parseVersion(newVersion);

  for (let i = 0; i < 3; i++) {
    if (next[i] > current[i]) return true;
    if (next[i] < current[i]) return false;
  }
  return false; // Equal versions
}

/**
 * Update an existing project
 * If version is upgraded, charge 1 credit and reset for review feed
 */
export async function updateProject(
  userId: string,
  projectId: string,
  data: {
    title?: string;
    description?: string;
    problemSolved?: string;
    liveUrl?: string;
    githubUrl?: string;
    techStack?: string[];
    category?: NewProject["category"];
    screenshotUrl?: string;
    version?: string;
  },
): Promise<{
  success: boolean;
  project?: Project;
  error?: string;
  versionUpgraded?: boolean;
}> {
  const db = getDb();

  // Get existing project
  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);

  if (!existing) {
    return { success: false, error: "Project not found or unauthorized" };
  }

  // Check if this is a version upgrade
  const versionUpgraded =
    data.version && isVersionUpgrade(existing.version, data.version);

  // If version upgrade, charge credit
  if (versionUpgraded) {
    const creditResult = await spendCredits(
      userId,
      CREDIT_CONFIG.COST_PER_SUBMISSION,
      "spent_submission",
      `Version upgrade: ${existing.title} v${data.version}`,
    );

    if (!creditResult.success) {
      return { success: false, error: creditResult.error };
    }
  }

  // Prepare update data
  const updateData: Partial<NewProject> & { updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.problemSolved !== undefined)
    updateData.problemSolved = data.problemSolved;
  if (data.liveUrl !== undefined) updateData.liveUrl = data.liveUrl;
  if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;
  if (data.techStack !== undefined) updateData.techStack = data.techStack;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.screenshotUrl !== undefined)
    updateData.screenshotUrl = data.screenshotUrl;
  if (data.version !== undefined) updateData.version = data.version;

  // If version upgraded, reset for new reviews
  if (versionUpgraded) {
    updateData.status = "pending_review";
    updateData.reviewsReceived = 0;
    updateData.creditsSpent =
      (existing.creditsSpent || 0) + CREDIT_CONFIG.COST_PER_SUBMISSION;
  }

  const [updated] = await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, projectId))
    .returning();

  return {
    success: true,
    project: updated,
    versionUpgraded: !!versionUpgraded,
  };
}
