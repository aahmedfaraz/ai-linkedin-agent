import Groq from "groq-sdk";
import type { ChatMessage } from "@/lib/types/chat";


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


export async function generateWithGroq(messages: ChatMessage[]) {

  const systemPrompt = `
You are a professional LinkedIn content writer.

Write engaging LinkedIn posts that:
- start with a strong hook
- use short paragraphs
- include emojis when appropriate
- end with relevant hashtags
- sound authentic and professional

If the user asks to improve or modify a post, edit the existing post rather than writing a completely unrelated one.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  return completion.choices[0].message.content ?? "";
}