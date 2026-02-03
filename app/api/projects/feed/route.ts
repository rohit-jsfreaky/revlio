import { NextRequest, NextResponse } from "next/server";
import { getFeedProjects } from "@/lib/projects";
import { getSessionUser } from "@/lib/session";
import {
  getProjectsLikesInfo,
  getProjectsCommentCounts,
  getFollowingFeed,
  getTrendingProjects,
} from "@/lib/social";

/**
 * Public feed of projects
 * Returns active projects with owner info for display in the feed
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type") || "pulse"; // pulse, circle, momentum

    const user = await getSessionUser(request);

    let projects;

    switch (type) {
      case "circle":
        // Following feed - only if user is logged in
        if (!user) {
          return NextResponse.json({ projects: [], hasMore: false });
        }
        projects = await getFollowingFeed(user.id, limit, offset);
        break;

      case "momentum":
        // Trending feed
        const trending = await getTrendingProjects(limit, offset);
        projects = trending;
        break;

      case "pulse":
      default:
        // Default feed - all projects
        projects = await getFeedProjects(limit, offset);
        break;
    }

    // Get project IDs
    const projectIds = projects.map((p) => p.id);

    // Get likes info for all projects
    const likesInfo = await getProjectsLikesInfo(
      projectIds,
      user?.id
    );

    // Get comment counts for all projects
    const commentCounts = await getProjectsCommentCounts(projectIds);

    // Merge likes and comments into projects
    const enrichedProjects = projects.map((project) => ({
      ...project,
      likeCount: likesInfo.get(project.id)?.likeCount || 0,
      isLiked: likesInfo.get(project.id)?.isLiked || false,
      commentCount: commentCounts.get(project.id) || 0,
    }));

    return NextResponse.json({
      projects: enrichedProjects,
      hasMore: projects.length === limit,
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
