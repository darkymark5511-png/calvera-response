import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function GET() {
  return NextResponse.json(
    { error: "Not signed in", code: "UNAUTHORIZED" },
    { status: 401, headers }
  );
}
