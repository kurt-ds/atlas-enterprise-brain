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

  const rawPayload = await req.json();
  console.log("INCOMING PAYLOAD v6:", JSON.stringify(rawPayload));
  const { messages, chatId: bodyChatId, id: fallbackId } = rawPayload;
  const searchParams = new URL(req.url).searchParams;
  const chatId = bodyChatId || fallbackId || searchParams.get("id") || searchParams.get("chatId");

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

  let activeChatId = chatId;

  if (activeChatId) {
    // Check if chat exists, if not, create it
    const { data: chatData, error: readChatError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", activeChatId)
      .single();

    if (!chatData) {
      const { error: insertChatError } = await supabase.from("conversations").insert({
        id: activeChatId,
        user_id: user.id,
        title: userQuery.slice(0, 50) + (userQuery.length > 50 ? "..." : ""),
      });
      if (insertChatError) console.error("Insert Chat Error:", insertChatError);
    }

    // Insert user message
    const { error: insertMsgError } = await supabase.from("chat_messages").insert({
      conversation_id: activeChatId,
      role: "user",
      content: userQuery,
    });
    if (insertMsgError) console.error("Insert Message Error:", insertMsgError);
  }

  // 2. Feed the context into Llama
  const result = streamText({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    messages: await convertToModelMessages(messages),
    system: `You are the Enterprise Brain. Use the provided context to answer. 
    If the answer is not in the context, say you don't know.
    
    CONTEXT:
    ${context}`,
    onFinish: async ({ text }) => {
      // Save assistant messages
      if (activeChatId && text) {
        const { error: asstError } = await supabase.from("chat_messages").insert({
          conversation_id: activeChatId,
          role: "assistant",
          content: text,
        });
        if (asstError) console.error("Insert Assistant Error:", asstError);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
