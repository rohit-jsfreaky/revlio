import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "revlio_session",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
