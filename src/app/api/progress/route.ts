import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { dbUnavailable, jsonError } from "@/lib/http";
import { parseCareer, serialiseCareer, type CareerState } from "@/game/hq/progress";

export const dynamic = "force-dynamic";

/** Largest accepted career payload. A save is a few hundred bytes. */
const MAX_BODY_BYTES = 16 * 1024;

/**
 * Progress is server-authoritative for signed-in accounts: the client posts a
 * career blob and the server normalises it through the same parser the offline
 * path uses. Guests never reach this route — their save stays in localStorage.
 */
export async function GET() {
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await getSessionUser(db);
  if (!user) return jsonError(401, "UNAUTHENTICATED", "Sign in to load your career.");

  const rows = await db
    .select({ data: schema.progress.data, updatedAt: schema.progress.updatedAt })
    .from(schema.progress)
    .where(eq(schema.progress.userId, user.id))
    .limit(1);

  const row = rows[0];
  if (!row) return NextResponse.json({ career: null }, { status: 200 });

  return NextResponse.json({ career: parseCareer(row.data) }, { status: 200 });
}

export async function PUT(request: Request) {
  const db = getDb();
  if (!db) return dbUnavailable();

  const user = await getSessionUser(db);
  if (!user) return jsonError(401, "UNAUTHENTICATED", "Sign in to save your career.");

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonError(413, "PAYLOAD_TOO_LARGE", "Career payload is too large.");
  }

  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be JSON.");
  }

  const career: CareerState = parseCareer(body);
  const updatedAt = new Date();

  await db
    .insert(schema.progress)
    .values({ userId: user.id, data: career, updatedAt })
    .onConflictDoUpdate({
      target: schema.progress.userId,
      set: { data: career, updatedAt },
    });

  return NextResponse.json(
    { career: parseCareer(serialiseCareer(career)) },
    { status: 200 },
  );
}
