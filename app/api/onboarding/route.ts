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

async function getUserId(request: Request): Promise<string | null> {
  const token = getCookieValue(request.headers.get("cookie"), "revlio_session");
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.sub as string;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      bio?: string;
      website?: string;
      position?: string;
      skills?: string[];
    };

    const { name, bio, website, position, skills } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!position?.trim()) {
      return NextResponse.json(
        { error: "Position is required" },
        { status: 400 }
      );
    }

    if (!skills || skills.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one skill" },
        { status: 400 }
      );
    }

    // Validate website URL if provided
    let validatedWebsite: string | null = null;
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
    }

    const db = getDb();

    // Update user profile
    await db
      .update(users)
      .set({
        name: name.trim(),
        bio: bio?.trim() || null,
        website: validatedWebsite,
        position: position.trim(),
        skills: skills,
        onboardingCompleted: true,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
