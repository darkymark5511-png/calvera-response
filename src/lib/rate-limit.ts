import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

type Db = NodePgDatabase<typeof schema>;

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

function ipKey(ip: string): string {
  return `ip:${ip}`;
}

function userKey(username: string): string {
  return `user:${username.toLowerCase()}`;
}

function isWithinWindow(windowStart: Date, now: Date): boolean {
  return now.getTime() - windowStart.getTime() < WINDOW_MS;
}

/**
 * Returns true when either the IP or the username has hit the limit
 * (5 failed attempts per 15 minutes). The sixth attempt is blocked.
 */
export async function isRateLimited(
  db: Db,
  ip: string,
  username: string,
): Promise<boolean> {
  const now = new Date();
  for (const key of [ipKey(ip), userKey(username)]) {
    const rows = await db
      .select()
      .from(schema.loginAttempts)
      .where(eq(schema.loginAttempts.key, key))
      .limit(1);
    const row = rows[0];
    if (!row) continue;
    if (!isWithinWindow(row.windowStart, now)) continue;
    if (row.failCount >= MAX_FAILURES) return true;
  }
  return false;
}

/** Records a failed attempt for both the IP and the username. */
export async function recordFailure(
  db: Db,
  ip: string,
  username: string,
): Promise<void> {
  const now = new Date();
  for (const key of [ipKey(ip), userKey(username)]) {
    const rows = await db
      .select()
      .from(schema.loginAttempts)
      .where(eq(schema.loginAttempts.key, key))
      .limit(1);
    const row = rows[0];
    if (!row) {
      await db
        .insert(schema.loginAttempts)
        .values({ key, failCount: 1, windowStart: now });
      continue;
    }
    if (!isWithinWindow(row.windowStart, now)) {
      await db
        .update(schema.loginAttempts)
        .set({ failCount: 1, windowStart: now })
        .where(eq(schema.loginAttempts.key, key));
    } else {
      await db
        .update(schema.loginAttempts)
        .set({ failCount: row.failCount + 1 })
        .where(eq(schema.loginAttempts.key, key));
    }
  }
}

/** Clears failure counters after a successful login. */
export async function clearFailures(
  db: Db,
  ip: string,
  username: string,
): Promise<void> {
  for (const key of [ipKey(ip), userKey(username)]) {
    await db
      .delete(schema.loginAttempts)
      .where(eq(schema.loginAttempts.key, key));
  }
}
