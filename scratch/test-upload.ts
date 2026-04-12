import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

async function testGuestUpload() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Sign in anonymously
  console.log("Signing in anonymously...");
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("Auth error:", error);
    return;
  }
  
  const user = data.user;
  console.log("Anonymous User ID:", user?.id);

  // 2. Try inserting a mock document
  if (user) {
    console.log("Attempting to insert test document...");
    const { error: insertError } = await supabase.from("documents").insert({
      content: "test",
      metadata: { fileName: "test.pdf", totalPages: 1 },
      embedding: Array(384).fill(0), // Dummy vector
      user_id: user.id
    });

    if (insertError) {
      console.error("Insert error:", insertError.message || insertError);
    } else {
      console.log("Insert successful!");
    }
  }
}

testGuestUpload();
