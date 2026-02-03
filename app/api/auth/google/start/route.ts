import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { oauthStates } from "@/lib/schema";
import { generateState, hashState } from "@/lib/oauth";

export const runtime = "edge";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.APP_URL;

  if (!clientId || !appUrl) {
    return NextResponse.json(
      { error: "Google auth not configured" },
      { status: 500 }
    );
  }

  const state = generateState();
  const stateHash = await hashState(state);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const db = getDb();
  await db.insert(oauthStates).values({
    provider: "google",
    stateHash,
    expiresAt,
  });

  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
