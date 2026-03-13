import { NextResponse } from "next/server";
import { generateLinkedInPost } from "@/lib/ai/aiProvider";

export async function POST(req: Request) {

  const body = await req.json();
  const prompt = body.prompt;

  if (!prompt) {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400 }
    );
  }

  const post = await generateLinkedInPost(prompt);

  return NextResponse.json({
    post
  });
}