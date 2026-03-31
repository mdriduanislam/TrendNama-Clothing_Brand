import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, createAuthSessionValue } from "@/lib/auth-session";
import { registerUser } from "@/lib/users-data";
import { registerFormSchema } from "@/types";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = registerFormSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration payload." }, { status: 400 });
  }

  const result = await registerUser({
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const response = NextResponse.json({ user: result.user }, { status: 201 });
  response.cookies.set(AUTH_COOKIE_NAME, createAuthSessionValue(result.user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
