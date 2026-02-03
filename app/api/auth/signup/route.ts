import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { emailOtps, users } from "@/lib/schema";
import { generateOtp, hashOtp, hashPassword } from "@/lib/auth";

export const runtime = "edge";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !isValidEmail(email) || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await db
      .select({ id: users.id, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      // If user exists but email is NOT verified, resend OTP
      if (!existing[0].emailVerified) {
        // Update password in case they want to use a new one
        const passwordHash = await hashPassword(password);
        await db
          .update(users)
          .set({ passwordHash })
          .where(eq(users.email, normalizedEmail));

        // Generate and send new OTP
        const otp = generateOtp();
        const otpHash = await hashOtp(otp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.insert(emailOtps).values({
          email: normalizedEmail,
          codeHash: otpHash,
          purpose: "verify",
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
              subject: "Verify your Revlio email",
              html: `
                <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #0b1220;">
                  <h2 style="margin: 0 0 12px;">Welcome to Revlio</h2>
                  <p style="margin: 0 0 12px;">Your verification code is:</p>
                  <div style="font-size: 22px; font-weight: 700; letter-spacing: 4px; margin: 8px 0 16px;">${otp}</div>
                  <p style="margin: 0 0 12px;">This code expires in 10 minutes.</p>
                  <p style="margin: 0; font-weight: 600;">— The Revlio Team</p>
                </div>
              `,
            }),
          });
        }

        return NextResponse.json({ ok: true, resent: true });
      }
      
      // User exists and is verified
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    await db.insert(users).values({
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
    });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(emailOtps).values({
      email: normalizedEmail,
      codeHash: otpHash,
      purpose: "verify",
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
          subject: "Verify your Revlio email",
          html: `
            <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #0b1220;">
              <h2 style="margin: 0 0 12px;">Welcome to Revlio</h2>
              <p style="margin: 0 0 12px;">Your verification code is:</p>
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
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
