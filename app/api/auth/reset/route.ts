import { NextResponse } from "next/server";
import { and, eq, gt, isNull, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { emailOtps, users } from "@/lib/schema";
import { hashOtp, hashPassword } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { email, code, password } = (await request.json()) as {
      email?: string;
      code?: string;
      password?: string;
    };

    if (!email || !code || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase();
    const codeHash = await hashOtp(code);

    const [otpRow] = await db
      .select({ id: emailOtps.id })
      .from(emailOtps)
      .where(
        and(
          eq(emailOtps.email, normalizedEmail),
          eq(emailOtps.codeHash, codeHash),
          eq(emailOtps.purpose, "reset"),
          isNull(emailOtps.usedAt),
          gt(emailOtps.expiresAt, new Date())
        )
      )
      .orderBy(desc(emailOtps.createdAt))
      .limit(1);

    if (!otpRow?.id) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.email, normalizedEmail));

    await db
      .update(emailOtps)
      .set({ usedAt: new Date() })
      .where(eq(emailOtps.id, otpRow.id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
