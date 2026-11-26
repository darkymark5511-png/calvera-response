import {
  integer,
  jsonb,
  pgSchema,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// All game tables live in a dedicated "game" schema — never in "public".
// The Supabase Data API exposes "public" by default; keeping game tables
// out of "public" plus RLS with no policies keeps them unreachable via anon key.
export const game = pgSchema("game");

export const users = game.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("player"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = game.table("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const progress = game.table("progress", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const scores = game.table("scores", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  usernameSnapshot: text("username_snapshot"),
  mission: integer("mission"),
  score: integer("score"),
  timeSec: integer("time_sec"),
  rank: text("rank"),
  outcome: text("outcome"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const loginAttempts = game.table("login_attempts", {
  key: text("key").primaryKey(),
  failCount: integer("fail_count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
});
