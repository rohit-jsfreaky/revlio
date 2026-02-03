import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
  toggleFollow,
  isFollowing,
  getFollowCounts,
  getFollowingIds,
} from "@/lib/social";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId: targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (user.id === targetUserId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    const result = await toggleFollow(user.id, targetUserId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");
    const type = searchParams.get("type") || "status";

    if (type === "following-ids" && user) {
      const ids = await getFollowingIds(user.id);
      return NextResponse.json({ followingIds: ids });
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const counts = await getFollowCounts(targetUserId);
    const following = user ? await isFollowing(user.id, targetUserId) : false;

    return NextResponse.json({ ...counts, isFollowing: following });
  } catch (error) {
    console.error("Error getting follow info:", error);
    return NextResponse.json(
      { error: "Failed to get follow info" },
      { status: 500 }
    );
  }
}
