import { createHmac, randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";

const N = 16384, R = 8, P = 1, KEYLEN = 64;

function derive(input: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((res, rej) => {
    scrypt(input, salt, KEYLEN, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (e, key) => (e ? rej(e) : res(key)));
  });
}
/** Pepper layer: HMAC-SHA-256 of the password with a server-side secret. */
const peppered = (password: string, pepper: string): string => createHmac("sha256", pepper).update(password).digest("base64");

export async function hashPassword(password: string, pepper: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(peppered(password, pepper), salt, N, R, P);
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string, pepper: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltHex, hashHex] = parts;
  const expected = Buffer.from(hashHex, "hex");
  const key = await derive(peppered(password, pepper), Buffer.from(saltHex, "hex"), Number(n), Number(r), Number(p));
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export const newToken = (): string => randomBytes(32).toString("base64url");
export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");
