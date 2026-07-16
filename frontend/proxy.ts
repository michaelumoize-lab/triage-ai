// proxy.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/dashboard/:path*",
  "/patients",
  "/patients/:path*",
  "/diagnosis",
  "/diagnosis/:path*",
  "/consultations",
  "/consultations/:path*",
  "/settings",
];
// Auth routes (redirect to dashboard if already logged in)
const authRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthenticated = !!session;
  const path = request.nextUrl.pathname;

  // Check if path is protected
  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.endsWith("/:path*")) {
      const base = route.replace("/:path*", "");
      return path.startsWith(base);
    }
    return path === route;
  });

  // Check if path is an auth route
  const isAuthRoute = authRoutes.includes(path);

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
