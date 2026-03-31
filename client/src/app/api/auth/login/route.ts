import { NextResponse } from "next/server";

import { createAuthSessionValue, AUTH_COOKIE_NAME } from "@/lib/auth-session";
import { verifyUserCredentials } from "@/lib/users-data";
import { loginFormSchema } from "@/types";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = loginFormSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email or password format." },
      { status: 400 }
    );
  }

  const user = await verifyUserCredentials(parsed.data.email, parsed.data.password);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ user });
  response.cookies.set(AUTH_COOKIE_NAME, createAuthSessionValue(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
