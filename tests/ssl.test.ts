import { describe, expect, it } from "vitest";
import { isLocalConnection, sslFor, stripSslParams } from "@/db/ssl";

const PROD =
  "postgresql://postgres.abcdefghijklmnop:secret@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

describe("stripSslParams", () => {
  it("removes sslmode so it cannot override the ssl option", () => {
    expect(stripSslParams(`${PROD}?sslmode=require`)).toBe(PROD);
  });

  it("removes every ssl-related parameter", () => {
    const withParams = `${PROD}?sslmode=verify-full&sslrootcert=/tmp/ca.pem&sslcert=/tmp/c.pem&sslkey=/tmp/k.pem&uselibpqcompat=true`;
    expect(stripSslParams(withParams)).toBe(PROD);
  });

  it("keeps unrelated parameters", () => {
    expect(stripSslParams(`${PROD}?application_name=calvera&sslmode=require`)).toBe(
      `${PROD}?application_name=calvera`,
    );
  });

  it("returns the input unchanged when it is not a URL", () => {
    expect(stripSslParams("not a url")).toBe("not a url");
  });
});

describe("isLocalConnection", () => {
  it("recognises loopback hosts", () => {
    expect(isLocalConnection("postgresql://postgres@127.0.0.1:5544/postgres")).toBe(
      true,
    );
    expect(isLocalConnection("postgresql://postgres@localhost:5432/postgres")).toBe(
      true,
    );
  });

  it("does not treat a remote pooler as local", () => {
    expect(isLocalConnection(PROD)).toBe(false);
  });
});

describe("sslFor", () => {
  it("enables TLS for a remote host even without a CA", () => {
    expect(sslFor(PROD, undefined)).toEqual({ rejectUnauthorized: false });
  });

  it("pins the CA and verifies the chain when DATABASE_CA_CERT is provided", () => {
    expect(sslFor(PROD, "-----BEGIN CERTIFICATE-----")).toEqual({
      ca: "-----BEGIN CERTIFICATE-----",
      rejectUnauthorized: true,
    });
  });

  it("disables TLS only for an explicit loopback sslmode=disable", () => {
    expect(sslFor("postgresql://postgres@127.0.0.1:5544/postgres?sslmode=disable")).toBe(
      undefined,
    );
  });

  it("never disables TLS for a remote host, even with sslmode=disable", () => {
    expect(sslFor(`${PROD}?sslmode=disable`)).toEqual({
      rejectUnauthorized: false,
    });
  });
});
