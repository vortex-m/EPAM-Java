import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleRoutes: Record<string, string> = {
  USER: "/user",
  AGENT: "/agent",
  OFFICER: "/officer",
  MANAGER: "/manager",
  ADMIN: "/admin",
};

const authPages = new Set(["/login", "/register", "/auth/login", "/auth/register"]);

function withNoStoreHeaders(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

function handleAuthRouting(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const normalizedRole = role?.toUpperCase();
  const path = req.nextUrl.pathname;

  if (token && authPages.has(path)) {
    const redirectTarget = roleRoutes[normalizedRole ?? ""] ?? "/user";
    return withNoStoreHeaders(NextResponse.redirect(new URL(redirectTarget, req.url)));
  }

  const protectedPrefixes = Object.values(roleRoutes);
  const isProtectedPath = protectedPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  if (isProtectedPath && !token) {
    return withNoStoreHeaders(NextResponse.redirect(new URL("/login", req.url)));
  }

  for (const [routeRole, prefix] of Object.entries(roleRoutes)) {
    const hitRolePath = path === prefix || path.startsWith(`${prefix}/`);
    if (hitRolePath && normalizedRole !== routeRole) {
      if (!token) {
        return withNoStoreHeaders(NextResponse.redirect(new URL("/login", req.url)));
      }
      const fallback = roleRoutes[normalizedRole ?? ""] ?? "/login";
      return withNoStoreHeaders(NextResponse.redirect(new URL(fallback, req.url)));
    }
  }

  return withNoStoreHeaders(NextResponse.next());
}

export function proxy(req: NextRequest) {
  return handleAuthRouting(req);
}

export function middleware(req: NextRequest) {
  return handleAuthRouting(req);
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/auth/login",
    "/auth/register",
    "/auth/:path*",
    "/admin",
    "/admin/:path*",
    "/manager",
    "/manager/:path*",
    "/officer",
    "/officer/:path*",
    "/agent",
    "/agent/:path*",
    "/user",
    "/user/:path*",
  ],
};
