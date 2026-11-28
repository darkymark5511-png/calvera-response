import { NextResponse } from "next/server";
import { dbAvailable, ensureSchema, query } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!dbAvailable()) {
    return NextResponse.json(
      { ok: false, db: "offline", code: "DB_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }
    );
  }
  try {
    await ensureSchema();
    await query("SELECT 1");
    return NextResponse.json(
      { ok: true, db: "online" },
      { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, db: "error", code: "DB_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }
    );
  }
}
