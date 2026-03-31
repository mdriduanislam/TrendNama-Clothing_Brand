import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, parseAuthSessionValue } from "@/lib/auth-session";

export function middleware(request: NextRequest) {
  const session = parseAuthSessionValue(
    request.cookies.get(AUTH_COOKIE_NAME)?.value
  );
  const isAuthenticated = Boolean(session);

  const { pathname, search } = request.nextUrl;
  const isCartRoute = pathname.startsWith("/cart");
  const isOrdersRoute = pathname.startsWith("/orders");
  const isLoginRoute = pathname === "/login";
  const isRegisterRoute = pathname === "/register";

  if ((isCartRoute || isOrdersRoute) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if ((isLoginRoute || isRegisterRoute) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cart/:path*", "/orders/:path*", "/login", "/register"],
};
