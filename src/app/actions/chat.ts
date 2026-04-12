"use server";

import { createClient } from "@/lib/supabase/server";

export type ChatSession = {
  id: string;
  title: string;
  created_at: string;
};

export async function getUserChats(): Promise<{ success: boolean; chats: ChatSession[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized", chats: [] };
    }

    const { data: chats, error } = await supabase
      .from("conversations")
      .select("id, title, created_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return { success: true, chats: chats ?? [] };
  } catch (err: any) {
    console.error("Error fetching chats:", err);
    return { success: false, error: err.message, chats: [] };
  }
}

export async function getChatMessages(chatId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized", messages: [] };
    }

    const { data: records, error } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", chatId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const messages = records.map((record) => ({
      id: record.id,
      role: record.role as "user" | "assistant" | "system",
      parts: [{ type: "text" as const, text: record.content }],
      createdAt: new Date(record.created_at),
    }));
    return { success: true, messages };
  } catch (err: any) {
    console.error("Error fetching chat messages:", err);
    return { success: false, error: err.message, messages: [] };
  }
}

export async function deleteChat(chatId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("conversations").delete().eq("id", chatId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
