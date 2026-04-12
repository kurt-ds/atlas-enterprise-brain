const globalAny = global as any;

/**
 * Singleton pattern for HuggingFace Transformers using Dynamic Imports.
 * This prevents the library from loading onto the server until it's actually needed.
 */
export async function getModelPipeline() {
  // Force onnxruntime-node to skip loading native bindings
  // @ts-ignore
  process.env.ONNX_RUNTIME_NODE_SKIP_BINDING = "true";

  const { env, pipeline } = await import("@huggingface/transformers");

  // Configuration to prevent native binary crashes on Vercel
  env.allowLocalModels = false;
  env.allowRemoteModels = true;
  if (env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.proxy = false;
  }

  if (!globalAny._transformerPipeline) {
    console.log("[SERVERLESS COLD START] Initializing HuggingFace Transformer Pipeline...");
    globalAny._transformerPipeline = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );
  }
  return globalAny._transformerPipeline;
}
