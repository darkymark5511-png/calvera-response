import { NextRequest, NextResponse } from "next/server";
import { scoreBody, scorePlausible } from "@/shared/validation";
import { ensureSchema, query, dbAvailable } from "@/server/db";
import { getSessionUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(req: NextRequest) {
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Database unavailable", code: "DB_UNAVAILABLE" }, { status: 503, headers });
  }
  const user = await getSessionUser();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON", code: "BAD_REQUEST" }, { status: 400, headers });
  }
  const parsed = scoreBody.safeParse(body);
  if (!parsed.success || !scorePlausible(parsed.data)) {
    return NextResponse.json({ error: "Invalid score", code: "VALIDATION" }, { status: 400, headers });
  }
  await ensureSchema();
  const s = parsed.data;
  await query(
    `INSERT INTO scores (user_id, username_snapshot, mission, score, time_sec, rank, outcome, is_admin)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      user?.id ?? null,
      user?.username ?? "guest",
      s.mission,
      s.score,
      s.timeSec,
      s.rank,
      s.outcome,
      user?.role === "admin",
    ]
  );
  return NextResponse.json({ ok: true }, { headers });
}
