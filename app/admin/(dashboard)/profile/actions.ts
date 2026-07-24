"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ProfileUpdateInput = {
  fullName: string;
  phone: string;
  position: string;
  bio: string;
};

export async function updateOwnProfile(input: ProfileUpdateInput) {
  const profile = await requireModule("account", "edit");
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone.trim() || null,
      position: input.position.trim() || null,
      bio: input.bio.trim() || null,
    })
    .eq("id", profile.id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/profile");
}

export async function updateAvatarUrl(avatarUrl: string) {
  const profile = await requireModule("account", "edit");
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl.trim() || null })
    .eq("id", profile.id);
  if (error) throw new Error(error.message);

  // Avatar shows in the sidebar/header on every admin page, not just /profile.
  revalidatePath("/admin", "layout");
}

export async function updateThemePreference(theme: "light" | "dark" | "system") {
  const profile = await requireModule("account", "edit");
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ theme_preference: theme }).eq("id", profile.id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/profile");
}
