import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

export type RoleRow = {
  key: UserRole;
  label: string;
  icon: string;
  sort_order: number;
  is_super_admin: boolean;
  is_active: boolean;
};

export async function getAllRoles(): Promise<RoleRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("roles").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getActiveRoles(): Promise<RoleRow[]> {
  const roles = await getAllRoles();
  return roles.filter((r) => r.is_active);
}
