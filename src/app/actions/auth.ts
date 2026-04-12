"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export type AuthState = {
  error?: string;
  success?: boolean;
  message?: string;
} | null;

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Check if current session is anonymous
  const { data: currentUserData } = await supabase.auth.getUser();
  const oldUserId = currentUserData.user?.is_anonymous ? currentUserData.user.id : null;

  const { data: loginData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Merge anonymous session to logged-in user account if needed
  if (oldUserId && loginData.user?.id && loginData.user.id !== oldUserId) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      // Transfer ownership of uploaded documents to the permanent account
      const { error: docErr } = await adminClient.from("documents").update({ user_id: loginData.user.id }).eq("user_id", oldUserId);
      if (docErr) console.error("Guest Document Migration Error:", docErr);
      
      // Transfer ownership of chat conversations to the permanent account
      const { error: chatErr } = await adminClient.from("conversations").update({ user_id: loginData.user.id }).eq("user_id", oldUserId);
      if (chatErr) console.error("Guest Sessions Migration Error:", chatErr);

      // Optionally, gracefully remove the orphaned anonymous user ID
      const { error: delErr } = await adminClient.auth.admin.deleteUser(oldUserId);
      if (delErr) console.error("Guest Deletion Error:", delErr);
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  // If user is already an anonymous guest, simply updating their user properties solidifies their persistent identity seamlessly
  const { data: { user } } = await supabase.auth.getUser();
  let error;

  if (user?.is_anonymous) {
    const response = await supabase.auth.updateUser({ email, password });
    error = response.error;
  } else {
    const response = await supabase.auth.signUp({ email, password });
    error = response.error;
  }

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Account created successfully.",
  };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
