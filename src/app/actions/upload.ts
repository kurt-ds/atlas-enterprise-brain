"use server";

import { ingestPDF } from "@/lib/ingest";
import { revalidatePath } from "next/cache";

// Define the shape of your state
export type UploadState = {
  success?: boolean;
  error?: string;
} | null;

// The function signature MUST match (prevState, formData)
export async function uploadAction(
  prevState: UploadState, // This is what the hook passes as the first arg
  formData: FormData, // This is the actual form data
): Promise<UploadState> {
  const file = formData.get("file") as File;

  if (!file || file.type !== "application/pdf") {
    return { error: "Please upload a valid PDF file." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await ingestPDF(buffer, file.name);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Ingestion Error:", error);
    return { error: "Failed to process PDF." };
  }
}
