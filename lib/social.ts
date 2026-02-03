import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  projectComments,
  projectCommentLikes,
  projectLikes,
  userFollows,
  projects,
  users,
  type ProjectComment,
  type ProjectLike,
  type UserFollow,
} from "./schema";

// ============================================
// LIKES
// ============================================

/**
 * Toggle like on a project
 */
export async function toggleLike(
  userId: string,
  projectId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const db = getDb();

  // Check if already liked
  const [existing] = await db
    .select()
    .from(projectLikes)
    .where(
      and(
        eq(projectLikes.userId, userId),
        eq(projectLikes.projectId, projectId)
      )
    )
    .limit(1);

  if (existing) {
    // Unlike
    await db
      .delete(projectLikes)
      .where(eq(projectLikes.id, existing.id));
  } else {
    // Like
    await db
      .insert(projectLikes)
      .values({
        userId,
        projectId,
      })
      .onConflictDoNothing();
  }

  // Get new count
  const [countResult] = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
    })
    .from(projectLikes)
    .where(eq(projectLikes.projectId, projectId));

  return {
    liked: !existing,
    likeCount: countResult?.count || 0,
  };
}

/**
 * Get like count for a project
 */
export async function getLikeCount(projectId: string): Promise<number> {
  const db = getDb();

  const [result] = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
    })
    .from(projectLikes)
    .where(eq(projectLikes.projectId, projectId));

  return result?.count || 0;
}

/**
 * Check if user has liked a project
 */
export async function hasUserLiked(
  userId: string,
  projectId: string
): Promise<boolean> {
  const db = getDb();

  const [existing] = await db
    .select({ id: projectLikes.id })
    .from(projectLikes)
    .where(
      and(
        eq(projectLikes.userId, userId),
        eq(projectLikes.projectId, projectId)
      )
    )
    .limit(1);

  return !!existing;
}

/**
 * Get likes info for multiple projects (for feed optimization)
 */
export async function getProjectsLikesInfo(
  projectIds: string[],
  userId?: string
): Promise<
  Map<string, { likeCount: number; isLiked: boolean }>
