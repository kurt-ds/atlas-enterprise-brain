import { pipeline } from "@huggingface/transformers";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getContext(
  supabase: SupabaseClient,
  query: string,
  userId: string,
) {
  // Guard clause to prevent the Hugging Face error
  if (!query || typeof query !== "string") {
    console.warn("Retriever received invalid query:", query);
    return "";
  }

  // 1. Generate embedding for the user's question
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
  );
  const output = await extractor(query, { pooling: "mean", normalize: true });
  const embedding = Array.from(output.data);

  console.log("Vector length:", embedding.length); // Should log 384

  // 2. Call the RPC function we created in Supabase (scoped to user)
  const { data: documents, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: -1.0,
    match_count: 5,
    filter_user_id: userId,
  });

  console.log("Docs found:", documents?.length);

  console.log("First doc preview:", documents?.[0]?.content);

  if (error) throw error;

  // 3. Combine the chunks into a single string
  return documents?.map((doc: any) => doc.content).join("\n\n") || "";
}
