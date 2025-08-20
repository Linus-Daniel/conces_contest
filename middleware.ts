// middleware.ts (in your project root)
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Only apply middleware to admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Check if user has admin session
    const adminSession = request.cookies.get("admin-session");

    // If no session, redirect to admin login
    if (!adminSession) {
      return NextResponse.redirect(new URL("/auth/admin", request.url));
    }

    // Verify the session token
    const adminCode = process.env.ADMIN_CODE;
    if (adminSession.value !== adminCode) {
      // Invalid session, redirect to login
      const response = NextResponse.redirect(
        new URL("/auth/admin", request.url)
      );
      response.cookies.delete("admin-session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
