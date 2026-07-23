"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Action } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/supabase/types";

type PermissionPatch = Partial<{
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_publish: boolean;
}>;

function buildPatch(action: Action, value: boolean): PermissionPatch {
  switch (action) {
    case "view":
      return { can_view: value };
    case "edit":
      return { can_edit: value };
    case "delete":
      return { can_delete: value };
    case "approve":
      return { can_approve: value };
    case "publish":
      return { can_publish: value };
  }
}

function assertNotSuperAdmin(role: UserRole) {
  if (role === "super_admin") {
    throw new Error("Hak akses Super Admin tidak bisa diubah — role ini selalu punya akses penuh.");
  }
}

export async function updateRolePermission(role: UserRole, moduleKey: string, action: Action, value: boolean) {
  await requireModule("role_management", "edit");
  assertNotSuperAdmin(role);

  const supabase = await createClient();
  const { error } = await supabase
    .from("role_permissions")
    .upsert({ role, module_key: moduleKey, ...buildPatch(action, value) }, { onConflict: "role,module_key" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/roles");
}

export async function bulkUpdateRolePermission(
  role: UserRole,
  moduleKeys: string[],
  action: Action,
  value: boolean
) {
  await requireModule("role_management", "edit");
  assertNotSuperAdmin(role);

  const supabase = await createClient();
  const patch = buildPatch(action, value);
  const rows = moduleKeys.map((moduleKey) => ({ role, module_key: moduleKey, ...patch }));
  const { error } = await supabase.from("role_permissions").upsert(rows, { onConflict: "role,module_key" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/roles");
}
