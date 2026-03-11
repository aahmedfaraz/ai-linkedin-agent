import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateWithGroq(prompt: string) {

  const systemPrompt = `
You are a professional LinkedIn content writer.

Write engaging LinkedIn posts that:
- start with a strong hook
- use short paragraphs
- include emojis when appropriate
- end with relevant hashtags
- sound authentic and professional
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return completion.choices[0].message.content;
}