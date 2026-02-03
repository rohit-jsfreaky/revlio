import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
  getUserCredits,
  getCreditHistory,
  getCreditStats,
} from "@/lib/credits";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "balance";

    if (type === "balance") {
      const balance = await getUserCredits(user.id);
      return NextResponse.json({ balance });
    }

    if (type === "history") {
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const history = await getCreditHistory(user.id, limit, offset);
      const balance = await getUserCredits(user.id);
      return NextResponse.json({ history, balance });
    }

    if (type === "stats") {
      const stats = await getCreditStats(user.id);
      return NextResponse.json(stats);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Credits API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 },
    );
  }
}
