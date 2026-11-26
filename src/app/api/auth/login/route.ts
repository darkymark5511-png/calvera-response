import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import {
  generateSessionToken,
  hashSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  verifyPassword,
} from "@/lib/auth";
import { clearFailures, isRateLimited, recordFailure } from "@/lib/rate-limit";
import { dbUnavailable, genericLoginError, rateLimited } from "@/lib/http";

export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbUnavailable();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return genericLoginError();
  }

  const { username, password } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
  };

  if (typeof username !== "string" || typeof password !== "string") {
    return genericLoginError();
  }

  const ip = clientIp(req);
  const normalized = username.toLowerCase();

  if (await isRateLimited(db, ip, normalized)) {
    return rateLimited();
  }

  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, normalized))
    .limit(1);
  const user = rows[0];

  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    await recordFailure(db, ip, normalized);
    return genericLoginError();
  }

  await clearFailures(db, ip, normalized);

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(schema.sessions).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const res = NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  return res;
}
