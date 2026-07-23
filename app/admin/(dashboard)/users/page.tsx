import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { getAllUsers } from "@/lib/cms/users";
import UsersClient from "@/components/admin/users/UsersClient";

export default async function AdminUsersPage() {
  const profile = await requireModule("users", "view");
  const users = await getAllUsers();

  const canCreate = can(profile.permissions, "users", "edit");
  const canEdit = can(profile.permissions, "users", "edit");
  const canDelete = can(profile.permissions, "users", "delete");

  return (
    <UsersClient
      users={users}
      currentUserId={profile.id}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  );
}
