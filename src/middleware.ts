import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard/users");
    
    // Check admin-only routes
    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

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
