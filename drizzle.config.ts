/** Drizzle kit config — not part of Next build. Install drizzle-kit locally to migrate. */
const config = {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
};

export default config;
