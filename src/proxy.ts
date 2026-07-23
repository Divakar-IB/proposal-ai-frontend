import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/auth/login", "/auth/reset-password"];
const PUBLIC_ROUTES = [...AUTH_ROUTES];

const isAuthRoute = (pathname: string) =>
  AUTH_ROUTES.some((route) => pathname.startsWith(route));

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("a_token")?.value;

  // Authenticated user trying to access auth pages → send to dashboard
  if (token && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/all-proposals", request.url));
  }

  // Unauthenticated user trying to access protected pages → send to login
  if (!token && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
