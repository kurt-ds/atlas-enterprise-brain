"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveDocumentChunksAction(chunks: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Add user_id to chunks
  const records = chunks.map(chunk => ({
    ...chunk,
    user_id: user.id
  }));

  const { error } = await supabase.from("documents").insert(records);

  if (error) {
    console.error("Save Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
