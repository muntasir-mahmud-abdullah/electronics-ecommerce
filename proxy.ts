import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes, but allow /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const refreshToken = request.cookies.get("gadgethub_refresh")?.value;
    
    if (!refreshToken) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
