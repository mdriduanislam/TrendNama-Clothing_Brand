import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, parseAuthSessionValue } from "@/lib/auth-session";

export async function GET() {
  const cookieStore = await cookies();
  const session = parseAuthSessionValue(
    cookieStore.get(AUTH_COOKIE_NAME)?.value
  );

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user: session });
}
