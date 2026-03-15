import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import type { ChatMessage } from "@/lib/types/chat";


const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


export async function generateWithNova(prompt: ChatMessage[]) {

  const body = JSON.stringify({
    messages: [
      {
        role: "user",
        content: [{ text: prompt }]
      }
    ],
    max_tokens: 200,
    temperature: 0.7
  });

  const command = new InvokeModelCommand({
    modelId: "amazon.nova-lite-v1:0",
    body,
    contentType: "application/json",
    accept: "application/json",
  });

  const response = await client.send(command);

  const responseBody = JSON.parse(
    new TextDecoder().decode(response.body)
  );

  return responseBody.output.message.content[0].text;
}