import { NextResponse } from "next/server";
import { and, eq, gt, isNull, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { emailOtps, users } from "@/lib/schema";
import { hashOtp } from "@/lib/auth";
import { grantInitialCredits } from "@/lib/credits";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { email, code } = (await request.json()) as {
      email?: string;
      code?: string;
    };

    if (!email || !code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
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
          eq(emailOtps.purpose, "verify"),
          isNull(emailOtps.usedAt),
          gt(emailOtps.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(emailOtps.createdAt))
      .limit(1);

    if (!otpRow?.id) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 },
      );
    }

    await db
      .update(emailOtps)
      .set({ usedAt: new Date() })
      .where(eq(emailOtps.id, otpRow.id));

    // Get user before update to check if already verified
    const [userRecord] = await db
      .select({ id: users.id, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    const wasAlreadyVerified = userRecord?.emailVerified;

    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.email, normalizedEmail));

    // Grant initial credits only on first verification
    if (userRecord?.id && !wasAlreadyVerified) {
      await grantInitialCredits(userRecord.id);
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Revlio <hello@getrevlio.com>",
          to: normalizedEmail,
          subject: "Welcome to Revlio",
          html: `
            <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #0b1220;">
              <h2 style="margin: 0 0 12px;">Welcome to Revlio</h2>
              <p style="margin: 0 0 12px;">Your email is verified. You can now sign in and start collecting feedback.</p>
              <p style="margin: 0; font-weight: 600;">— The Revlio Team</p>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
