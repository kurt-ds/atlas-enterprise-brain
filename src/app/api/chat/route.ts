import { groq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages } from "ai";
import { getContext } from "@/lib/retrieve";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  // Authenticate the user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  // Get the last message
  const lastMessage = messages[messages.length - 1];

  // SECURE EXTRACTION: Handle both legacy .content and new .parts
  let userQuery = "";
  if (lastMessage.content) {
    userQuery = lastMessage.content;
  } else if (lastMessage.parts) {
    userQuery = lastMessage.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");
  }

  if (!userQuery) {
    throw new Error("No text found in user message");
  }

  // 1. Get relevant data from Supabase (scoped to this user's documents)
  const context = await getContext(supabase, userQuery, user.id);

  console.log("Retrieved Context:", context);

  // 2. Feed the context into Llama
  const result = streamText({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    messages: await convertToModelMessages(messages),
    system: `You are the Enterprise Brain. Use the provided context to answer. 
    If the answer is not in the context, say you don't know.
    
    CONTEXT:
    ${context}`,
  });

  return result.toUIMessageStreamResponse();
}
