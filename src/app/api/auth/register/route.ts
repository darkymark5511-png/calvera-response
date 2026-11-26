import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import {
  hashPassword,
  isValidPassword,
  isValidUsername,
} from "@/lib/auth";
import { dbUnavailable, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbUnavailable();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body.");
  }

  const { username, password } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
  };

  if (typeof username !== "string" || !isValidUsername(username)) {
    return jsonError(
      400,
      "INVALID_USERNAME",
      "Username must be 3 to 20 characters: letters, digits, underscore.",
    );
  }
  if (typeof password !== "string" || !isValidPassword(password)) {
    return jsonError(
      400,
      "INVALID_PASSWORD",
      "Password must be 8 to 72 characters.",
    );
  }

  const normalized = username.toLowerCase();
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.username, normalized))
    .limit(1);
  if (existing.length > 0) {
    return jsonError(409, "USERNAME_TAKEN", "Username is already taken.");
  }

  const passwordHash = await hashPassword(password);
  const inserted = await db
    .insert(schema.users)
    .values({
      username: normalized,
      displayName: username,
      passwordHash,
      role: "player",
    })
    .returning({ id: schema.users.id, username: schema.users.username });

  return NextResponse.json(
    { user: { id: inserted[0].id, username: inserted[0].username } },
    { status: 201 },
  );
}
