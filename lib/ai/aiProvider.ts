import { generateWithGroq } from "./groqClient";
import { generateWithNova } from "./novaClient";
import type { ChatMessage } from "@/lib/types/chat";

export async function generateLinkedInPost(messages: ChatMessage[]) {

  const provider = process.env.AI_PROVIDER;

  if (provider === "nova") {
    return await generateWithNova(messages);
  }

  return await generateWithGroq(messages);
}