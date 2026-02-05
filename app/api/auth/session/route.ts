import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

export async function GET(request: Request) {
  try {
    const token = getCookieValue(request.headers.get("cookie"), "revlio_session");
    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ authenticated: false });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const userId = payload.sub as string;

    if (!userId) {
      return NextResponse.json({ authenticated: false });
    }

    // Fetch user data from database
    const db = getDb();
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        bannerUrl: users.bannerUrl,
        bio: users.bio,
        website: users.website,
        position: users.position,
        skills: users.skills,
        onboardingCompleted: users.onboardingCompleted,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        bannerUrl: user.bannerUrl,
        bio: user.bio,
        website: user.website,
        position: user.position,
        skills: user.skills || [],
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
