import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getToken } from "next-auth/jwt";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-change-me"
);

export async function middleware(req: NextRequest) {
  // Mobile app: check for Bearer token first
  const authorization = req.headers.get("Authorization");
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7);
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  // Web app: check for NextAuth session
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const isApiRoute = req.nextUrl.pathname.startsWith("/api/");
    if (isApiRoute) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin-only route guard
  const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard/users");
  if (isAdminRoute && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/animals/:path*",
    "/api/crops/:path*",
    "/api/crop-types/:path*",
    "/api/equipment/:path*",
    "/api/expenses/:path*",
    "/api/fields/:path*",
    "/api/goats/:path*",
    "/api/income/:path*",
    "/api/inventory/:path*",
    "/api/notifications/:path*",
    "/api/reports/:path*",
    "/api/tasks/:path*",
    "/api/users/:path*",
    "/api/workers/:path*",
    "/api/dashboard/:path*",
  ],
};
