import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No migrations run inside the Vercel build command.
  // Migrations are applied separately via `npm run db:migrate`.
};

export default nextConfig;
