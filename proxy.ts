import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get access token from Authorization header
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  // Get refresh token from cookies
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // Verify access token
  let isAuthenticated = false;
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) {
      isAuthenticated = true;
    }
  }

  // If access token is invalid but refresh token exists, consider as authenticated
  // (The frontend will handle token refresh)
  if (!isAuthenticated && refreshToken) {
    isAuthenticated = true;
  }

  // Protect /admin routes, but allow /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!refreshToken) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect dashboard route
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login/register pages
  if ((pathname === "/login" || pathname === "/register") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/register"],
};
