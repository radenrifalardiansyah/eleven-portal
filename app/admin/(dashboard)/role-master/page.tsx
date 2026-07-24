import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { getAllRoles } from "@/lib/cms/roles";
import { getAllUsers } from "@/lib/cms/users";
import RoleMasterClient from "@/components/admin/roles-master/RoleMasterClient";

export default async function AdminRoleMasterPage() {
  const profile = await requireModule("roles", "view");
  const [roles, users] = await Promise.all([getAllRoles(), getAllUsers()]);

  const canEdit = can(profile.permissions, "roles", "edit");
  const canDelete = can(profile.permissions, "roles", "delete");

  return <RoleMasterClient roles={roles} users={users} canEdit={canEdit} canDelete={canDelete} />;
}
