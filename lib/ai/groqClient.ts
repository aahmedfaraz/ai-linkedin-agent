import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateWithGroq(messages: {role: "user"|"assistant"; content: string}[]) {
  const systemPrompt = `
  You are a professional LinkedIn content writer.

  Write engaging LinkedIn posts that:
  - use simple text only (no Markdown, no asterisks, no special formatting)
  - start with a strong hook
  - use short paragraphs separated by line breaks
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
    max_tokens: 300,
  });

  const aiOutput = completion.choices[0].message.content || "";

  return aiOutput;

}