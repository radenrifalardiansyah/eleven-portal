import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getAllMenuGroups, getAllMenuItems } from "@/lib/cms/menu";
import { getAllUsers } from "@/lib/cms/users";
import RolesClient from "@/components/admin/roles/RolesClient";

export default async function AdminRolesPage() {
  await requireModule("role_management", "view");

  const supabase = await createClient();
  const [groups, items, users, permissionsResult] = await Promise.all([
    getAllMenuGroups(),
    getAllMenuItems(),
    getAllUsers(),
    supabase
      .from("role_permissions")
      .select("role, module_key, can_view, can_edit, can_delete, can_approve, can_publish"),
  ]);

  if (permissionsResult.error) throw new Error(permissionsResult.error.message);

  const permissionItems = items.filter((item) => !item.always_visible);

  return (
    <RolesClient
      groups={groups}
      items={permissionItems}
      permissions={permissionsResult.data ?? []}
      users={users}
    />
  );
}
