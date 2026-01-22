import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get locale from cookie or default to 'en'
      const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";

      // Redirect to localized path
      const redirectPath = next ? `/${locale}${next}` : `/${locale}/dashboard`;
      const redirectUrl = new URL(redirectPath, origin);

      return NextResponse.redirect(redirectUrl);
    }

    // If there's an error with code exchange
    const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
    return NextResponse.redirect(
      new URL(
        `/${locale}/login?error=${encodeURIComponent(error.message)}`,
        origin,
      ),
    );
  }

  // If there's no code, redirect to login with error
  const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
  return NextResponse.redirect(
    new URL(`/${locale}/login?error=no_code`, origin),
  );
}
