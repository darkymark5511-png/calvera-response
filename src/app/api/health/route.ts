import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function GET() {
  const hasUrl = Boolean(process.env.DATABASE_URL);
  if (!hasUrl) {
    return NextResponse.json(
      { ok: false, db: "offline", code: "DB_UNAVAILABLE" },
      { status: 503, headers }
    );
  }
  return NextResponse.json({ ok: true, db: "online" }, { headers });
}
