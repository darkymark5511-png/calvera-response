import { NextResponse } from "next/server";
import { getDb } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { status: "error", database: "unavailable", code: "DB_UNAVAILABLE" },
      { status: 503 },
    );
  }
  try {
    await db.execute("select 1");
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    return NextResponse.json(
      { status: "error", database: "unavailable", code: "DB_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
