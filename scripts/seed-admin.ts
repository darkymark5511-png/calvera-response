import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";

const MIN_ADMIN_PASSWORD_LENGTH = 12;

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const connectionString =
    process.env.DATABASE_URL_MIGRATE ?? process.env.DATABASE_URL;

  if (!username || !password) {
    console.error(
      "seed-admin: ADMIN_USERNAME and ADMIN_PASSWORD must both be set. " +
        "Export them in your shell or a local .env file that is not committed.",
    );
    process.exit(1);
  }

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    console.error(
      "seed-admin: ADMIN_USERNAME must be 3 to 20 characters: letters, digits, underscore.",
    );
    process.exit(1);
  }

  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    console.error(
      `seed-admin: ADMIN_PASSWORD must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`,
    );
    process.exit(1);
  }

  if (!connectionString) {
    console.error(
      "seed-admin: DATABASE_URL_MIGRATE (preferred) or DATABASE_URL must be set.",
    );
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    max: 1,
    ssl: { rejectUnauthorized: true },
  });
  const db = drizzle(pool, { schema });

  try {
    const passwordHash = await hashPassword(password);
    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(schema.users)
        .set({ passwordHash, role: "admin" })
        .where(eq(schema.users.username, username));
      console.log(`seed-admin: updated admin account "${username}".`);
    } else {
      await db.insert(schema.users).values({
        username,
        displayName: username,
        passwordHash,
        role: "admin",
      });
      console.log(`seed-admin: created admin account "${username}".`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(
    "seed-admin: failed —",
    error instanceof Error ? error.message : "unknown error",
  );
  process.exit(1);
});
