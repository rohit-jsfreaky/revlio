import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { verifyPassword } from "@/lib/auth";

export const runtime = "edge";

const encoder = new TextEncoder();

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase();

    const [user] = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Email not verified" },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Auth not configured" },
        { status: 500 }
      );
    }

    const token = await new SignJWT({ sub: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(encoder.encode(secret));

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: "revlio_session",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
