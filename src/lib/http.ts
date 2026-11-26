import { NextResponse } from "next/server";

export function jsonError(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function dbUnavailable(): NextResponse {
  return jsonError(503, "DB_UNAVAILABLE", "Database is unavailable.");
}

export function rateLimited(): NextResponse {
  return jsonError(429, "RATE_LIMIT", "Too many failed login attempts. Try again later.");
}

export function genericLoginError(): NextResponse {
  return jsonError(401, "INVALID_CREDENTIALS", "Username or password is incorrect.");
}
