"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UserDocument = {
  fileName: string;
  chunkCount: number;
};

/**
 * Fetch the current user's documents, grouped by fileName.
 */
export async function getUserDocuments(): Promise<{
  documents: UserDocument[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { documents: [], error: "Not authenticated" };
  }

  // Query all document chunks for this user (only columns we know exist)
  const { data, error } = await supabase
    .from("documents")
    .select("id, metadata")
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to fetch documents:", JSON.stringify(error));
    return { documents: [], error: error.message };
  }

  // Group by fileName from metadata
  const grouped = new Map<string, number>();

  for (const row of data ?? []) {
    const fileName =
      (row.metadata as Record<string, unknown>)?.fileName as string ??
      "unknown";
    grouped.set(fileName, (grouped.get(fileName) ?? 0) + 1);
  }

  const documents: UserDocument[] = Array.from(grouped.entries()).map(
    ([fileName, count]) => ({
      fileName,
      chunkCount: count,
    }),
  );

  return { documents };
}

/**
 * Delete all chunks for a given document (by fileName) belonging to the current user.
 */
export async function deleteUserDocument(
  fileName: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Delete all chunks where user_id matches AND metadata->>'fileName' matches
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("user_id", user.id)
    .filter("metadata->>fileName", "eq", fileName);

  if (error) {
    console.error("Failed to delete document:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
