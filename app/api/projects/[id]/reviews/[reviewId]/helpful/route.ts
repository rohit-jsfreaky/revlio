import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { markReviewHelpful } from "@/lib/reviews";

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

async function getSessionUser(request: NextRequest) {
  const token = getCookieValue(request.headers.get("cookie"), "revlio_session");
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const userId = payload.sub as string;
    if (!userId) return null;

    const db = getDb();
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user || null;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reviewId } = await params;
    const body = await request.json();
    const { isHelpful } = body;

    const success = await markReviewHelpful(reviewId, user.id, isHelpful);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update review" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error marking review helpful:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}
