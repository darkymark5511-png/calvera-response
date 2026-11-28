import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, query, dbAvailable } from "@/server/db";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function GET(req: NextRequest) {
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Database unavailable", code: "DB_UNAVAILABLE" }, { status: 503, headers });
  }
  const missionParam = req.nextUrl.searchParams.get("mission");
  const limitParam = req.nextUrl.searchParams.get("limit");
  const mission = missionParam ? Number(missionParam) : null;
  const limit = Math.min(50, Math.max(1, Number(limitParam) || 20));
  await ensureSchema();
  let rows;
  if (mission && mission >= 1 && mission <= 10) {
    const r = await query(
      `SELECT username_snapshot, mission, score, time_sec, rank, outcome, created_at
       FROM scores WHERE is_admin = false AND mission = $1
       ORDER BY score DESC, time_sec ASC LIMIT $2`,
      [mission, limit]
    );
    rows = r.rows;
  } else {
    const r = await query(
      `SELECT username_snapshot, mission, score, time_sec, rank, outcome, created_at
       FROM scores WHERE is_admin = false
       ORDER BY score DESC, time_sec ASC LIMIT $1`,
      [limit]
    );
    rows = r.rows;
  }
  return NextResponse.json({ entries: rows }, { headers });
}
