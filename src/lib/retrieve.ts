import type { SupabaseClient } from "@supabase/supabase-js";

export async function getContext(
  supabase: SupabaseClient,
  query: string,
  userId: string,
  providedEmbedding?: number[],
) {
  // Guard clause
  if (!query || typeof query !== "string") {
    console.warn("Retriever received invalid query:", query);
    return "";
  }

  let embedding = providedEmbedding;

  // If no embedding was provided by the client, try to generate it (will only work in local dev)
  if (!embedding) {
    try {
      const { getModelPipeline } = await import("./model-pipeline");
      const extractor = await getModelPipeline();
      const output = await extractor(query, { pooling: "mean", normalize: true });
      embedding = Array.from(output.data);
    } catch (err) {
      console.error("Server-side embedding failed (expected on Vercel):", err);
      // If we can't generate it, we just return empty context instead of crashing the whole app
      return "";
    }
  }

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
