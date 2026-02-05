import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getDb } from "./db";
import { users, type User } from "./schema";
import { eq } from "drizzle-orm";

/**
 * Extract cookie value from cookie header
 */
export function getCookieValue(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * Get authenticated user from session cookie
 * Returns user object or null if not authenticated
 */
export async function getSessionUser(
  request: NextRequest,
): Promise<{ id: string } | null> {
  const token = getCookieValue(request.headers.get("cookie"), "revlio_session");
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
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

/**
 * Get full user profile from session
 */
export async function getSessionUserFull(
  request: NextRequest,
): Promise<Omit<User, "passwordHash"> | null> {
  const token = getCookieValue(request.headers.get("cookie"), "revlio_session");
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    const userId = payload.sub as string;
    if (!userId) return null;

    const db = getDb();
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        googleId: users.googleId,
        name: users.name,
        avatarUrl: users.avatarUrl,
        bannerUrl: users.bannerUrl,
        emailVerified: users.emailVerified,
        onboardingCompleted: users.onboardingCompleted,
        bio: users.bio,
        website: users.website,
        position: users.position,
        skills: users.skills,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user || null;
  } catch {
    return null;
  }
}
