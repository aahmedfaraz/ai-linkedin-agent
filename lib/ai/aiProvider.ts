import { generateWithGroq } from "./groqClient";
import { generateWithNova } from "./novaClient";

export async function generateLinkedInPost(prompt: string) {

  const provider = process.env.AI_PROVIDER;

  if (provider === "nova") {
    return await generateWithNova(prompt);
  }

  return await generateWithGroq(prompt);
}