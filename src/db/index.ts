import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Db = NodePgDatabase<typeof schema>;

let pool: Pool | null = null;
let db: Db | null = null;

/**
 * Returns the Drizzle instance, or null when DATABASE_URL is missing.
 * Nothing throws at import time — API routes check this and return
 * HTTP 503 with code DB_UNAVAILABLE so the client keeps playing offline.
 */
export function getDb(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!db) {
    // Pool max is 1 per serverless instance. SSL is required.
    pool = new Pool({
      connectionString: url,
      max: 1,
      ssl: { rejectUnauthorized: true },
    });
    db = drizzle(pool, { schema });
  }
  return db;
}

export function isDbAvailable(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
