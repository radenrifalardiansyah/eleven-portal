"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type MenuItemInput = {
  group_id: string;
  parent_id: string | null;
  label: string;
  href: string;
  icon: string;
  module_key: string;
  always_visible: boolean;
  show_bottom_nav: boolean;
};

async function nextSortOrder(groupId: string, parentId: string | null) {
  const supabase = await createClient();
  let query = supabase.from("menu_items").select("sort_order").eq("group_id", groupId);
  query = parentId ? query.eq("parent_id", parentId) : query.is("parent_id", null);
  const { data } = await query.order("sort_order", { ascending: false }).limit(1);
  return (data?.[0]?.sort_order ?? -1) + 1;
}

export async function createMenuItem(input: MenuItemInput) {
  await requireModule("menu_structure", "edit");
  const supabase = await createClient();
  const sort_order = await nextSortOrder(input.group_id, input.parent_id);
  const { error } = await supabase.from("menu_items").insert({ ...input, sort_order });
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
}

export async function updateMenuItem(id: string, input: MenuItemInput) {
  await requireModule("menu_structure", "edit");
  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").update(input).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
}

export async function deleteMenuItem(id: string) {
  await requireModule("menu_structure", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
}

export async function moveMenuItem(id: string, direction: "up" | "down") {
  await requireModule("menu_structure", "edit");
  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("menu_items")
    .select("id, group_id, parent_id, sort_order")
    .eq("id", id)
    .single();
  if (itemError || !item) throw new Error(itemError?.message ?? "Menu item tidak ditemukan");

  let siblingsQuery = supabase
    .from("menu_items")
    .select("id, sort_order")
    .eq("group_id", item.group_id);
  siblingsQuery = item.parent_id
    ? siblingsQuery.eq("parent_id", item.parent_id)
    : siblingsQuery.is("parent_id", null);
  const { data: siblings, error: siblingsError } = await siblingsQuery.order("sort_order");
  if (siblingsError) throw new Error(siblingsError.message);

  const index = (siblings ?? []).findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const neighbor = siblings?.[swapIndex];
  if (!neighbor) return; // already at the edge

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("menu_items").update({ sort_order: neighbor.sort_order }).eq("id", item.id),
    supabase.from("menu_items").update({ sort_order: item.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin", "layout");
}
