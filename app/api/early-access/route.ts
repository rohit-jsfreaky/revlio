import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { earlyAccess } from "@/lib/schema";

export const runtime = "edge";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { email, source } = (await request.json()) as {
      email?: string;
      source?: string;
    };

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(earlyAccess)
      .values({
        email: email.toLowerCase(),
        source: source?.trim() || null,
      })
      .onConflictDoNothing()
      .returning({ id: earlyAccess.id });

    if (inserted?.id) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "Email service not configured" },
          { status: 500 }
        );
      }

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Revlio <hello@getrevlio.com>",
          to: email,
          subject: "You're on the Revlio early access list",
          html: `
            <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #0b1220;">
              <h2 style="margin: 0 0 12px;">Thanks for joining Revlio</h2>
              <p style="margin: 0 0 12px;">You're on the early access list. We'll email you as soon as your invite is ready.</p>
              <p style="margin: 0 0 12px;">In the meantime, keep building and we'll keep the feedback flowing.</p>
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
