import { NextRequest, NextResponse } from "next/server";

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";

// "minimal" = openid + profile only (Sign In). Use while "Share on LinkedIn" isn't approved.
// Omit or "full" = include w_member_social for posting.
function getScopes(): string {
  if (process.env.LINKEDIN_SCOPE_LEVEL === "minimal") {
    return ["openid", "profile"].join(" ");
  }
  return ["openid", "profile", "w_member_social"].join(" ");
}

export async function GET(request: NextRequest) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/linkedin/callback`;

  if (!clientId) {
    return NextResponse.redirect(
      `${baseUrl}?error=${encodeURIComponent("linkedin_not_configured")}`
    );
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: getScopes(),
    state: crypto.randomUUID(),
  });

  const authUrl = `${LINKEDIN_AUTH_URL}?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
