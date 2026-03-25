import { pipeline } from "@huggingface/transformers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function getContext(query: string) {
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

  // 2. Call the RPC function we created in Supabase
  const { data: documents, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: -1.0, // Adjust this based on how strict you want the search to be
    match_count: 5, // Top 5 most relevant chunks
  });

  console.log("Docs found:", documents?.length);

  console.log("First doc preview:", documents?.[0]?.content);

  if (error) throw error;

  // 3. Combine the chunks into a single string
  return documents?.map((doc: any) => doc.content).join("\n\n") || "";
}
