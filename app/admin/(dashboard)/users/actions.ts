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

