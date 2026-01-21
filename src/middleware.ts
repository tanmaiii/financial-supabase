import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Update Supabase session
  const { supabaseResponse, user } = await updateSession(request);

  // Define protected routes (routes that require authentication)
  const protectedPaths = [
    "/dashboard",
    "/transactions",
    "/budgets",
    "/goals",
    "/settings",
  ];

  // Define public auth routes (login, register, etc.)
  const authPaths = ["/login", "/register", "/forgot-password", "/"];

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Extract locale from path (format: /locale/path)
  const pathSegments = pathname.split("/").filter(Boolean);
  const locale = pathSegments[0];
  const validLocale = (routing.locales as readonly string[]).includes(locale)
    ? locale
    : routing.defaultLocale;

  // Get path without locale prefix
  const pathWithoutLocale =
    pathSegments.length > 1 ? "/" + pathSegments.slice(1).join("/") : "/";

  // Check if current path is a protected route (exact match or starts with)
  const isProtectedRoute = protectedPaths.some(
    (path) =>
      pathWithoutLocale === path || pathWithoutLocale.startsWith(path + "/"),
  );

  // Check if current path is an auth route (exact match or starts with)
  const isAuthRoute = authPaths.some(
    (path) =>
      pathWithoutLocale === path || pathWithoutLocale.startsWith(path + "/"),
  );

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !user) {
    const loginUrl = new URL(`/${validLocale}/login`, request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);

    // Preserve Supabase session cookies
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  // If user is authenticated and trying to access auth pages, redirect to home
  if (isAuthRoute && user) {
    const homeUrl = new URL(`/${validLocale}/dashboard`, request.url);
    const redirectResponse = NextResponse.redirect(homeUrl);

    // Preserve Supabase session cookies
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  // Apply internationalization middleware
  const intlResponse = intlMiddleware(request);

  // Merge Supabase cookies with intl response
  if (intlResponse) {
    supabaseResponse.headers.forEach((value, key) => {
      intlResponse.headers.set(key, value);
    });
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie);
    });
    return intlResponse;
  }

  return supabaseResponse;
}

export const config = {
  // Match all routes except API, static files, and auth callback
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*)"],
};
