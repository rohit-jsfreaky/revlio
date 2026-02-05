import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { users, projects, reviews } from "@/lib/schema";
import { eq, sql, and } from "drizzle-orm";

export const runtime = "edge";

// GET - Fetch user profile with stats
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Get user profile
    const [profile] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        bio: users.bio,
        website: users.website,
        position: users.position,
        skills: users.skills,
        avatarUrl: users.avatarUrl,
        bannerUrl: users.bannerUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.id));

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get stats
    const [projectStats] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(projects)
      .where(eq(projects.userId, user.id));

    const [reviewStats] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(and(eq(reviews.reviewerId, user.id), eq(reviews.status, "submitted")));

    const [helpfulStats] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(and(eq(reviews.reviewerId, user.id), eq(reviews.isHelpful, true)));

    const stats = {
      projectsCount: projectStats?.count || 0,
      reviewsCount: reviewStats?.count || 0,
      helpfulCount: helpfulStats?.count || 0,
      score: (reviewStats?.count || 0) * 10 + (helpfulStats?.count || 0) * 5,
    };

    return NextResponse.json({ profile, stats });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, website, position, skills, avatarUrl, bannerUrl } = body;

    // Validate required fields
    if (name !== undefined && !name?.trim()) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      );
    }

    // Validate website URL if provided
    let validatedWebsite: string | null | undefined = undefined;
    if (website !== undefined) {
      if (website?.trim()) {
        try {
          let urlToValidate = website.trim();
          if (!urlToValidate.startsWith("http://") && !urlToValidate.startsWith("https://")) {
            urlToValidate = `https://${urlToValidate}`;
          }
          new URL(urlToValidate);
          validatedWebsite = urlToValidate;
        } catch {
          return NextResponse.json(
            { error: "Invalid website URL" },
            { status: 400 }
          );
        }
      } else {
        validatedWebsite = null;
      }
    }

    const db = getDb();

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio?.trim() || null;
    if (validatedWebsite !== undefined) updateData.website = validatedWebsite;
    if (position !== undefined) updateData.position = position?.trim() || null;
    if (skills !== undefined) updateData.skills = skills;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update user profile
    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        bio: users.bio,
        website: users.website,
        position: users.position,
        skills: users.skills,
        avatarUrl: users.avatarUrl,
        bannerUrl: users.bannerUrl,
      });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
