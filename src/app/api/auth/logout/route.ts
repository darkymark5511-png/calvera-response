import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST() {
  const res = NextResponse.json({ ok: true }, { headers });
  res.cookies.set("cr_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
