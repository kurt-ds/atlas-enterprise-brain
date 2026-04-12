import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Adjust based on your PDF sizes
    },
  },
};

export default nextConfig;
