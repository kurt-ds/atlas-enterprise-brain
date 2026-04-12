import { env, pipeline, FeatureExtractionPipeline } from "@huggingface/transformers";

// Configuration to prevent native binary crashes on Vercel
env.allowLocalModels = false;
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.proxy = false;
}

const globalAny = global as any;

/**
 * Singleton pattern for HuggingFace Transformers.
 * By caching the pipeline promise to `globalThis`, we guarantee that Vercel Serverless
 * instances only download/load the 90MB neural net into memory once per active node spin-up.
 * Additionally, caching the raw Promise prevents simultaneous concurrent requests from 
 * redundantly triggering multiple initialization downloads.
 */
export function getModelPipeline(): Promise<FeatureExtractionPipeline> {
  if (!globalAny._transformerPipeline) {
    console.log("[SERVERLESS COLD START] Initializing HuggingFace Transformer Pipeline...");
    globalAny._transformerPipeline = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );
  }
  return globalAny._transformerPipeline;
}
