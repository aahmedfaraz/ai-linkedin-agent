import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const LINKEDIN_TOKEN_COOKIE = "linkedin_access_token";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(LINKEDIN_TOKEN_COOKIE)?.value;
  return NextResponse.json({ connected: !!token });
}
