"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

export type PermissionRowPatch = {
  role: UserRole;
  module_key: string;
  can_view?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  can_approve?: boolean;
  can_publish?: boolean;
};

function assertNotSuperAdmin(role: UserRole) {
  if (role === "super_admin") {
    throw new Error("Hak akses Super Admin tidak bisa diubah — role ini selalu punya akses penuh.");
  }
}

export async function saveRolePermissions(rows: PermissionRowPatch[]) {
  if (rows.length === 0) return;

  await requireModule("role_management", "edit");
  rows.forEach((row) => assertNotSuperAdmin(row.role));

  const supabase = await createClient();
  const { error } = await supabase.from("role_permissions").upsert(rows, { onConflict: "role,module_key" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/roles");
}
