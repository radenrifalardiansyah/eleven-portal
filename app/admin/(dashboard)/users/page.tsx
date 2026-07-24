import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { getAllUsers } from "@/lib/cms/users";
import { getActiveRoles } from "@/lib/cms/roles";
import UsersClient from "@/components/admin/users/UsersClient";

export default async function AdminUsersPage() {
  const profile = await requireModule("users", "view");
  const [users, roles] = await Promise.all([getAllUsers(), getActiveRoles()]);

  const canCreate = can(profile.permissions, "users", "edit");
  const canEdit = can(profile.permissions, "users", "edit");
  const canDelete = can(profile.permissions, "users", "delete");

  return (
    <UsersClient
      users={users}
      roles={roles}
      currentUserId={profile.id}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  );
}
