import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { earlyAccess } from "@/lib/schema";

export const runtime = "edge";

export async function GET() {
  try {
    const db = getDb();
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(earlyAccess);

    return NextResponse.json({ count: Number(row?.count ?? 0) });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
