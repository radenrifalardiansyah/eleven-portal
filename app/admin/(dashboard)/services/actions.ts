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
}

export async function updateService(id: string, input: ServiceInput) {
  const profile = await requireModule("services", "edit");
  const supabase = await createClient();
  const status = clampStatus(input.status, can(profile.permissions, "services", "publish"));
  const { error } = await supabase.from("services").update({ ...input, status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${input.slug}`);
}

export async function deleteService(id: string, slug: string) {
  await requireModule("services", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
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
  revalidatePath(`/services/${slug}`);
}
