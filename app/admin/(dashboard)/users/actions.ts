"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/supabase/types";

export async function inviteUser(email: string, fullName: string, role: UserRole) {
  await requireModule("users", "edit");

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });
  if (error) throw new Error(error.message);

  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role, full_name: fullName })
    .eq("id", data.user.id);
  if (profileError) throw new Error(profileError.message);

  revalidatePath("/admin/users");
  return { userId: data.user.id };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const profile = await requireModule("users", "edit");
  if (userId === profile.id) throw new Error("Tidak bisa mengubah role akun sendiri.");

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export async function deleteUserAccount(userId: string) {
  const profile = await requireModule("users", "delete");
  if (userId === profile.id) throw new Error("Tidak bisa menghapus akun sendiri.");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export type UserProfileUpdateInput = {
  fullName: string;
  phone: string;
  position: string;
  bio: string;
};

export async function updateUserProfile(userId: string, input: UserProfileUpdateInput) {
  await requireModule("users", "edit");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone.trim() || null,
      position: input.position.trim() || null,
      bio: input.bio.trim() || null,
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export async function updateUserAvatarUrl(userId: string, avatarUrl: string) {
  await requireModule("users", "edit");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl.trim() || null })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

/** Storage RLS for the "avatars" bucket only allows a user to write their own
 *  folder, so an admin editing someone else's avatar must go through the
 *  service-role client here rather than the client-side uploadAvatarFile(). */
export async function uploadUserAvatar(userId: string, formData: FormData) {
  await requireModule("users", "edit");

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("File tidak valid");

  const admin = createAdminClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await admin.storage.from("avatars").upload(path, file, { upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { data } = admin.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = data.publicUrl;

  const { error: profileError } = await admin.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);
  if (profileError) throw new Error(profileError.message);

  revalidatePath("/admin/users");
  return avatarUrl;
}

