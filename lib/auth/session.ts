import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { can, type Action, type PermissionMap, type ModulePermission } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/supabase/types";

export type CurrentProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  permissions: PermissionMap;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const { data: permissionRows } = await supabase
    .from("role_permissions")
    .select("module_key, can_view, can_edit, can_delete, can_approve, can_publish")
    .eq("role", profile.role);

  const permissions: PermissionMap = {};
  for (const row of permissionRows ?? []) {
    const entry: ModulePermission = {
      view: row.can_view,
      edit: row.can_edit,
      delete: row.can_delete,
      approve: row.can_approve,
      publish: row.can_publish,
    };
    permissions[row.module_key] = entry;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    role: profile.role,
    permissions,
  };
}

/** Server-side guard for a page/route — redirects rather than trusting client-side role checks. */
export async function requireModule(moduleKey: string, action: Action = "view"): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/admin/login");
  if (!can(profile.permissions, moduleKey, action)) redirect("/admin");

  return profile;
}
