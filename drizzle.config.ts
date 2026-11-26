import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Only touch the dedicated "game" schema — never Supabase internal schemas.
  schemaFilter: ["game"],
  dbCredentials: {
    // drizzle-kit uses the session pooler (port 5432) from a developer machine or CI.
    // Never hardcode a connection string here.
    url: process.env.DATABASE_URL_MIGRATE ?? process.env.DATABASE_URL ?? "",
  },
});
