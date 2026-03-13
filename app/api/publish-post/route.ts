import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const LINKEDIN_POST_URL = "https://api.linkedin.com/v2/ugcPosts";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const LINKEDIN_TOKEN_COOKIE = "linkedin_access_token";

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  const cookieStore = await cookies();
  const token = cookieStore.get(LINKEDIN_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { error: "linkedin_not_connected" },
      { status: 401 }
    );
  }

  // 1️⃣ Get LinkedIn user ID
  const userRes = await fetch(LINKEDIN_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!userRes.ok) {
    return NextResponse.json({ error: "failed_userinfo" }, { status: 500 });
  }

  const user = await userRes.json();
  const author = `urn:li:person:${user.sub}`;

  // 2️⃣ Create LinkedIn post
  const postRes = await fetch(LINKEDIN_POST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });

  const result = await postRes.text();

  if (!postRes.ok) {
    return NextResponse.json({ error: result }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}