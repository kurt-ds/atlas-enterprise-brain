import { env, pipeline } from "@huggingface/transformers";

const globalAny = window as any;

/**
 * Singleton pattern for Browser-side Transformers.
 * This runs on the user's hardware (GPU/CPU) instead of Vercel.
 */
export async function getBrowserEmbedding(text: string): Promise<number[]> {
  // 1. Configure for browser environment
  env.allowLocalModels = false;
  env.allowRemoteModels = true;
  
  if (!globalAny._browserPipeline) {
    globalAny._browserPipeline = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );
  }

  const extractor = await globalAny._browserPipeline;
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
