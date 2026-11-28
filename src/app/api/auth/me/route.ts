import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import { dbAvailable } from "@/server/db";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function GET() {
  if (!dbAvailable()) {
    return NextResponse.json({ error: "Database unavailable", code: "DB_UNAVAILABLE" }, { status: 503, headers });
  }
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in", code: "UNAUTHORIZED" }, { status: 401, headers });
    }
    return NextResponse.json(user, { headers });
  } catch {
    return NextResponse.json({ error: "Database unavailable", code: "DB_UNAVAILABLE" }, { status: 503, headers });
  }
}
