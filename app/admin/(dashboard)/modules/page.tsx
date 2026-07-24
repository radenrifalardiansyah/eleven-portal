import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { getAllMenuGroups } from "@/lib/cms/menu";
import MenuGroupsClient from "@/components/admin/menu-groups/MenuGroupsClient";

export default async function AdminModulesPage() {
  const profile = await requireModule("modules", "view");
  const groups = await getAllMenuGroups();

  const canEdit = can(profile.permissions, "modules", "edit");
  const canDelete = can(profile.permissions, "modules", "delete");

  return <MenuGroupsClient groups={groups} canEdit={canEdit} canDelete={canDelete} />;
}
