import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
  toggleLike,
  getLikeCount,
  hasUserLiked,
} from "@/lib/social";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const result = await toggleLike(user.id, projectId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const user = await getSessionUser(request);
    const likeCount = await getLikeCount(projectId);
    const isLiked = user ? await hasUserLiked(user.id, projectId) : false;

    return NextResponse.json({ likeCount, isLiked });
  } catch (error) {
    console.error("Error getting like info:", error);
    return NextResponse.json(
      { error: "Failed to get like info" },
      { status: 500 }
    );
  }
}
