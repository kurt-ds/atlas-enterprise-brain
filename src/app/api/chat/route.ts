import { groq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    messages: await convertToModelMessages(messages),
    system: "You are the Enterprise Brain. Help the user with their data.",
  });

  return result.toUIMessageStreamResponse();
}
