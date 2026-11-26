import type { ConnectionOptions } from "node:tls";

/**
 * TLS configuration for the Postgres pool.
 *
 * Supabase requires SSL. Two things trip people up here, so both are handled
 * explicitly:
 *
 * 1. `pg` builds its config as `Object.assign({}, config, parse(connectionString))`,
 *    so an `sslmode` parameter inside the URL silently replaces the `ssl` object
 *    we pass. `stripSslParams()` removes those parameters first.
 * 2. Supabase's pooler presents a chain rooted at the Supabase root CA, which is
 *    not in the Node trust store, and it intermittently omits the intermediate
 *    certificate. Verifying against the system store therefore fails with
 *    SELF_SIGNED_CERT_IN_CHAIN. Set DATABASE_CA_CERT to the Supabase root CA PEM
 *    to pin it and get full verification; without it, TLS stays enabled but the
 *    chain is not verified.
 *
 * A local database can opt out of TLS explicitly with `sslmode=disable`; there is
 * no way to disable TLS by accident.
 */
export function stripSslParams(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    for (const key of [
      "sslmode",
      "sslrootcert",
      "sslcert",
      "sslkey",
      "uselibpqcompat",
    ]) {
      url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return connectionString;
  }
}

export function isLocalConnection(connectionString: string): boolean {
  try {
    const host = new URL(connectionString).hostname;
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "0.0.0.0"
    );
  } catch {
    return false;
  }
}

export function sslFor(
  connectionString: string,
  ca: string | undefined = process.env.DATABASE_CA_CERT,
): ConnectionOptions | undefined {
  if (
    isLocalConnection(connectionString) &&
    /[?&]sslmode=disable\b/.test(connectionString)
  ) {
    return undefined;
  }
  if (ca) {
    return { ca, rejectUnauthorized: true };
  }
  // Encrypted, but the chain is not verified. See the note above.
  return { rejectUnauthorized: false };
}
