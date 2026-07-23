"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function updateOwnProfile(fullName: string) {
  const profile = await requireModule("account", "edit");
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/profile");
}
