/** Offline / Blob-backed store. No PostgreSQL. */

export class DbUnavailable extends Error {
  constructor() {
    super("Database is unavailable.");
  }
}

export type Role = "player" | "admin";

export interface UserRow {
  id: string;
  username: string;
  usernameLower: string;
  displayName: string;
  passwordHash: string;
  role: Role;
  mustChange: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ScoreRow {
  id: string;
  userId: string;
  mission: number;
  score: number;
  outcome: string;
  createdAt: string;
}

interface Store {
  users: UserRow[];
  scores: ScoreRow[];
  secrets: Record<string, string>;
  fails: Record<string, { n: number; t: number }>;
  sessions: Record<string, { userId: string; exp: number }>;
}

const g = globalThis as typeof globalThis & { __crMem?: Store };

function mem(): Store {
  if (!g.__crMem) {
    g.__crMem = { users: [], scores: [], secrets: {}, fails: {}, sessions: {} };
  }
  return g.__crMem;
}

/** Always available — memory first, optional Vercel Blob sync later. */
export async function ensureSchema(): Promise<Store> {
  return mem();
}

export async function getPepper(): Promise<string> {
  const s = mem();
  if (process.env.AUTH_PEPPER) return process.env.AUTH_PEPPER;
  if (!s.secrets.pepper) {
    s.secrets.pepper = cryptoRandom(32);
  }
  return s.secrets.pepper;
}

function cryptoRandom(n: number): string {
  const a = new Uint8Array(n);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(a);
  else for (let i = 0; i < n; i++) a[i] = (Math.random() * 256) | 0;
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function uid(): string {
  return cryptoRandom(16);
}

export { mem };
