import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { ScryptOptions } from "node:crypto";

function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SALT_BYTES = 16;
const KEY_BYTES = 64;

export const SESSION_COOKIE = "cr_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashPassword(password: string): Promise<string> {
  return (async () => {
    const salt = randomBytes(SALT_BYTES);
    const key = await scryptAsync(password, salt, KEY_BYTES, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
    });
    return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
  })();
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  if (salt.length === 0 || expected.length === 0) return false;
  const actual = await scryptAsync(password, salt, expected.length, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

/** 32 random bytes, base64url encoded. Only its SHA-256 hash is stored. */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isValidUsername(username: string): boolean {
  return /^[A-Za-z0-9_]{3,20}$/.test(username);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8 && password.length <= 72;
}
