import type { NextConfig } from "next";
import { execSync } from "node:child_process";

function resolveBuildSha(): string {
  const fromVercel = process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromVercel) return fromVercel.slice(0, 7);
  try {
    return execSync("git rev-parse --short=7 HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
}

const nextConfig: NextConfig = {
  // The short commit sha is inlined at build time for the menu's "Build <sha>"
  // string. Migrations never run here.
  env: {
    NEXT_PUBLIC_BUILD_SHA: resolveBuildSha(),
  },
};

export default nextConfig;
