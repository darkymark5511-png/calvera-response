import { randomBytes, scrypt, timingSafeEqual, createHmac, createHash } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const N = 16384;
const r = 8;
const p = 1;
const KEYLEN = 64;

function pepper(): string {
  return process.env.AUTH_PEPPER ?? "cr-default-pepper-change-in-prod-2026";
}

function prehash(password: string): Buffer {
  return createHmac("sha256", pepper()).update(password).digest();
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scryptAsync(prehash(password), salt, KEYLEN, { N, r, p })) as Buffer;
  return `scrypt$${N}$${r}$${p}$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const n = Number(parts[1]);
  const rr = Number(parts[2]);
  const pp = Number(parts[3]);
  const salt = Buffer.from(parts[4]!, "hex");
  const expected = Buffer.from(parts[5]!, "hex");
  const key = (await scryptAsync(prehash(password), salt, expected.length, { N: n, r: rr, p: pp })) as Buffer;
  if (key.length !== expected.length) return false;
  return timingSafeEqual(key, expected);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}
