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

// Super Admin's view/edit/delete/approve always stay full — only
// can_publish ("Tampil di Portal") is a real, editable permission for this
// role too, same as Admin, since the public portal doesn't check roles at
// all; this only governs who's allowed to make content go live.
function assertSuperAdminIntegrity(row: PermissionRowPatch) {
  if (row.role !== "super_admin") return;
  const alwaysFullFields = ["can_view", "can_edit", "can_delete", "can_approve"] as const;
  for (const field of alwaysFullFields) {
    if (row[field] === false) {
      throw new Error("View, Edit, Delete, dan Approve untuk Super Admin selalu penuh dan tidak bisa diubah.");
    }
  }
}

export async function saveRolePermissions(rows: PermissionRowPatch[]) {
  if (rows.length === 0) return;

  await requireModule("role_management", "edit");
  rows.forEach(assertSuperAdminIntegrity);

  // "Tampil di Portal" (can_publish) may only be granted to Admin or Super
  // Admin — every other role must never be able to publish content live.
  const sanitizedRows = rows.map((row) =>
    row.role === "admin" || row.role === "super_admin" || row.can_publish === undefined
      ? row
      : { ...row, can_publish: false }
  );

  const supabase = await createClient();
  const { error } = await supabase.from("role_permissions").upsert(sanitizedRows, { onConflict: "role,module_key" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/roles");
}
