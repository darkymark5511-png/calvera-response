// Server-only one-time bootstrap credentials. Used only when no admin row exists and env vars are unset.
// The account is forced to change this password on first login.
const FALLBACK = { username: "AdminClaude", password: "ClaudeAdmin8781" };

export function bootstrapCredentials(): { username: string; password: string } {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  return username && password ? { username, password } : FALLBACK;
}

/** True when a candidate password equals the built-in bootstrap value. */
export const isBootstrapPassword = (candidate: string): boolean => candidate === FALLBACK.password;
