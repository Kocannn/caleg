import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const roleRoutes: Record<string, string[]> = {
  ADMIN: ["/admin"],
  CALEG: ["/caleg"],
  KOORDINATOR: ["/koordinator"],
  RELAWAN: ["/relawan"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect authenticated users from / to their dashboard
  if (pathname === "/") {
    if (req.auth?.user?.role) {
      const redirectPath = roleRoutes[req.auth.user.role]?.[0] || "/login";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check if authenticated
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userRole = req.auth.user?.role;

  // Check route access
  for (const [role, routes] of Object.entries(roleRoutes)) {
    for (const route of routes) {
      if (pathname.startsWith(route) && userRole !== role) {
        // Redirect to their own dashboard
        const redirectPath = roleRoutes[userRole!]?.[0] || "/login";
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
