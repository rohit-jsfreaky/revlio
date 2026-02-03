import { NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { SignJWT } from "jose";
import { getDb } from "@/lib/db";
import { oauthStates, users } from "@/lib/schema";
import { hashState } from "@/lib/oauth";

export const runtime = "edge";

const encoder = new TextEncoder();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(new URL("/sign-in", url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.APP_URL;
    const jwtSecret = process.env.JWT_SECRET;

    if (!clientId || !clientSecret || !appUrl || !jwtSecret) {
      return NextResponse.redirect(new URL("/sign-in", url));
    }

    const db = getDb();
    const stateHash = await hashState(state);

    const [stateRow] = await db
      .select({ id: oauthStates.id })
      .from(oauthStates)
      .where(
        and(
          eq(oauthStates.stateHash, stateHash),
          eq(oauthStates.provider, "google"),
          gt(oauthStates.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!stateRow?.id) {
      return NextResponse.redirect(new URL("/sign-in", url));
    }

    await db.delete(oauthStates).where(eq(oauthStates.id, stateRow.id));

    const redirectUri = `${appUrl}/api/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      id_token?: string;
    };

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/sign-in", url));
    }

    const profileRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const profile = (await profileRes.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };

    if (!profile.email || !profile.sub) {
      return NextResponse.redirect(new URL("/sign-in", url));
    }

    const normalizedEmail = profile.email.toLowerCase();

    const [existing] = await db
      .select({
        id: users.id,
        googleId: users.googleId,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    let isNewUser = false;

    if (existing?.id) {
      await db
        .update(users)
        .set({
          googleId: existing.googleId ?? profile.sub,
          name: profile.name ?? null,
          avatarUrl: profile.picture ?? null,
          emailVerified: profile.email_verified ?? true,
        })
        .where(eq(users.id, existing.id));
    } else {
      await db.insert(users).values({
        email: normalizedEmail,
        googleId: profile.sub,
        name: profile.name ?? null,
        avatarUrl: profile.picture ?? null,
        emailVerified: profile.email_verified ?? true,
      });
      isNewUser = true;
    }

    if (isNewUser) {
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
                <p style="margin: 0 0 12px;">You're all set. Start collecting feedback whenever you're ready.</p>
                <p style="margin: 0; font-weight: 600;">— The Revlio Team</p>
              </div>
            `,
          }),
        });
      }
    }

    const [user] = await db
      .select({ id: users.id, onboardingCompleted: users.onboardingCompleted })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user?.id) {
      return NextResponse.redirect(new URL("/sign-in", url));
    }

    const token = await new SignJWT({ sub: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(encoder.encode(jwtSecret));

    // Redirect based on onboarding status
    const redirectUrl = user.onboardingCompleted ? "/" : "/onboarding";
    const response = NextResponse.redirect(new URL(redirectUrl, url));
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
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}
