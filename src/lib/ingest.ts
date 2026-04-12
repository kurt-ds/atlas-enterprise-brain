import { extractText, getDocumentProxy } from "unpdf";
import { getModelPipeline } from "./model-pipeline";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function ingestPDF(
  supabase: SupabaseClient,
  buffer: Buffer,
  fileName: string,
  userId: string,
) {
  try {
    // 1. Load the PDF into a proxy (converts Buffer to Uint8Array automatically)
    const pdf = await getDocumentProxy(new Uint8Array(buffer));

    // 2. Extract all text
    const { text, totalPages } = await extractText(pdf, { mergePages: true });

    // Type-safe check: force it into a string regardless of how TypeScript sees it
    let rawText: string = "";

    if (typeof text === "string") {
      rawText = text;
    } else if (Array.isArray(text)) {
      // If it comes back as an array, join it
      rawText = (text as string[]).join("\n");
    } else {
      // Fallback for unexpected types or 'never'
      rawText = String(text || "");
    }

    if (!rawText || rawText.length < 10) {
      throw new Error("PDF extraction returned no usable text content.");
    }

    // 3. Chunking & Embedding
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments([rawText]);
    const extractor = await getModelPipeline();

    console.log(
      `Feeding ${chunks.length} chunks from "${fileName}" into the brain...`,
    );

    // BATCH INSERTION: Eliminate Vercel timeout issues by vectorizing locally 
    // and sending EXACTLY ONE atomic payload to Supabase instead of N individual inserts.
    const batchedRecords = [];
    
    for (const chunk of chunks) {
      const output = await extractor(chunk.pageContent, {
        pooling: "mean",
        normalize: true,
      });
      const embedding = Array.from(output.data);

      batchedRecords.push({
        content: chunk.pageContent,
        metadata: { fileName, totalPages },
        embedding,
        user_id: userId,
      });
    }

    // Single atomic HTTP database network call
    const { error } = await supabase.from("documents").insert(batchedRecords);

    if (error) {
      console.error("Batch Insert Error:", error);
      throw error;
    }

    console.log("Brain updated successfully.");
    return true;
  } catch (error) {
    console.error("Ingestion failed:", error);
    throw error;
  }
}
