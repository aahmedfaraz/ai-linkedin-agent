import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_TOKEN_COOKIE = "linkedin_access_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/linkedin/callback`;
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}?error=${encodeURIComponent("missing_code_or_config")}`
    );
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const tokenRes = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.redirect(
      `${baseUrl}?error=${encodeURIComponent(err || "token_exchange_failed")}`
    );
  }

  const data = (await tokenRes.json()) as { access_token?: string };
  const accessToken = data.access_token;

  if (!accessToken) {
    return NextResponse.redirect(
      `${baseUrl}?error=${encodeURIComponent("no_access_token")}`
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(LINKEDIN_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return NextResponse.redirect(baseUrl);
}
