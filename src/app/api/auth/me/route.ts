import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { getSessionUser } from "@/lib/session";
import { dbUnavailable } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user });
}
