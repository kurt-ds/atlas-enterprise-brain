import { extractText, getDocumentProxy } from "unpdf";
import { pipeline } from "@huggingface/transformers";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function ingestPDF(buffer: Buffer, fileName: string) {
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

    // 3. Chunking & Embedding (Same as before)
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments([rawText]);
    const extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );

    console.log(
      `Feeding ${chunks.length} chunks from "${fileName}" into the brain...`,
    );

    for (const chunk of chunks) {
      const output = await extractor(chunk.pageContent, {
        pooling: "mean",
        normalize: true,
      });
      const embedding = Array.from(output.data);

      await supabase.from("documents").insert({
        content: chunk.pageContent,
        metadata: { fileName, totalPages },
        embedding,
      });
    }

    console.log("Brain updated successfully.");
    return true;
  } catch (error) {
    console.error("Ingestion failed:", error);
    throw error;
  }
}
