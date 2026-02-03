import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { addOwnerReply } from "@/lib/reviews";

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
    const { reply } = body;

    if (!reply || typeof reply !== "string") {
      return NextResponse.json(
        { error: "Reply text is required" },
        { status: 400 }
      );
    }

    const success = await addOwnerReply(reviewId, user.id, reply);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to add reply" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error adding reply:", error);
    return NextResponse.json(
      { error: "Failed to add reply" },
      { status: 500 }
    );
  }
}
