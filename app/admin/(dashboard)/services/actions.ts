"use server";

import { revalidatePath } from "next/cache";
import { requireModule } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/types";

export type ServiceInput = {
  slug: string;
  title: string;
  description: string;
  long_description: string;
  benefits: string[];
  icon: string;
  gallery: string[];
  status: ContentStatus;
  sort_order: number;
};

function clampStatus(status: ContentStatus, canPublish: boolean): ContentStatus {
  if (status === "published" && !canPublish) return "pending";
  return status;
}

export async function createService(input: ServiceInput) {
  const profile = await requireModule("services", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "services", "publish"));
  const { error } = await supabase.from("services").insert({ ...input, status });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function updateService(id: string, input: ServiceInput) {
  const profile = await requireModule("services", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "services", "publish"));
  const { error } = await supabase.from("services").update({ ...input, status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  revalidatePath(`/services/${input.slug}`);
}

export async function deleteService(id: string, slug: string) {
  await requireModule("services", "delete");
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("service_id", id);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) {
    throw new Error(`Masih ada ${count} produk yang memakai layanan ini. Pindahkan produk tersebut ke layanan lain dulu.`);
  }

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  revalidatePath(`/services/${slug}`);
}

export async function deleteServices(items: { id: string; slug: string }[]) {
  await requireModule("services", "delete");
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .in("service_id", items.map((i) => i.id));
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) {
    throw new Error(`Masih ada ${count} produk yang memakai layanan terpilih. Pindahkan produk tersebut ke layanan lain dulu.`);
  }

  const { error } = await supabase
    .from("services")
    .delete()
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  for (const item of items) revalidatePath(`/services/${item.slug}`);
}

export async function reviewServices(items: { id: string; slug: string }[], approve: boolean) {
  await requireModule("services", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ status: approve ? "published" : "draft" })
    .in("id", items.map((i) => i.id));
  if (error) throw new Error(error.message);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  for (const item of items) revalidatePath(`/services/${item.slug}`);
}

export async function moveService(id: string, direction: "up" | "down") {
  await requireModule("services", "edit");
  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("services")
    .select("id, sort_order")
    .eq("id", id)
    .single();
  if (itemError || !item) throw new Error(itemError?.message ?? "Layanan tidak ditemukan");

  const { data: siblings, error: siblingsError } = await supabase
    .from("services")
    .select("id, sort_order")
    .order("sort_order");
  if (siblingsError) throw new Error(siblingsError.message);

  const index = (siblings ?? []).findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const neighbor = siblings?.[swapIndex];
  if (!neighbor) return;

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("services").update({ sort_order: neighbor.sort_order }).eq("id", item.id),
    supabase.from("services").update({ sort_order: item.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function importServices(rows: ServiceInput[]) {
  const profile = await requireModule("services", "edit");
  const supabase = await createClient();
  const canPublish = can(profile.permissions, "services", "publish");
  const clamped = rows.map((r) => ({ ...r, status: clampStatus(r.status, canPublish) }));
  const { error } = await supabase.from("services").upsert(clamped, { onConflict: "slug" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function reviewService(id: string, slug: string, approve: boolean) {
  await requireModule("services", "approve");
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ status: approve ? "published" : "draft" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  revalidatePath(`/services/${slug}`);
}