> {
  const db = getDb();

  if (projectIds.length === 0) {
    return new Map();
  }

  // Get counts
  const counts = await db
    .select({
      projectId: projectLikes.projectId,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(projectLikes)
    .where(inArray(projectLikes.projectId, projectIds))
    .groupBy(projectLikes.projectId);

  // Get user's likes if userId provided
  let userLikes: { projectId: string }[] = [];
  if (userId) {
    userLikes = await db
      .select({ projectId: projectLikes.projectId })
      .from(projectLikes)
      .where(
        and(
          eq(projectLikes.userId, userId),
          inArray(projectLikes.projectId, projectIds)
        )
      );
  }

  const userLikedSet = new Set(userLikes.map((l) => l.projectId));

  const result = new Map<string, { likeCount: number; isLiked: boolean }>();
  
  // Initialize all projects with 0 likes
  for (const id of projectIds) {
    result.set(id, { likeCount: 0, isLiked: userLikedSet.has(id) });
  }

  // Update with actual counts
  for (const c of counts) {
    const existing = result.get(c.projectId);
    if (existing) {
      existing.likeCount = c.count;
    }
  }

  return result;
}

// ============================================
// COMMENTS
// ============================================

export interface CommentWithUser {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  parentId: string | null;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  isLiked: boolean;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  replies?: CommentWithUser[];
}

/**
 * Get comments for a project
 */
export async function getProjectComments(
  projectId: string,
  userId?: string
): Promise<CommentWithUser[]> {
  const db = getDb();

  const comments = await db
    .select({
      comment: projectComments,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(projectComments)
    .innerJoin(users, eq(projectComments.userId, users.id))
    .where(eq(projectComments.projectId, projectId))
    .orderBy(desc(projectComments.isPinned), desc(projectComments.createdAt));

  // Build nested structure
  const commentMap = new Map<string, CommentWithUser>();
  const rootComments: CommentWithUser[] = [];

  for (const row of comments) {
    const comment: CommentWithUser = {
      ...row.comment,
      likeCount: 0,
      isLiked: false,
      user: row.user,
      replies: [],
    };
    commentMap.set(comment.id, comment);
  }

  for (const row of comments) {
    const comment = commentMap.get(row.comment.id)!;
    if (row.comment.parentId && commentMap.has(row.comment.parentId)) {
      commentMap.get(row.comment.parentId)!.replies!.push(comment);
    } else {
      rootComments.push(comment);
    }
  }

  // Attach likes info
  const commentIds = [...commentMap.keys()];
  if (commentIds.length > 0) {
    const likeCounts = await db
      .select({
        commentId: projectCommentLikes.commentId,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(projectCommentLikes)
      .where(inArray(projectCommentLikes.commentId, commentIds))
      .groupBy(projectCommentLikes.commentId);

    const likeCountMap = new Map(
      likeCounts.map((c) => [c.commentId, c.count])
    );

    let userLikes: { commentId: string }[] = [];
    if (userId) {
      userLikes = await db
        .select({ commentId: projectCommentLikes.commentId })
        .from(projectCommentLikes)
        .where(
          and(
            eq(projectCommentLikes.userId, userId),
            inArray(projectCommentLikes.commentId, commentIds)
          )
        );
    }

    const userLikedSet = new Set(userLikes.map((l) => l.commentId));

    const applyLikes = (comment: CommentWithUser) => {
      comment.likeCount = likeCountMap.get(comment.id) || 0;
      comment.isLiked = userLikedSet.has(comment.id);
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(applyLikes);
      }
    };

    rootComments.forEach(applyLikes);
  }

  return rootComments;
}

/**
 * Add a comment to a project
 */
export async function addComment(
  userId: string,
  projectId: string,
  content: string,
  parentId?: string
): Promise<CommentWithUser> {
  const db = getDb();

  const [comment] = await db
    .insert(projectComments)
    .values({
      userId,
      projectId,
      content,
      parentId: parentId || null,
    })
    .returning();

  // Get user info
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return {
    ...comment,
    likeCount: 0,
    isLiked: false,
    user,
    replies: [],
  };
}

/**
 * Toggle like on a comment
 */
export async function toggleCommentLike(
  userId: string,
  commentId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const db = getDb();

  const [existing] = await db
    .select()
    .from(projectCommentLikes)
    .where(
      and(
        eq(projectCommentLikes.userId, userId),
        eq(projectCommentLikes.commentId, commentId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .delete(projectCommentLikes)
      .where(eq(projectCommentLikes.id, existing.id));
  } else {
    await db
      .insert(projectCommentLikes)
      .values({
        userId,
        commentId,
      })
      .onConflictDoNothing();
  }

  const [countResult] = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
    })
    .from(projectCommentLikes)
    .where(eq(projectCommentLikes.commentId, commentId));

  return {
    liked: !existing,
    likeCount: countResult?.count || 0,
  };
}

/**
 * Delete a comment
 */
export async function deleteComment(
  userId: string,
  commentId: string
): Promise<boolean> {
  const db = getDb();

  // Get comment to verify ownership
  const [comment] = await db
    .select()
    .from(projectComments)
    .where(eq(projectComments.id, commentId))
    .limit(1);

  if (!comment) return false;

  // Get project owner
  const [project] = await db
    .select({ userId: projects.userId })
    .from(projects)
    .where(eq(projects.id, comment.projectId))
    .limit(1);

  // Allow delete if user is comment author or project owner
  if (comment.userId !== userId && project?.userId !== userId) {
    return false;
  }

  await db.delete(projectComments).where(eq(projectComments.id, commentId));
  return true;
}

/**
 * Pin/unpin a comment (only project owner can do this)
 */
export async function togglePinComment(
  userId: string,
  commentId: string
): Promise<{ success: boolean; isPinned: boolean }> {
  const db = getDb();

  // Get comment
  const [comment] = await db
    .select()
    .from(projectComments)
    .where(eq(projectComments.id, commentId))
    .limit(1);

  if (!comment) {
    return { success: false, isPinned: false };
  }

  // Verify user is project owner
  const [project] = await db
    .select({ userId: projects.userId })
    .from(projects)
    .where(eq(projects.id, comment.projectId))
    .limit(1);

  if (project?.userId !== userId) {
    return { success: false, isPinned: false };
  }

  // Toggle pin
  const newPinned = !comment.isPinned;
  await db
    .update(projectComments)
    .set({ isPinned: newPinned, updatedAt: new Date() })
    .where(eq(projectComments.id, commentId));

  return { success: true, isPinned: newPinned };
}

/**
 * Get comment count for a project
 */
export async function getCommentCount(projectId: string): Promise<number> {
  const db = getDb();

  const [result] = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
    })
    .from(projectComments)
    .where(eq(projectComments.projectId, projectId));

  return result?.count || 0;
}

/**
 * Get comment counts for multiple projects
 */
export async function getProjectsCommentCounts(
  projectIds: string[]
): Promise<Map<string, number>> {
  const db = getDb();

  if (projectIds.length === 0) {
    return new Map();
  }

  const counts = await db
    .select({
      projectId: projectComments.projectId,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(projectComments)
    .where(inArray(projectComments.projectId, projectIds))
    .groupBy(projectComments.projectId);

  const result = new Map<string, number>();
  
  for (const id of projectIds) {
    result.set(id, 0);
  }

  for (const c of counts) {
    result.set(c.projectId, c.count);
  }

  return result;
}

// ============================================
// FOLLOWS
// ============================================

/**
 * Toggle follow a user
 */
export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<{ following: boolean }> {
  const db = getDb();

  // Can't follow yourself
  if (followerId === followingId) {
    return { following: false };
  }

  // Check if already following
  const [existing] = await db
    .select()
    .from(userFollows)
    .where(
      and(
        eq(userFollows.followerId, followerId),
        eq(userFollows.followingId, followingId)
      )
    )
    .limit(1);

  if (existing) {
    // Unfollow
    await db.delete(userFollows).where(eq(userFollows.id, existing.id));
    return { following: false };
  } else {
    // Follow
    await db.insert(userFollows).values({
      followerId,
      followingId,
    });
    return { following: true };
  }
}

/**
 * Check if user is following another user
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const db = getDb();

  const [existing] = await db
    .select({ id: userFollows.id })
    .from(userFollows)
    .where(
      and(
        eq(userFollows.followerId, followerId),
        eq(userFollows.followingId, followingId)
      )
    )
    .limit(1);

  return !!existing;
}

/**
 * Get list of user IDs that a user is following
 */
export async function getFollowingIds(userId: string): Promise<string[]> {
  const db = getDb();

  const following = await db
    .select({ followingId: userFollows.followingId })
    .from(userFollows)
    .where(eq(userFollows.followerId, userId));

  return following.map((f) => f.followingId);
}

/**
 * Get follower/following counts
 */
export async function getFollowCounts(
  userId: string
): Promise<{ followers: number; following: number }> {
  const db = getDb();

  const [followersResult] = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
    })
    .from(userFollows)
    .where(eq(userFollows.followingId, userId));

  const [followingResult] = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
    })
    .from(userFollows)
    .where(eq(userFollows.followerId, userId));

  return {
    followers: followersResult?.count || 0,
    following: followingResult?.count || 0,
  };
}

/**
 * Get projects from users that a user follows
 */
export async function getFollowingFeed(
  userId: string,
  limit = 20,
  offset = 0
): Promise<
  (typeof projects.$inferSelect & {
    owner: {
      id: string;
      name: string | null;
      avatarUrl: string | null;
      position: string | null;
    };
  })[]
> {
  const db = getDb();

  // Get following IDs
  const followingIds = await getFollowingIds(userId);

  if (followingIds.length === 0) {
    return [];
  }

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
    .where(
      and(
        inArray(projects.userId, followingIds),
        sql`${projects.status} IN ('pending_review', 'active')`
      )
    )
    .orderBy(desc(projects.createdAt))
    .limit(limit)
    .offset(offset);

  return result.map((r) => ({ ...r.project, owner: r.owner }));
}

/**
 * Get trending projects (most liked in last 7 days)
 */
export async function getTrendingProjects(
  limit = 20,
  offset = 0
): Promise<
  (typeof projects.$inferSelect & {
    owner: {
      id: string;
      name: string | null;
      avatarUrl: string | null;
      position: string | null;
    };
    likeCount: number;
  })[]
> {
  const db = getDb();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await db
    .select({
      project: projects,
      owner: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        position: users.position,
      },
      likeCount: sql<number>`COUNT(${projectLikes.id})::int`,
    })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .leftJoin(projectLikes, eq(projects.id, projectLikes.projectId))
    .where(sql`${projects.status} IN ('pending_review', 'active')`)
    .groupBy(projects.id, users.id)
    .orderBy(sql`COUNT(${projectLikes.id}) DESC`, desc(projects.createdAt))
    .limit(limit)
    .offset(offset);

  return result.map((r) => ({
    ...r.project,
    owner: r.owner,
    likeCount: r.likeCount || 0,
  }));
}
