import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST() {
  return NextResponse.json(
    { error: "Database unavailable", code: "DB_UNAVAILABLE" },
    { status: 503, headers }
  );
}
