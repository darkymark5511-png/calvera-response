/**
 * Short commit sha for the "Build <sha>" string. Provided at build time by
 * `scripts/write-build-sha.mjs`, which Vercel runs before `next build`
 * (VERCEL_GIT_COMMIT_SHA) or a local build derives from git.
 */
export function buildSha(): string {
  return process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev";
}
