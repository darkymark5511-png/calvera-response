import { describe, expect, it } from "vitest";
import {
  generateSessionToken,
  hashPassword,
  hashSessionToken,
  isValidPassword,
  isValidUsername,
  verifyPassword,
} from "@/lib/auth";

describe("password validation", () => {
  it("accepts 8 to 72 characters", () => {
    expect(isValidPassword("12345678")).toBe(true);
    expect(isValidPassword("a".repeat(72))).toBe(true);
  });

  it("rejects too short and too long passwords", () => {
    expect(isValidPassword("1234567")).toBe(false);
    expect(isValidPassword("a".repeat(73))).toBe(false);
  });
});

describe("username validation", () => {
  it("accepts 3 to 20 letters, digits, underscore", () => {
    expect(isValidUsername("abc")).toBe(true);
    expect(isValidUsername("Operator_07")).toBe(true);
    expect(isValidUsername("a".repeat(20))).toBe(true);
  });

  it("rejects invalid usernames", () => {
    expect(isValidUsername("ab")).toBe(false);
    expect(isValidUsername("a".repeat(21))).toBe(false);
    expect(isValidUsername("has space")).toBe(false);
    expect(isValidUsername("hyphen-name")).toBe(false);
    expect(isValidUsername("emoji🙂")).toBe(false);
  });
});

describe("password hashing", () => {
  it("stores scrypt$salt$key and verifies", async () => {
    const hash = await hashPassword("correct horse battery staple");
    const parts = hash.split("$");
    expect(parts[0]).toBe("scrypt");
    expect(parts[1]).toHaveLength(32); // 16 byte salt hex
    expect(parts[2]).toHaveLength(128); // 64 byte key hex
    await expect(verifyPassword("correct horse battery staple", hash)).resolves.toBe(
      true,
    );
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    await expect(verifyPassword("wrong password", hash)).resolves.toBe(false);
  });

  it("uses a unique salt per hash", async () => {
    const a = await hashPassword("same password");
    const b = await hashPassword("same password");
    expect(a).not.toBe(b);
  });

  it("does not throw on malformed stored hashes", async () => {
    await expect(verifyPassword("x", "not-a-hash")).resolves.toBe(false);
    await expect(verifyPassword("x", "scrypt$$")).resolves.toBe(false);
  });
});

describe("session tokens", () => {
  it("generates 32 random bytes as base64url", () => {
    const token = generateSessionToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
    expect(generateSessionToken()).not.toBe(token);
  });

  it("hashes tokens with sha-256 hex", () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
  });
});
