import { createClient } from "@/lib/supabase/server";
import type { NavGroup } from "@/lib/auth/nav";
import type { PermissionMap } from "@/lib/auth/permissions";

export type MenuGroupRow = { id: string; label: string; sort_order: number };
export type MenuItemRow = {
  id: string;
  group_id: string;
  parent_id: string | null;
  label: string;
  href: string;
  icon: string;
  module_key: string;
  sort_order: number;
  always_visible: boolean;
  show_bottom_nav: boolean;
};

export async function getAllMenuGroups(): Promise<MenuGroupRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("menu_groups").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAllMenuItems(): Promise<MenuItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("menu_items").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMenuForRole(permissions: PermissionMap): Promise<NavGroup[]> {
  const [groups, items] = await Promise.all([getAllMenuGroups(), getAllMenuItems()]);

  const visible = items.filter((item) => item.always_visible || permissions[item.module_key]?.view);

  return groups
    .map((group) => ({
      label: group.label,
      items: visible
        .filter((item) => item.group_id === group.id)
        .map((item) => ({
          id: item.id,
          label: item.label,
          href: item.href,
          module: item.module_key,
          icon: item.icon,
          parentId: item.parent_id,
          showBottomNav: item.show_bottom_nav,
        })),
    }))
    .filter((group) => group.items.length > 0);
}
