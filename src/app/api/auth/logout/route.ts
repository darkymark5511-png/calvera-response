import { NextResponse } from "next/server";
import { destroySession } from "@/server/auth/session";
import { dbAvailable } from "@/server/db";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST() {
  if (dbAvailable()) {
    try {
      await destroySession();
    } catch {
      /* offline ok */
    }
  }
  return NextResponse.json({ ok: true }, { headers });
}
