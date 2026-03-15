import { NextResponse } from "next/server";
import { generateLinkedInPost } from "@/lib/ai/aiProvider";

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages;

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "messages are required" },
      { status: 400 }
    );
  }

  const post = await generateLinkedInPost(messages);

  return NextResponse.json({
    post
  });
}