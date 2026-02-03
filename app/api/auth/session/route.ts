import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

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

    await jwtVerify(token, new TextEncoder().encode(secret));

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
