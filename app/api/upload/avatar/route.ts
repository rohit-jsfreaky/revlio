import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { uploadToR2, generateFileName, deleteFromR2, extractKeyFromUrl } from "@/lib/r2";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Note: This cannot use edge runtime due to AWS SDK compatibility
// For Cloudflare Pages, consider using Workers-specific R2 bindings instead

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 5MB" },
        { status: 400 }
      );
    }

    // Get current user's avatar to delete later
    const db = getDb();
    const [user] = await db
      .select({ avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Generate filename and upload
    const fileName = generateFileName(userId, file.name);
    const buffer = await file.arrayBuffer();
    const url = await uploadToR2(buffer, fileName, file.type);

    // Update user's avatar URL in database
    await db
      .update(users)
      .set({ avatarUrl: url })
      .where(eq(users.id, userId));

    // Delete old avatar if exists and is from R2
    if (user?.avatarUrl) {
      const oldKey = extractKeyFromUrl(user.avatarUrl);
      if (oldKey) {
        try {
          await deleteFromR2(oldKey);
        } catch {
          // Ignore deletion errors for old files
        }
      }
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
