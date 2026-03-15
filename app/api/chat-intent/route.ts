import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const INTENT_SYSTEM = `You are an intent classifier for a LinkedIn post assistant.

Given the user's message, respond with exactly one word: PUBLISH or IMPROVE.

- PUBLISH: the user wants to publish/post the current draft to LinkedIn. Examples: "publish it", "looks good, post it", "go ahead and publish", "post to linkedin", "that's good, publish", "ship it", "post it".
- IMPROVE: the user wants to edit or improve the post. Examples: "make it shorter", "add more emojis", "change the tone", "rewrite the opening", "make it more professional".`;

export async function POST(req: Request) {
  const body = await req.json();
  const userMessage = body.userMessage;

  if (typeof userMessage !== "string" || !userMessage.trim()) {
    return NextResponse.json(
      { error: "userMessage is required" },
      { status: 400 }
    );
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: INTENT_SYSTEM },
        { role: "user", content: userMessage.trim() },
      ],
      temperature: 0.1,
      max_tokens: 10,
    });

    const raw = (completion.choices[0].message.content || "").trim().toUpperCase();
    const intent = raw.includes("PUBLISH") ? "publish" : "improve";

    return NextResponse.json({ intent });
  } catch (e) {
    console.error("chat-intent error:", e);
    return NextResponse.json(
      { error: "Failed to detect intent" },
      { status: 500 }
    );
  }
}
