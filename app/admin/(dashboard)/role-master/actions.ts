"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type RoleInput = {
  key: string;
  label: string;
  icon: string;
};

function assertNotSuperAdmin(key: string) {
  if (key === "super_admin") throw new Error("Role Super Admin tidak bisa diubah.");
}

async function nextSortOrder() {
  const supabase = await createClient();
  const { data } = await supabase.from("roles").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  return (data?.[0]?.sort_order ?? -1) + 1;
}

export async function createRole(input: RoleInput) {
  await requireModule("roles", "edit");
  assertNotSuperAdmin(input.key);

  const supabase = await createClient();

  // Must commit on its own before the value is usable — Postgres forbids
  // referencing a freshly-added enum value in the same transaction that added it.
  const { error: enumError } = await supabase.rpc("add_role_enum_value", { p_key: input.key });
  if (enumError) throw new Error(enumError.message);

  const sort_order = await nextSortOrder();
  const { error } = await supabase.from("roles").insert({
    key: input.key,
    label: input.label,
    icon: input.icon,
    sort_order,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
}

export async function updateRole(key: string, input: Omit<RoleInput, "key">) {
  await requireModule("roles", "edit");
  assertNotSuperAdmin(key);

  const supabase = await createClient();
  const { error } = await supabase
    .from("roles")
    .update({
      label: input.label,
      icon: input.icon,
    })
    .eq("key", key);
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
}

export async function moveRole(key: string, direction: "up" | "down") {
  await requireModule("roles", "edit");
  const supabase = await createClient();

  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("key, sort_order")
    .eq("key", key)
    .single();
  if (roleError || !role) throw new Error(roleError?.message ?? "Role tidak ditemukan");

  const { data: siblings, error: siblingsError } = await supabase
    .from("roles")
    .select("key, sort_order")
    .order("sort_order");
  if (siblingsError) throw new Error(siblingsError.message);

  const index = (siblings ?? []).findIndex((s) => s.key === key);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const neighbor = siblings?.[swapIndex];
  if (!neighbor) return; // already at the edge

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("roles").update({ sort_order: neighbor.sort_order }).eq("key", role.key),
    supabase.from("roles").update({ sort_order: role.sort_order }).eq("key", neighbor.key),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin", "layout");
}

export async function deactivateRole(key: string) {
  await requireModule("roles", "delete");
  assertNotSuperAdmin(key);

  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", key);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) throw new Error(`Masih ada ${count} pengguna dengan role ini.`);

  const { error } = await supabase.from("roles").update({ is_active: false }).eq("key", key);
  if (error) throw new Error(error.message);

  revalidatePath("/admin", "layout");
}
