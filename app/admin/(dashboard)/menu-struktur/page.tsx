import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { getAllMenuGroups, getAllMenuItems } from "@/lib/cms/menu";
import { getAllModules } from "@/lib/cms/modules";
import MenuClient from "@/components/admin/menu/MenuClient";

export default async function MenuStrukturPage() {
  const profile = await requireModule("menu_structure", "view");
  const [groups, items, modules] = await Promise.all([getAllMenuGroups(), getAllMenuItems(), getAllModules()]);

  const canEdit = can(profile.permissions, "menu_structure", "edit");
  const canDelete = can(profile.permissions, "menu_structure", "delete");

  return <MenuClient groups={groups} items={items} modules={modules} canEdit={canEdit} canDelete={canDelete} />;
}
