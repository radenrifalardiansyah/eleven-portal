"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type MenuGroupInput = {
  label: string;
};

async function nextSortOrder() {
  const supabase = await createClient();
  const { data } = await supabase.from("menu_groups").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  return (data?.[0]?.sort_order ?? -1) + 1;
}

export async function createMenuGroup(input: MenuGroupInput) {
  await requireModule("modules", "edit");
  const supabase = await createClient();
  const sort_order = await nextSortOrder();
  const { error } = await supabase.from("menu_groups").insert({ ...input, sort_order });
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
}

export async function updateMenuGroup(id: string, input: MenuGroupInput) {
  await requireModule("modules", "edit");
  const supabase = await createClient();
  const { error } = await supabase.from("menu_groups").update(input).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
}

export async function deleteMenuGroup(id: string) {
  await requireModule("modules", "delete");
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("group_id", id);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) {
    throw new Error(`Masih ada ${count} menu di dalam modul ini. Pindahkan atau hapus menu tersebut dulu.`);
  }

  const { error } = await supabase.from("menu_groups").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
}

export async function moveMenuGroup(id: string, direction: "up" | "down") {
  await requireModule("modules", "edit");
  const supabase = await createClient();

  const { data: group, error: groupError } = await supabase
    .from("menu_groups")
    .select("id, sort_order")
    .eq("id", id)
    .single();
  if (groupError || !group) throw new Error(groupError?.message ?? "Modul tidak ditemukan");

  const { data: siblings, error: siblingsError } = await supabase
    .from("menu_groups")
    .select("id, sort_order")
    .order("sort_order");
  if (siblingsError) throw new Error(siblingsError.message);

  const index = (siblings ?? []).findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const neighbor = siblings?.[swapIndex];
  if (!neighbor) return; // already at the edge

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("menu_groups").update({ sort_order: neighbor.sort_order }).eq("id", group.id),
    supabase.from("menu_groups").update({ sort_order: group.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin", "layout");
}
