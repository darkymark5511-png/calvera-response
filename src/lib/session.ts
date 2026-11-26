import { cookies } from "next/headers";
import { eq, gt } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { hashSessionToken, SESSION_COOKIE } from "./auth";

type Db = NodePgDatabase<typeof schema>;

export interface SessionUser {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
}

/** Resolves the signed-in user from the cr_session cookie, or null. */
export async function getSessionUser(db: Db): Promise<SessionUser | null> {
  // Next 16: cookies() is async.
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = hashSessionToken(token);
  const now = new Date();
  const rows = await db
    .select({
      userId: schema.sessions.userId,
      expiresAt: schema.sessions.expiresAt,
    })
    .from(schema.sessions)
    .where(eq(schema.sessions.tokenHash, tokenHash))
    .limit(1);
  const session = rows[0];
  if (!session) return null;
  if (session.expiresAt.getTime() <= now.getTime()) {
    await db
      .delete(schema.sessions)
      .where(eq(schema.sessions.tokenHash, tokenHash));
    return null;
  }
  const userRows = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      displayName: schema.users.displayName,
      role: schema.users.role,
    })
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);
  const user = userRows[0];
  if (!user) return null;
  return user;
}

/** Deletes expired sessions (best-effort cleanup helper). */
export async function pruneExpiredSessions(db: Db): Promise<void> {
  await db
    .delete(schema.sessions)
    .where(gt(schema.sessions.expiresAt, new Date(0)));
}
