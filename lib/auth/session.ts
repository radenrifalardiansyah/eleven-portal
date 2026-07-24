import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { can, type Action, type PermissionMap, type ModulePermission } from "@/lib/auth/permissions";
import { ACCESS_DENIED_MESSAGE } from "@/lib/auth/errors";
import type { UserRole } from "@/lib/supabase/types";

export type CurrentProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  position: string | null;
  bio: string | null;
  themePreference: string;
  lastSignInAt: string | null;
  role: UserRole;
  roleLabel: string;
  permissions: PermissionMap;
};

/**
 * Memoized per-request: the admin layout and every page both need the
 * profile/permissions, but without this they'd each hit Supabase separately
 * (auth + profiles + role_permissions = 3 round trips, doubled per navigation).
 */
export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, phone, position, bio, theme_preference, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const [{ data: permissionRows }, { data: roleRow }, { data: moduleRows }] = await Promise.all([
    supabase
      .from("role_permissions")
      .select("module_key, can_view, can_edit, can_delete, can_approve, can_publish")
      .eq("role", profile.role),
    supabase.from("roles").select("label, is_super_admin").eq("key", profile.role).single(),
    supabase.from("modules").select("key"),
  ]);

  const permissions: PermissionMap = {};

  if (roleRow?.is_super_admin) {
    // Super Admin always has full access to every module, including ones
    // added after this profile's role_permissions rows were last seeded.
    const fullAccess: ModulePermission = { view: true, edit: true, delete: true, approve: true, publish: true };
    for (const row of moduleRows ?? []) {
      permissions[row.key] = fullAccess;
    }
  } else {
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
  }

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    phone: profile.phone,
    position: profile.position,
    bio: profile.bio,
    themePreference: profile.theme_preference,
    lastSignInAt: user.last_sign_in_at ?? null,
    role: profile.role,
    roleLabel: roleRow?.label ?? profile.role,
    permissions,
  };
});

/**
 * Server-side guard for a page/route or server action — trusted over any
 * client-side role check. Not authenticated at all still redirects to login
 * (nothing to render); missing permission throws instead, so the nearest
 * error.tsx boundary can show "Akses Ditolak" in place, without navigating
 * away or losing the surrounding admin chrome.
 */
export async function requireModule(moduleKey: string, action: Action = "view"): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/admin/login");
  if (!can(profile.permissions, moduleKey, action)) throw new Error(ACCESS_DENIED_MESSAGE);

  return profile;
}
