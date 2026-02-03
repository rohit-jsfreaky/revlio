import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { emailOtps, users } from "@/lib/schema";
import { generateOtp, hashOtp } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email) {
      return NextResponse.json({ ok: true });
    }

    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(emailOtps).values({
      email: normalizedEmail,
      codeHash: otpHash,
      purpose: "reset",
      expiresAt,
    });

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
          subject: "Reset your Revlio password",
          html: `
            <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #0b1220;">
              <h2 style="margin: 0 0 12px;">Reset your password</h2>
              <p style="margin: 0 0 12px;">Use this code to reset your password:</p>
              <div style="font-size: 22px; font-weight: 700; letter-spacing: 4px; margin: 8px 0 16px;">${otp}</div>
              <p style="margin: 0 0 12px;">This code expires in 10 minutes.</p>
              <p style="margin: 0; font-weight: 600;">— The Revlio Team</p>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: true });
  }
}
