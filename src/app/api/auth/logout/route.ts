import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { hashSessionToken, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const db = getDb();
  // Next 16: cookies() is async.
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (db && token) {
    await db
      .delete(schema.sessions)
      .where(eq(schema.sessions.tokenHash, hashSessionToken(token)));
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
