"use server";

import { ingestPDF } from "@/lib/ingest";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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
  // Authenticate the user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to upload documents." };
  }

  const file = formData.get("file") as File;

  if (!file || file.type !== "application/pdf") {
    return { error: "Please upload a valid PDF file." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "File exceeds the 5 MB limit." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await ingestPDF(supabase, buffer, file.name, user.id);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Ingestion Error:", error);
    return { error: "Failed to process PDF." };
  }
}
