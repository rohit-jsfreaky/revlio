import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { uploadToR2 } from "@/lib/r2";

// Note: This cannot use edge runtime due to AWS SDK compatibility
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = getCookieValue(request.headers.get("cookie"), "revlio_session");
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    return payload.sub as string;
  } catch {
    return null;
  }
}

// Generate a unique filename for project screenshots
function generateScreenshotFileName(
  userId: string,
  originalName: string,
): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `projects/${userId}/${timestamp}-${randomId}.${ext}`;
}

export async function POST(request: NextRequest) {
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
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 5MB" },
        { status: 400 },
      );
    }

    // Generate filename and upload
    const fileName = generateScreenshotFileName(userId, file.name);
    const buffer = await file.arrayBuffer();
    const url = await uploadToR2(buffer, fileName, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
