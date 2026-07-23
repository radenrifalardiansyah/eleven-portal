import type { UserRole } from "@/lib/supabase/types";

export type Action = "view" | "edit" | "delete" | "approve" | "publish";

export const ALL_ROLES: UserRole[] = ["super_admin", "admin", "editor", "employee", "finance"];

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  employee: "Employee",
  finance: "Finance",
};

export type ModulePermission = {
  view: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  publish: boolean;
};

export type PermissionMap = Record<string, ModulePermission>;

// These two module keys are always accessible to any authenticated user —
// they aren't rows in role_permissions (nothing to toggle), matching
// menu_items.always_visible for the Dashboard and Pengaturan Profil entries.
const ALWAYS_ALLOWED_MODULES = new Set(["dashboard", "account"]);

export function can(
  permissions: PermissionMap | null | undefined,
  moduleKey: string,
  action: Action
): boolean {
  if (ALWAYS_ALLOWED_MODULES.has(moduleKey)) return true;
  if (!permissions) return false;
  return permissions[moduleKey]?.[action] ?? false;
}
